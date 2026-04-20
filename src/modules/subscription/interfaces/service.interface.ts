import { ActiveSubscriptionDto } from "../types/index.js";

export interface ISubscriptionService {
  createFreeSubscription(userInternalId: number): Promise<void>;
  getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto>;
}
