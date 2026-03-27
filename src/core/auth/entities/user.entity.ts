export type UserRole = "provider" | "client";

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly isEmailVerified: boolean,
    public readonly emailVerificationOtp: string,
    public readonly emailVerificationOtpExpiry: Date,
    public readonly passwordResetOtp: string,
    public readonly passwordResetOtpExpiry: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isVerified(): boolean {
    return this.isEmailVerified;
  }

  isClient(): boolean {
    return this.role === "client";
  }

  isProvider(): boolean {
    return this.role === "provider";
  }
}
