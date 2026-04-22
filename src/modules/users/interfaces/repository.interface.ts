import { users } from "@/db/schema";
import { UserWithSubscriptionType } from "../types";
import { User } from "@/types/shared/user";
import { SubscriptionFullType } from "@/modules/subscription/types";
import { PlanFullType } from "@/modules/plans/types";

export interface IUserRepository {
  findByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  findById(id: string): Promise<typeof users.$inferSelect | undefined>;
  findUserWithSubscription(id: string): Promise<UserWithSubscriptionType[]>;
}
