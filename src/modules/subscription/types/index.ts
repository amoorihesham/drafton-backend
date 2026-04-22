export type SubscriptionStatus = "trialing" | "active" | "canceled" | "expired" | "past_due";

export type ActiveSubscriptionDto = {
  planName: "free" | "pro" | "ultimate";
  status: SubscriptionStatus;
  maxDocumentsPerDay: number;
  features: unknown;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
} | null;

export type SubscriptionFullType = {
  internal_id: number;
  user_id: number;
  plan_id: number;
  id: string;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  trial_ends_at: Date | null;
  canceled_at: Date | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export type AdminCreateSubscriptionDto = {
  user_uuid: string;
  plan_uuid: string;
  status?: "trialing" | "active";
  current_period_start: Date;
  current_period_end: Date;
  trial_ends_at?: Date;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
};

export type AdminUpdateSubscriptionDto = Partial<{
  plan_uuid: string;
  status: SubscriptionStatus;
  current_period_end: Date;
  trial_ends_at: Date | null;
  stripe_customer_id: string;
  stripe_subscription_id: string;
}>;
