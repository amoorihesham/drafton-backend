export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly mailService: IMailService,
    private readonly config: AuthConfig,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      throw new AuthError(
        AUTH_MESSAGES.EMAIL_TAKEN,
        STATUS_CODES.CONFLICT,
        AUTH_ERROR_CODES.EMAIL_TAKEN,
      );
    }

    const existingUsername = await this.authRepository.findUserByUsername(
      dto.username,
    );
    if (existingUsername) {
      throw new AuthError(
        AUTH_MESSAGES.USERNAME_TAKEN,
        STATUS_CODES.CONFLICT,
        AUTH_ERROR_CODES.USERNAME_TAKEN,
      );
    }
    // hash the password
    const passwordHash = await hash(dto.password);

    // create the user
    const user = await this.authRepository.createUser({
      ...dto,
      passwordHash,
    });

    // generate otp and expiry
    const { otp, expiry } = this.otpService.generateVerficationOtp();

    // save otp
    await this.authRepository.saveEmailVerificationOtp(user.id, otp, expiry);

    // send verification email
    await this.mailService.sendVerificationEmail(user.email, otp);

    return toUserResponseDto(user);
  }

  async login(dto: LoginDto): Promise<UserResponseDto> {
    const exist = await this.authRepository.findUserByEmail(dto.email);
    console.log(dto);

    if (!exist)
      throw new AuthError(
        AUTH_MESSAGES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        AUTH_ERROR_CODES.USER_NOT_FOUND,
      );

    const isValidPassword = await this.passwordManager.compare(
      dto.password,
      exist.passwordHash,
    );
    if (!isValidPassword)
      throw new AuthError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      );

    if (!exist.isEmailVerified)
      throw new AuthError(
        AUTH_MESSAGES.EMAIL_NOT_VERIFIED,
        STATUS_CODES.UNAUTHORIZED,
        AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
      );

    const accessToken = this.jwtService.generateAccessToken({
      user_id: exist.id,
      role: exist.role,
      email: exist.email,
    });
    const refreshToken = this.jwtService.generateRefreshToken({
      user_id: exist.id,
      role: exist.role,
      email: exist.email,
    });
    await this.refreshTokenStore.save(
      refreshToken,
      exist.id,
      dto.deviceId,
      60 * 60 * 24 * 7,
    );
    return { ...toUserResponseDto(exist), accessToken, refreshToken };
  }

  async refreshToken(dto: RefreshDto) {
    const { token, deviceId } = dto;
    const decode = this.jwtService.verifyRefreshToken(token);

    const valid = await this.refreshTokenStore.verify(
      token,
      decode.user_id,
      deviceId,
    );
    console.log(valid, "HERERERE");

    if (!valid)
      throw new AuthError(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        STATUS_CODES.UNAUTHORIZED,
        AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
      );

    const newAccessToken = this.jwtService.generateAccessToken({
      email: decode.email,
      user_id: decode.user_id,
      role: decode.role,
    });
    const newRefreshToken = this.jwtService.generateRefreshToken({
      email: decode.email,
      user_id: decode.user_id,
      role: decode.role,
    });

    await this.refreshTokenStore.save(
      newRefreshToken,
      decode.user_id,
      deviceId,
      60 * 60 * 24 * 7,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async verifyEmail(email: string, otp: string): Promise<UserResponseDto> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new AuthError(
        AUTH_MESSAGES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        AUTH_ERROR_CODES.USER_NOT_FOUND,
      );
    }
    if (!user.emailVerificationOtp) {
      throw new AuthError(
        AUTH_MESSAGES.OTP_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        AUTH_ERROR_CODES.OTP_NOT_FOUND,
      );
    }
    const isValidOtp = this.otpService.verifyOtp({
      userOtp: otp,
      otp: user.emailVerificationOtp,
      expiry: user.emailVerificationOtpExpiry,
    });
    if (!isValidOtp) {
      throw new AuthError(
        AUTH_MESSAGES.INVALID_OTP,
        STATUS_CODES.UNAUTHORIZED,
        AUTH_ERROR_CODES.INVALID_OTP,
      );
    }

    // clear the otp
    await this.authRepository.clearEmailVerificationOtp(user.id);

    // update user as verified
    const updatedUser = await this.authRepository.updateUser(user.id, {
      isEmailVerified: true,
    });

    return toUserResponseDto(updatedUser);
  }
}
