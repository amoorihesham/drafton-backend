import bcrypt from "bcrypt";
import { IAuthRepository } from "./interfaces/auth.repository.interface";
import { ITokenService } from "../shared/interfaces/token.service.interface";
import { IMailService } from "../shared/interfaces/mail.service.interface";
import { AuthTokensDto, RegisterDto } from "./dtos/register.dto";
import { AuthError } from "../shared/errors/http.errors";
import { IAuthConfig } from "./config/auth.config.interface";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./auth.constants";
import { UserEntity } from "./entities/user.entity";
import { toUserResponseDto, UserResponseDto } from "./dtos/user.response.dto";
import { STATUS_CODES } from "@/infrastructure/http/http.constans";
import { IOtpService } from "../shared/interfaces/otp.service.interface";

export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly otpService: IOtpService,
    private readonly mailService: IMailService,
    private readonly config: IAuthConfig,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    // check email is not already taken
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      throw new AuthError(AUTH_MESSAGES.EMAIL_TAKEN, STATUS_CODES.CONFLICT, AUTH_ERROR_CODES.EMAIL_TAKEN);
    }

    const existingUsername = await this.authRepository.findUserByUsername(dto.username);
    if (existingUsername) {
      throw new AuthError(AUTH_MESSAGES.USERNAME_TAKEN, STATUS_CODES.CONFLICT, AUTH_ERROR_CODES.USERNAME_TAKEN);
    }
    // hash the password
    const passwordHash = await bcrypt.hash(dto.password, this.config.saltRounds);

    // create the user
    const user = await this.authRepository.createUser({
      ...dto,
      passwordHash,
    });

    // generate otp and expiry
    const { otp, expiry } = this.otpService.generateOtp(this.config.otpExpiryMinutes);

    // save otp
    await this.authRepository.saveEmailVerificationOtp(user.id, otp, expiry);

    // send verification email
    await this.mailService.sendVerificationEmail(user.email, otp);

    return toUserResponseDto(user);
  }

  async verifyEmail(email: string, otp: string): Promise<UserResponseDto> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new AuthError(AUTH_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, AUTH_ERROR_CODES.USER_NOT_FOUND);
    }
    if (!user.emailVerificationOtp) {
      throw new AuthError(AUTH_MESSAGES.OTP_NOT_FOUND, STATUS_CODES.NOT_FOUND, AUTH_ERROR_CODES.OTP_NOT_FOUND);
    }
    const isValidOtp = this.otpService.verifyOtp({
      userOtp: otp,
      otp: user.emailVerificationOtp,
      expiry: user.emailVerificationOtpExpiry,
    });
    if (!isValidOtp) {
      throw new AuthError(AUTH_MESSAGES.INVALID_OTP, STATUS_CODES.UNAUTHORIZED, AUTH_ERROR_CODES.INVALID_OTP);
    }

    // clear the otp
    await this.authRepository.clearEmailVerificationOtp(user.id);

    // update user as verified
    const updatedUser = await this.authRepository.updateUser(user.id, { isEmailVerified: true });

    return toUserResponseDto(updatedUser);
  }
}
