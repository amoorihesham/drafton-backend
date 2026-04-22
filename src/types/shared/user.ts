import { PlanFullType } from "@/modules/plans/types";
import { SubscriptionFullType } from "@/modules/subscription/types";

export type UserRole = "provider" | "client" | "admin";

export type User = {
  internal_id: number;
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationOtp: string | null;
  emailVerificationOtpExpiry: Date | null;
  passwordResetOtp: string | null;
  passwordResetOtpExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserSubscriptionResponseDto = {
  user: UserResponseDto;
  subscription: Omit<
    SubscriptionFullType,
    "user_id" | "stripe_subscription_id" | "plan_id" | "canceled_at" | "stripe_customer_id" | "internal_id"
  >;
  plan: Omit<
    PlanFullType,
    | "internalId"
    | "subscriptionId"
    | "created_at"
    | "updated_at"
    | "internal_id"
    | "stripe_monthly_price_id"
    | "stripe_product_id"
    | "stripe_yearly_price_id"
  >;
};

export type UserResponseDto = Omit<
  User,
  | "internal_id"
  | "passwordHash"
  | "emailVerificationOtp"
  | "emailVerificationOtpExpiry"
  | "passwordResetOtp"
  | "passwordResetOtpExpiry"
> & {
  accessToken?: string;
  refreshToken?: string;
};
