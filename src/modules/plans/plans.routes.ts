import { FastifyInstance } from "fastify";
import { PlanController } from "./plans.controller.js";
import {
  createPlanSchema,
  deactivatePlanSchema,
  getAllPlansSchema,
  getPlanByIdSchema,
  updatePlanSchema,
} from "./schemas/plans.schema.js";
import { createAuthHook } from "@/shared/hooks/authenticate.js";
import { createAuthorizeHook } from "@/shared/hooks/authorize-role.js";

export function planRoutes(planController: PlanController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    const authenticate = createAuthHook(jwtSecret);
    const authorizeAdmin = createAuthorizeHook("admin");

    fastify.addHook("preHandler", authenticate);
    fastify.addHook("preHandler", authorizeAdmin);

    fastify.get("/", { schema: getAllPlansSchema }, planController.getAll.bind(planController));
    fastify.get("/:id", { schema: getPlanByIdSchema }, planController.getById.bind(planController));
    fastify.post("/", { schema: createPlanSchema }, planController.create.bind(planController));
    fastify.patch("/:id", { schema: updatePlanSchema }, planController.update.bind(planController));
    fastify.delete("/:id", { schema: deactivatePlanSchema }, planController.deactivate.bind(planController));
  };
}
