import { pgTable, uuid, text, boolean, timestamp, pgEnum, bigserial, index } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["provider", "client", "admin"]);

export const users = pgTable(
  "users",
  {
    internal_id: bigserial("internal_id", { mode: "number" }).primaryKey(),
    id: uuid("id").notNull().defaultRandom(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("client"),
    isActive: boolean("is_active").notNull().default(true),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    emailVerificationOtp: text("email_verification_otp"),
    emailVerificationOtpExpiry: timestamp("email_verification_otp_expiry"),
    passwordResetOtp: text("password_reset_otp"),
    passwordResetOtpExpiry: timestamp("password_reset_otp_expiry"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("users_internal_id_idx").on(table.internal_id)],
);
