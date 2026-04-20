import { NotFoundException } from "@/shared/errors/http.errors.js";
import { ISubscriptionRepository } from "./interfaces/repository.interface.js";
import { ISubscriptionService } from "./interfaces/service.interface.js";
import {
  ActiveSubscriptionDto,
  AdminCreateSubscriptionDto,
  AdminUpdateSubscriptionDto,
  SubscriptionDetailDto,
  SubscriptionStatus,
} from "./types/index.js";

const SUBSCRIPTION_NOT_FOUND = "Subscription not found.";

export class SubscriptionService implements ISubscriptionService {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async createFreeSubscription(userInternalId: number): Promise<void> {
    await this.subscriptionRepository.createFreeSubscription(userInternalId);
  }

  async getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto> {
    return this.subscriptionRepository.getActiveSubscription(userInternalId);
  }

  async adminGetAll(status?: SubscriptionStatus): Promise<SubscriptionDetailDto[]> {
    return this.subscriptionRepository.adminFindAll(status);
  }

  async adminGetById(id: string): Promise<SubscriptionDetailDto> {
    const sub = await this.subscriptionRepository.adminFindById(id);
    if (!sub) throw new NotFoundException(SUBSCRIPTION_NOT_FOUND, "SUBSCRIPTION_NOT_FOUND");
    return sub;
  }

  async adminGetByUserUuid(userUuid: string): Promise<SubscriptionDetailDto[]> {
    return this.subscriptionRepository.adminFindByUserUuid(userUuid);
  }

  async adminCreate(dto: AdminCreateSubscriptionDto): Promise<SubscriptionDetailDto> {
    return this.subscriptionRepository.adminCreate(dto);
  }

  async adminUpdate(id: string, dto: AdminUpdateSubscriptionDto): Promise<SubscriptionDetailDto> {
    const sub = await this.subscriptionRepository.adminUpdate(id, dto);
    if (!sub) throw new NotFoundException(SUBSCRIPTION_NOT_FOUND, "SUBSCRIPTION_NOT_FOUND");
    return sub;
  }

  async adminCancel(id: string): Promise<SubscriptionDetailDto> {
    const sub = await this.subscriptionRepository.adminCancel(id);
    if (!sub) throw new NotFoundException(SUBSCRIPTION_NOT_FOUND, "SUBSCRIPTION_NOT_FOUND");
    return sub;
  }
}
