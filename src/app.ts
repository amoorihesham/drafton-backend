import Fastify, { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import envPlugin from "@fastify/env";
import swagger from "@fastify/swagger";
import { ConfigSchema } from "./config/index.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import { MailService } from "./shared/services/mail/mail.service.js";
import cookie from "@fastify/cookie";
import { createRedisConnection } from "./redis/index.js";
import { buildAuthModule } from "./modules/auth/auth.module.js";
import { buildSubscriptionModule } from "./modules/subscription/subscription.module.js";
import { buildPlanModule } from "./modules/plans/plans.module.js";
import { planRoutes } from "./modules/plans/plans.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { subscriptionRoutes } from "./modules/subscription/subscription.routes.js";
import { createDatabaseConnection } from "./db/connection.js";

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

  await app.register(swagger, {
    openapi: {
      info: { title: "DraftOn API", description: "DraftOn backend REST API", version: "1.0.0" },
      servers: [{ url: "http://localhost:3000", description: "Local" }],
      tags: [
        { name: "Auth", description: "Registration, login, and session management" },
        { name: "Plans", description: "Plan catalog management — admin only" },
        { name: "Subscriptions", description: "User subscription management — admin only" },
      ],
      components: {
        securitySchemes: {
          cookieAuth: { type: "apiKey", in: "cookie", name: "access_token" },
        },
      },
    },
  });

  await app.register(helmet);
  await app.register(cookie);
  await app.register(cors, {
    origin: app.config.FRONTEND_URL,
    credentials: true,
  });

  const db = await createDatabaseConnection(app.config.DATABASE_URL, app.config.DB_POOL_SIZE);
  const redis = createRedisConnection();

  const mailService = new MailService({
    host: app.config.SMTP_HOST,
    port: app.config.SMTP_PORT,
    user: app.config.SMTP_USER,
    pass: app.config.SMTP_PASS,
    from: app.config.SMTP_FROM,
  });

  //CONTAINERS
  const { subscriptionService, subscriptionController } = buildSubscriptionModule(db);
  const authController = buildAuthModule(db, redis, mailService, subscriptionService, app.config);
  const planController = buildPlanModule(db);

  app.setErrorHandler(errorHandler);

  app.register(
    async (v1) => {
      v1.get("/health", async () => ({ status: "ok" }));
      v1.get("/hello", async () => ({ message: "Hello From Drafton Backend" }));
      v1.register(authRoutes(authController, app.config.JWT_ACCESS_SECRET), { prefix: "/auth" });
      v1.register(planRoutes(planController, app.config.JWT_ACCESS_SECRET), { prefix: "/plans" });
      v1.register(subscriptionRoutes(subscriptionController, app.config.JWT_ACCESS_SECRET), { prefix: "/subscriptions" });
    },
    { prefix: "/api/v1" },
  );

  return app;
}
