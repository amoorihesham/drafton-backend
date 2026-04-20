import { ActiveSubscriptionDto, AdminCreateSubscriptionDto, AdminUpdateSubscriptionDto, SubscriptionDetailDto, SubscriptionStatus } from "../types/index.js";

export interface ISubscriptionRepository {
  createFreeSubscription(userInternalId: number): Promise<void>;
  getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto>;
  adminFindAll(status?: SubscriptionStatus): Promise<SubscriptionDetailDto[]>;
  adminFindById(id: string): Promise<SubscriptionDetailDto | undefined>;
  adminFindByUserUuid(userUuid: string): Promise<SubscriptionDetailDto[]>;
  adminCreate(dto: AdminCreateSubscriptionDto): Promise<SubscriptionDetailDto>;
  adminUpdate(id: string, dto: AdminUpdateSubscriptionDto): Promise<SubscriptionDetailDto | undefined>;
  adminCancel(id: string): Promise<SubscriptionDetailDto | undefined>;
}
