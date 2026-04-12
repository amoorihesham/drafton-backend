import { eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { refreshTokens, users } from "../schema/index.js";
import { IAuthRepository } from "../../../core/auth/interfaces/auth.repository.interface.js";
import { UserEntity } from "../../../core/auth/entities/user.entity.js";
import { CreateUserDto } from "../../../core/auth/dtos/register.dto.js";

export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) {}

  async findUserByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async findUserById(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async findUserByUsername(username: string) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async createUser(dto: CreateUserDto) {
    const result = await this.db
      .insert(users)
      .values({
        email: dto.email,
        username: dto.username,
        passwordHash: dto.passwordHash,
        isActive: true,
        isEmailVerified: false,
      })
      .returning();

    return this.toEntity(result[0]);
  }

  async updateUser(userId: string, dto: Partial<UserEntity>) {
    const result = await this.db.update(users).set(dto).where(eq(users.id, userId)).returning();
    return this.toEntity(result[0]);
  }
  async deleteUser(userId: string) {
    await this.db.delete(users).where(eq(users.id, userId));
  }
  async verifyEmail(userId: string) {
    await this.db
      .update(users)
      .set({
        isEmailVerified: true,
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
  async clearEmailVerificationOtp(userId: string) {
    await this.db
      .update(users)
      .set({
        emailVerificationOtp: null,
        emailVerificationOtpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    await this.db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
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
