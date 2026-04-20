import { FastifyInstance } from "fastify";
import { SubscriptionController } from "./subscription.controller.js";
import {
  cancelSubscriptionSchema,
  createSubscriptionSchema,
  getAllSubscriptionsSchema,
  getSubscriptionByIdSchema,
  getSubscriptionsByUserSchema,
  updateSubscriptionSchema,
} from "./schemas/subscription.schema.js";
import { createAuthHook } from "@/shared/hooks/authenticate.js";
import { createAuthorizeHook } from "@/shared/hooks/authorize-role.js";

const SUBS = ["Subscriptions"];
const ADMIN_AUTH = [{ cookieAuth: [] }];

export function subscriptionRoutes(controller: SubscriptionController, jwtSecret: string) {
  return async (fastify: FastifyInstance) => {
    fastify.addHook("preHandler", createAuthHook(jwtSecret));
    fastify.addHook("preHandler", createAuthorizeHook("admin"));

    fastify.get(
      "/",
      { schema: { ...getAllSubscriptionsSchema, tags: SUBS, summary: "List all subscriptions", security: ADMIN_AUTH } },
      controller.getAll.bind(controller),
    );
    fastify.get(
      "/:id",
      { schema: { ...getSubscriptionByIdSchema, tags: SUBS, summary: "Get subscription by ID", security: ADMIN_AUTH } },
      controller.getById.bind(controller),
    );
    fastify.get(
      "/user/:userId",
      { schema: { ...getSubscriptionsByUserSchema, tags: SUBS, summary: "Get all subscriptions for a user", security: ADMIN_AUTH } },
      controller.getByUser.bind(controller),
    );
    fastify.post(
      "/",
      { schema: { ...createSubscriptionSchema, tags: SUBS, summary: "Manually assign a plan to a user", security: ADMIN_AUTH } },
      controller.create.bind(controller),
    );
    fastify.patch(
      "/:id",
      { schema: { ...updateSubscriptionSchema, tags: SUBS, summary: "Update subscription details", security: ADMIN_AUTH } },
      controller.update.bind(controller),
    );
    fastify.delete(
      "/:id",
      { schema: { ...cancelSubscriptionSchema, tags: SUBS, summary: "Cancel a subscription", security: ADMIN_AUTH } },
      controller.cancel.bind(controller),
    );
  };
}
