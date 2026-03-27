import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { AuthController } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/auth.schema.js";

export function authRoutes(authController: AuthController) {
  return async (fastify: FastifyInstance) => {
    fastify.post("/register", { schema: registerSchema }, authController.register.bind(authController));
  };
}
