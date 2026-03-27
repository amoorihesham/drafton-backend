import { Type, Static } from "@sinclair/typebox";

export const ConfigSchema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Union([Type.Literal("development"), Type.Literal("production"), Type.Literal("test")], {
    default: "development",
  }),
  DATABASE_URL: Type.String(),
  DB_POOL_SIZE: Type.Number({ default: 10 }),
});

export type Config = Static<typeof ConfigSchema>;
