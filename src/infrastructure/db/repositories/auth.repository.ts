import { eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { users, refreshTokens } from "../schema/index.js";
import { IAuthRepository } from "../../../core/auth/interfaces/auth.repository.interface.js";
import { UserEntity } from "../../../core/auth/entities/user.entity.js";
import { CreateUserDto } from "../../../core/auth/dtos/register.dto.js";

export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) {}

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async findUserByUsername(username: string): Promise<UserEntity | null> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const result = await this.db
      .insert(users)
      .values({
        email: dto.email,
        username: dto.username,
        passwordHash: dto.passwordHash,
        role: dto.role,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.toEntity(result[0]);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationOtp: null,
        emailVerificationOtpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetOtp: null,
        passwordResetOtpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async saveEmailVerificationOtp(userId: string, otp: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async savePasswordResetOtp(userId: string, otp: string, expiry: Date): Promise<void> {
    await this.db
      .update(users)
      .set({
        passwordResetOtp: otp,
        passwordResetOtpExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    });
  }

  async findRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const result = await this.db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1);

    if (!result[0]) return null;

    return {
      userId: result[0].userId,
      expiresAt: result[0].expiresAt,
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  // ─── Private ────────────────────────────────────────────────

  private toEntity(row: typeof users.$inferSelect): UserEntity {
    return new UserEntity(
      row.id,
      row.email,
      row.username,
      row.passwordHash,
      row.role,
      row.isActive,
      row.isEmailVerified,
      row.emailVerificationOtp!,
      row.emailVerificationOtpExpiry!,
      row.passwordResetOtp!,
      row.passwordResetOtpExpiry!,
      row.createdAt,
      row.updatedAt,
    );
  }
}
