import bcrypt from "bcrypt";
import { IAuthRepository } from "./interfaces/auth.repository.interface";
import { ITokenService } from "../shared/interfaces/token.service.interface";
import { IMailService } from "../shared/interfaces/mail.service.interface";
import { AuthTokensDto, RegisterDto } from "./dtos/register.dto";
import { ConflictException } from "../shared/errors/http.errors";
import { IAuthConfig } from "./config/auth.config.interface";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "./auth.constants";
import { UserEntity } from "./entities/user.entity";

export class AuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenService: ITokenService,
    private readonly mailService: IMailService,
    private readonly config: IAuthConfig,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    // check email is not already taken
    const existingEmail = await this.authRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_TAKEN, AUTH_ERROR_CODES.EMAIL_TAKEN);
    }

    // hash the password
    const passwordHash = await bcrypt.hash(dto.password, this.config.saltRounds);

    // create the user
    const user = await this.authRepository.createUser({
      ...dto,
      passwordHash,
    });

    // generate otp and expiry
    const otp = this.tokenService.generateOtp();
    const expiry = this.getOtpExpiry(this.config.otpExpiryMinutes);

    // save otp
    await this.authRepository.saveEmailVerificationOtp(user.id, otp, expiry);

    // send verification email
    await this.mailService.sendVerificationEmail(user.email, otp);

    return { message: "Registration successful. Please check your email for the verification OTP." };
  }

  // ─── Private Helpers ──────────────────────────────────────────

  private async generateAndSaveTokens(user: UserEntity): Promise<AuthTokensDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private getOtpExpiry(minutes: number): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
  }
}
