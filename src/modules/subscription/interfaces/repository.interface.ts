import { ActiveSubscriptionDto } from "../types/index.js";

export interface ISubscriptionRepository {
  createFreeSubscription(userInternalId: number): Promise<void>;
  getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto>;
}
