import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";
import {
  getMeSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  verifyEmailSchema,
} from "./schemas/auth.schema";
import { createAuthHook } from "@/shared/hooks/authenticate.js";

export function authRoutes(authController: AuthController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    const authenticate = createAuthHook(jwtSecret);

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
      "/logout/:userId",
      { schema: logoutSchema },
      authController.logout.bind(authController),
    );
    fastify.post(
      "/verify-email",
      { schema: verifyEmailSchema },
      authController.verifyEmail.bind(authController),
    );
    fastify.get(
      "/me",
      { schema: getMeSchema, preHandler: authenticate },
      authController.getMe.bind(authController),
    );
  };
}
