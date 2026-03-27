import Fastify, { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import envPlugin from "@fastify/env";
import { ConfigSchema } from "./config/index.js";
import { errorHandler } from "./infrastructure/http/error-handler.js";
import { createDatabaseConnection } from "./infrastructure/db/connection.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
  });

  await app.register(envPlugin, {
    schema: ConfigSchema,
    dotenv: true,
  });

  await app.register(helmet);
  await app.register(cors);

  createDatabaseConnection(app.config.DATABASE_URL, app.config.DB_POOL_SIZE);

  app.setErrorHandler(errorHandler);

  app.register(
    async (v1) => {
      v1.get("/health", async () => ({ status: "ok" }));
      v1.get("/hello", async () => ({ message: "Hello from Drafton!" }));
    },
    { prefix: "/api/v1" },
  );

  return app;
}
