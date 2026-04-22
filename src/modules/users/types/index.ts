import { PlanFullType } from "@/modules/plans/types";
import { SubscriptionFullType } from "@/modules/subscription/types";
import { User } from "@/types/shared/user";

export type UserWithSubscriptionType = {
  users: User;
  user_subscriptions: SubscriptionFullType;
  plans: PlanFullType | null;
};
