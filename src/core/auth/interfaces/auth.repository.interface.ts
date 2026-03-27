import { RegisterDto } from "../dtos/register.dto";
import { UserEntity } from "../entities/user.entity";

export interface IAuthRepository {
  // user operations
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  createUser(dto: RegisterDto): Promise<UserEntity>;

  // verification
  saveEmailVerificationOtp(userId: string, otp: string, expiry: Date): Promise<void>;
  verifyEmail(userId: string): Promise<void>;

  // password reset
  savePasswordResetOtp(userId: string, otp: string, expiry: Date): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  // refresh token (still needs separate storage)
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null>;
  deleteRefreshToken(token: string): Promise<void>;
}
