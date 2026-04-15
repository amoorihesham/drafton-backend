import { IMailService } from "@/shared/services/mail/mail.service.interface";
import {
  AuthConfig,
  CreateUserDto,
  FullUserType,
  LoginDto,
  RefreshDto,
  UserResponseDto,
} from "./types";
import { AuthError } from "@/shared/errors/http.errors";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./constants/messages";
import { STATUS_CODES } from "@/shared/http/CONSTANTS";
import { compare, hash } from "./utils/hasing";
import { generateOtp, verifyOtp } from "./utils/otp";
import { generateJwtToken, verifyJwtToken } from "./utils/jwt";
import { ITokenStroe } from "./interfaces/token-store.interface";
import { IAuthRepository } from "./interfaces/repository.interface";

export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly mailService: IMailService,
    private readonly refreshTokenStore: ITokenStroe,
    private readonly config: AuthConfig,
  ) {}

  async register(dto: CreateUserDto): Promise<UserResponseDto> {
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
    const [user] = await this.authRepository.createUser({
      ...dto,
      password: passwordHash,
    });

    // generate otp and expiry
    const { otp, expiry } = generateOtp(this.config.OTP_EXPIRY_MINUTES);

    // save otp
    await this.authRepository.saveEmailVerificationOtp(user.id, otp, expiry);

    // send verification email
    await this.mailService.sendVerificationEmail(user.email, otp);

    return this.toUserResponseDto(user);
  }

  async login(dto: LoginDto): Promise<UserResponseDto> {
    const exist = await this.authRepository.findUserByEmail(dto.email);

    if (!exist)
      throw new AuthError(
        AUTH_MESSAGES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        AUTH_ERROR_CODES.USER_NOT_FOUND,
      );

    const isValidPassword = await compare(dto.password, exist.passwordHash);
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

    const accessToken = generateJwtToken(
      {
        id: exist.id,
        email: exist.email,
        role: exist.role,
        username: exist.username,
        isActive: exist.isActive,
        isEmailVerified: exist.isEmailVerified,
      },
      this.config.JWT_ACCESS_SECRET,
      this.config.JWT_ACCESS_TOKEN_EXPIRY,
    );
    const refreshToken = generateJwtToken(
      {
        id: exist.id,
        email: exist.email,
        role: exist.role,
        username: exist.username,
        isActive: exist.isActive,
        isEmailVerified: exist.isEmailVerified,
      },
      this.config.JWT_REFRESH_SECRET,
      this.config.JWT_REFRESH_TOKEN_EXPIRY,
    );
    await this.refreshTokenStore.save(
      refreshToken,
      exist.id,
      dto.deviceId,
      this.config.JWT_REFRESH_TOKEN_EXPIRY,
    );
    return { ...this.toUserResponseDto(exist), accessToken, refreshToken };
  }

  async refreshToken(dto: RefreshDto) {
    const { token, deviceId } = dto;
    if (!token)
      throw new AuthError(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        STATUS_CODES.BAD_REQUEST,
        AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
      );
    const decode = verifyJwtToken(token, this.config.JWT_REFRESH_SECRET);

    const valid = await this.refreshTokenStore.verify(
      token,
      decode.id,
      deviceId,
    );

    if (!valid)
      throw new AuthError(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
        STATUS_CODES.UNAUTHORIZED,
        AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
      );

    const newAccessToken = generateJwtToken(
      {
        id: decode.id,
        email: decode.email,
        role: decode.role,
        username: decode.username,
        isActive: decode.isActive,
        isEmailVerified: decode.isEmailVerified,
      },
      this.config.JWT_ACCESS_SECRET,
      this.config.JWT_ACCESS_TOKEN_EXPIRY,
    );
    const newRefreshToken = generateJwtToken(
      {
        id: decode.id,
        email: decode.email,
        role: decode.role,
        username: decode.username,
        isActive: decode.isActive,
        isEmailVerified: decode.isEmailVerified,
      },
      this.config.JWT_REFRESH_SECRET,
      this.config.JWT_REFRESH_TOKEN_EXPIRY,
    );

    await this.refreshTokenStore.save(
      newRefreshToken,
      decode.id,
      deviceId,
      this.config.JWT_REFRESH_TOKEN_EXPIRY,
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
    const isValidOtp = verifyOtp({
      userOtp: user.emailVerificationOtp,
      otp: otp,
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
    const [updatedUser] = await this.authRepository.updateUser(user.id, {
      isEmailVerified: true,
    });

    return this.toUserResponseDto(updatedUser);
  }

  private toUserResponseDto(user: FullUserType): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
