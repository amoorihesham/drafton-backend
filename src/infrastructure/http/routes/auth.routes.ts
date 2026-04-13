import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  verifyEmailSchema,
} from "../schemas/auth.schema.js";

export function authRoutes(authController: AuthController) {
  return async (fastify: FastifyInstance) => {
    fastify.post(
      "/register",
      { schema: registerSchema },
      authController.register.bind(authController),
    );
    fastify.post(
      "/login",
      { schema: loginSchema },
      authController.login.bind(authController),
    );
    fastify.post(
      "/refresh",
      { schema: refreshSchema },
      authController.refresh.bind(authController),
    );
    fastify.post(
      "/verify-email",
      { schema: verifyEmailSchema },
      authController.verifyEmail.bind(authController),
    );
  };
}
