import { Type, Static } from "@sinclair/typebox";

export const ConfigSchema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Union([Type.Literal("development"), Type.Literal("production"), Type.Literal("test")], {
    default: "development",
  }),
  DATABASE_URL: Type.String(),
  DB_POOL_SIZE: Type.Number({ default: 10 }),
  SALT_ROUNDS:Type.Number({default:12}),
  OTP_EXPIRY_MINUTES:Type.Number({default:15}),
  RESET_OTP_EXPIRY_MINUTES:Type.Number({default:30}),
});

export type Config = Static<typeof ConfigSchema>;
