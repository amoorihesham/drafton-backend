import { ActiveSubscriptionDto, AdminCreateSubscriptionDto, AdminUpdateSubscriptionDto, SubscriptionDetailDto, SubscriptionStatus } from "../types/index.js";

export interface ISubscriptionService {
  createFreeSubscription(userInternalId: number): Promise<void>;
  getActiveSubscription(userInternalId: number): Promise<ActiveSubscriptionDto>;
  adminGetAll(status?: SubscriptionStatus): Promise<SubscriptionDetailDto[]>;
  adminGetById(id: string): Promise<SubscriptionDetailDto>;
  adminGetByUserUuid(userUuid: string): Promise<SubscriptionDetailDto[]>;
  adminCreate(dto: AdminCreateSubscriptionDto): Promise<SubscriptionDetailDto>;
  adminUpdate(id: string, dto: AdminUpdateSubscriptionDto): Promise<SubscriptionDetailDto>;
  adminCancel(id: string): Promise<SubscriptionDetailDto>;
}
