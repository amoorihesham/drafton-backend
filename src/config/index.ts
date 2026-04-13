import { Type, Static } from "@sinclair/typebox";

export const ConfigSchema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("production"),
      Type.Literal("test"),
    ],
    {
      default: "development",
    },
  ),
  DATABASE_URL: Type.String(),
  DB_POOL_SIZE: Type.Number({ default: 10 }),
  UPSTASH_REDIS_REST_URL: Type.String(),
  UPSTASH_REDIS_REST_TOKEN: Type.String(),
  SALT_ROUNDS: Type.Number({ default: 12 }),
  OTP_EXPIRY_MINUTES: Type.Number({ default: 15 }),
  RESET_OTP_EXPIRY_MINUTES: Type.Number({ default: 30 }),
  JWT_ACCESS_SECRET: Type.String(),
  JWT_REFRESH_SECRET: Type.String(),
  JWT_ACCESS_TOKEN_EXPIRY: Type.String({ default: "15m" }),
  JWT_REFRESH_TOKEN_EXPIRY: Type.Number({ default: 60 * 60 * 24 * 7 }),
  SMTP_HOST: Type.String({ default: "smtp-relay.brevo.com" }),
  SMTP_PORT: Type.Number({ default: 587 }),
  SMTP_USER: Type.String(),
  SMTP_PASS: Type.String(),
  SMTP_FROM: Type.String(),
});

export type Config = Static<typeof ConfigSchema>;
