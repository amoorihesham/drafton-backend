import Fastify, { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import envPlugin from "@fastify/env";
import { ConfigSchema } from "./config/index.js";
import { errorHandler } from "./infrastructure/http/error-handler.js";
import { createDatabaseConnection } from "./infrastructure/db/connection.js";
import { MailService } from "./infrastructure/mail/mail.service.js";
import { authRoutes } from "./infrastructure/http/routes/auth.routes.js";
import { createAuthContainer } from "./infrastructure/containers/auth.container.js";
import { OtpService } from "./infrastructure/otp/otp.service.js";
import { JwtService } from "./core/auth/jwt.service.js";
import cookie from "@fastify/cookie";
import { Redis } from "@upstash/redis";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test" &&
      process.env.NODE_ENV !== "production" && {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
            messageFormat: "{msg} {req.method} {req.url}",
          },
        },
      },
  });
  const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

  await app.register(envPlugin, {
    schema: ConfigSchema,
    dotenv: { path: envFile },
  });

  await app.register(helmet);
  await app.register(cors);
  await app.register(cookie);

  const db = await createDatabaseConnection(
    app.config.DATABASE_URL,
    app.config.DB_POOL_SIZE,
  );
  const redis = Redis.fromEnv();

  //GLOBAL_SERVICES
  const jwtService = new JwtService({
    accessTokenExpiry: app.config.JWT_ACCESS_TOKEN_EXPIRY,
    jwtAccessSecret: app.config.JWT_ACCESS_SECRET,
    jwtRefreshSecret: app.config.JWT_REFRESH_SECRET,
    refreshTokenExpiry: app.config.JWT_REFRESH_TOKEN_EXPIRY,
  });
  const mailService = new MailService({
    host: app.config.SMTP_HOST,
    port: app.config.SMTP_PORT,
    user: app.config.SMTP_USER,
    pass: app.config.SMTP_PASS,
    from: app.config.SMTP_FROM,
  });
  const otpService = new OtpService();

  //CONTAINERS
  const { authController } = createAuthContainer(
    db,
    redis,
    mailService,
    otpService,
    jwtService,
    {
      otpExpiryMinutes: app.config.OTP_EXPIRY_MINUTES,
      resetOtpExpiryMinutes: app.config.RESET_OTP_EXPIRY_MINUTES,
      saltRounds: app.config.SALT_ROUNDS,
    },
  );

  app.setErrorHandler(errorHandler);

  app.register(
    async (v1) => {
      v1.get("/health", async () => ({ status: "ok" }));
      v1.get("/hello", async () => ({ message: "Hello From Drafton Backend" }));
      v1.register(authRoutes(authController), { prefix: "/auth" });
    },
    { prefix: "/api/v1" },
  );

  return app;
}
