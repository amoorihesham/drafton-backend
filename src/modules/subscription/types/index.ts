export type ActiveSubscriptionDto = {
  planName: "free" | "pro" | "ultimate";
  status: "trialing" | "active" | "canceled" | "expired" | "past_due";
  maxDocumentsPerDay: number;
  features: unknown;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
} | null;
