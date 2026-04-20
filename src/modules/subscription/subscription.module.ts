import { Database } from "@/db/connection.js";
import { SubscriptionRepository } from "@/db/repositories/subscription.repository.js";
import { SubscriptionService } from "./subscription.service.js";

export const buildSubscriptionModule = (db: Database): SubscriptionService => {
  const subscriptionRepository = new SubscriptionRepository(db);
  return new SubscriptionService(subscriptionRepository);
};
