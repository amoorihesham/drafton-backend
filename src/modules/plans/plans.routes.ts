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

const PLANS = ["Plans"];
const ADMIN_AUTH = [{ cookieAuth: [] }];

export function planRoutes(planController: PlanController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    fastify.addHook("preHandler", createAuthHook(jwtSecret));
    fastify.addHook("preHandler", createAuthorizeHook("admin"));

    fastify.get(
      "/",
      { schema: { ...getAllPlansSchema, tags: PLANS, summary: "List all plans", security: ADMIN_AUTH } },
      planController.getAll.bind(planController),
    );
    fastify.get(
      "/:id",
      { schema: { ...getPlanByIdSchema, tags: PLANS, summary: "Get plan by ID", security: ADMIN_AUTH } },
      planController.getById.bind(planController),
    );
    fastify.post(
      "/",
      { schema: { ...createPlanSchema, tags: PLANS, summary: "Create a plan", security: ADMIN_AUTH } },
      planController.create.bind(planController),
    );
    fastify.patch(
      "/:id",
      { schema: { ...updatePlanSchema, tags: PLANS, summary: "Update plan fields", security: ADMIN_AUTH } },
      planController.update.bind(planController),
    );
    fastify.delete(
      "/:id",
      { schema: { ...deactivatePlanSchema, tags: PLANS, summary: "Deactivate a plan (soft delete)", security: ADMIN_AUTH } },
      planController.deactivate.bind(planController),
    );
  };
}
