export type AuthConfig = {
  SALT_ROUNDS: number;
  OTP_EXPIRY_MINUTES: number;
  RESET_OTP_EXPIRY_MINUTES: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRY: number;
  JWT_REFRESH_TOKEN_EXPIRY: number;
};

export type JwtPayload = Pick<
  FullUserType,
  "email" | "username" | "role" | "isActive" | "isEmailVerified"
>;

export type FullUserType = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: "provider" | "client";
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationOtp: string | null;
  emailVerificationOtpExpiry: Date | null;
  passwordResetOtp: string | null;
  passwordResetOtpExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserDto = {
  email: string;
  username: string;
  password: string;
};

export type UserDtoType = Omit<
  FullUserType,
  | "passwordHash"
  | "emailVerificationOtp"
  | "emailVerificationOtpExpiry"
  | "passwordResetOtp"
  | "passwordResetOtpExpiry"
>;
