import { eq } from "drizzle-orm";
import { Database } from "../connection.js";
import { users } from "../schema/index.js";
import { IAuthRepository } from "@/modules/auth/repository.interface.js";
import { CreateUserDto, FullUserType } from "@/modules/auth/types/index.js";

export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: Database) {}

  async findUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findUserById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findUserByUsername(username: string) {
    return this.db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  async createUser(dto: CreateUserDto) {
    return await this.db
      .insert(users)
      .values({
        email: dto.email,
        username: dto.username,
        passwordHash: dto.password,
        isActive: true,
        isEmailVerified: false,
      })
      .returning();
  }

  async updateUser(userId: string, dto: Partial<FullUserType>) {
    return this.db
      .update(users)
      .set(dto)
      .where(eq(users.id, userId))
      .returning();
  }
  async deleteUser(userId: string) {
    return this.db.delete(users).where(eq(users.id, userId));
  }
  async verifyEmail(userId: string) {
    return this.db
      .update(users)
      .set({
        isEmailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.db
      .update(users)
      .set({
        passwordHash,
        passwordResetOtp: null,
        passwordResetOtpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async saveEmailVerificationOtp(userId: string, otp: string, expiry: Date) {
    return this.db
      .update(users)
      .set({
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
  async clearEmailVerificationOtp(userId: string) {
    return this.db
      .update(users)
      .set({
        emailVerificationOtp: null,
        emailVerificationOtpExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}
