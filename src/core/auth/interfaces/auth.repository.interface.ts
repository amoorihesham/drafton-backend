import { CreateUserDto } from "../dtos/register.dto";
import { UserEntity } from "../entities/user.entity";

export interface IAuthRepository {
  // user operations
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  findUserByUsername(username: string): Promise<UserEntity | null>;

  createUser(dto: CreateUserDto): Promise<UserEntity>;
  updateUser(userId: string, dto: Partial<UserEntity>): Promise<UserEntity>;
  deleteUser(userId: string): Promise<void>;

  // verification
  saveEmailVerificationOtp(userId: string, otp: string, expiry: Date): Promise<void>;
  clearEmailVerificationOtp(userId: string): Promise<void>;

  // refresh token
  saveRefreshToken(userId: string, token: string): Promise<void>;
}
