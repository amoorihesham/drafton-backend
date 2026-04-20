import { Database } from "@/db/connection.js";
import { SubscriptionRepository } from "@/db/repositories/subscription.repository.js";
import { SubscriptionService } from "./subscription.service.js";
import { SubscriptionController } from "./subscription.controller.js";

export const buildSubscriptionModule = (db: Database) => {
  const subscriptionRepository = new SubscriptionRepository(db);
  const subscriptionService = new SubscriptionService(subscriptionRepository);
  const subscriptionController = new SubscriptionController(subscriptionService);
  return { subscriptionService, subscriptionController };
};
