import { Type, Static } from "@sinclair/typebox";

export const ConfigSchema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Union([Type.Literal("development"), Type.Literal("production"), Type.Literal("test")], {
    default: "development",
  }),
  FRONTEND_URL: Type.String(),
  SALT_ROUNDS: Type.Number({ default: 12 }),
  OTP_EXPIRY_MINUTES: Type.Number({ default: 15 }),
  RESET_OTP_EXPIRY_MINUTES: Type.Number({ default: 30 }),
  JWT_ACCESS_SECRET: Type.String(),
  JWT_REFRESH_SECRET: Type.String(),
  JWT_ACCESS_TOKEN_EXPIRY: Type.Number({ default: 15 * 60 * 1000 }),
  JWT_REFRESH_TOKEN_EXPIRY: Type.Number({ default: 60 * 60 * 24 * 7 }),
  DATABASE_URL: Type.String(),
  DB_POOL_SIZE: Type.Number({ default: 10 }),
  UPSTASH_REDIS_REST_URL: Type.String(),
  UPSTASH_REDIS_REST_TOKEN: Type.String(),

  SMTP_HOST: Type.String({ default: "smtp-relay.brevo.com" }),
  SMTP_PORT: Type.Number({ default: 587 }),
  SMTP_USER: Type.String(),
  SMTP_PASS: Type.String(),
  SMTP_FROM: Type.String(),

  AI_PROVIDER: Type.Union([Type.Literal("anthropic"), Type.Literal("fixture")], { default: "anthropic" }),
  ANTHROPIC_API_KEY: Type.String({ default: "" }),
  ANTHROPIC_MODEL: Type.String({ default: "claude-sonnet-4-6" }),
  AI_MAX_TOKENS: Type.Number({ default: 8000 }),
  AI_TIMEOUT_MS: Type.Number({ default: 60000 }),
});

export type Config = Static<typeof ConfigSchema>;
