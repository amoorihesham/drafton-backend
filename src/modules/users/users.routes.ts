import { FastifyInstance } from "fastify";

import { createAuthHook } from "@/shared/hooks/authenticate.js";
import { createAuthorizeHook } from "@/shared/hooks/authorize-role.js";
import { UsersController } from "./users.controller";

export function userRoutes(userController: UsersController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    fastify.addHook("preHandler", createAuthHook(jwtSecret));
    fastify.addHook("preHandler", createAuthorizeHook("admin", "client"));

    fastify.get("/:id", userController.findById.bind(userController));
    fastify.get("/email", userController.findByEmail.bind(userController));
    fastify.get("/:id/subscription", userController.findUserWithSubscription.bind(userController));
  };
}
