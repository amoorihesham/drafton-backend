import { User } from "@/types/shared/user";

export type AuthConfig = {
  SALT_ROUNDS: number;
  OTP_EXPIRY_MINUTES: number;
  RESET_OTP_EXPIRY_MINUTES: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRY: number;
  JWT_REFRESH_TOKEN_EXPIRY: number;
};

export type JwtPayload = Pick<User, "email" | "username" | "role" | "isActive" | "isEmailVerified" | "id">;

export type CreateUserDto = {
  email: string;
  username: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
  deviceId: string;
};

export type RefreshDto = {
  token: string;
  deviceId: string;
};

export type VerifyEmailDto = {
  email: string;
  otp: string;
};
