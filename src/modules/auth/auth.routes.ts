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

const AUTH = ["Auth"];
const COOKIE_AUTH = [{ cookieAuth: [] }];

export function authRoutes(authController: AuthController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    const authenticate = createAuthHook(jwtSecret);

    fastify.post(
      "/register",
      { schema: { ...registerSchema, tags: AUTH, summary: "Register a new account" } },
      authController.register.bind(authController),
    );
    fastify.post(
      "/login",
      { schema: { ...loginSchema, tags: AUTH, summary: "Login and receive session cookies" } },
      authController.login.bind(authController),
    );
    fastify.post(
      "/verify-email",
      { schema: { ...verifyEmailSchema, tags: AUTH, summary: "Verify email with OTP" } },
      authController.verifyEmail.bind(authController),
    );
    fastify.post(
      "/refresh",
      { schema: { ...refreshSchema, tags: AUTH, summary: "Refresh access token", security: COOKIE_AUTH } },
      authController.refresh.bind(authController),
    );
    fastify.post(
      "/logout/:userId",
      { schema: { ...logoutSchema, tags: AUTH, summary: "Logout and revoke session", security: COOKIE_AUTH } },
      authController.logout.bind(authController),
    );
    fastify.get(
      "/me",
      {
        schema: { ...getMeSchema, tags: AUTH, summary: "Get current user with subscription", security: COOKIE_AUTH },
        preHandler: authenticate,
      },
      authController.getMe.bind(authController),
    );
  };
}
