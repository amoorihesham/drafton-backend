import { ISubscriptionRepository } from "./interfaces/repository.interface.js";
import { ISubscriptionService } from "./interfaces/service.interface.js";
import { ActiveSubscriptionDto } from "./types/index.js";

export class SubscriptionService implements ISubscriptionService {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async createFreeSubscription(userInternalId: number): Promise<void> {
    await this.subscriptionRepository.createFreeSubscription(userInternalId);
  }

  async getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto> {
    return this.subscriptionRepository.getActiveSubscription(userInternalId);
  }
}
