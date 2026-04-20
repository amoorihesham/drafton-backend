import { Type } from "@sinclair/typebox";
import { successResponse } from "@/shared/http/response.utils";

const PlanSummary = Type.Object({
  id: Type.String(),
  name: Type.Union([Type.Literal("free"), Type.Literal("pro"), Type.Literal("ultimate")]),
  max_documents_per_day: Type.Number(),
  price_monthly: Type.Number(),
  price_yearly: Type.Number(),
});

const UserSummary = Type.Object({
  id: Type.String(),
  email: Type.String(),
  username: Type.String(),
});

const SubscriptionDetailSchema = Type.Object({
  id: Type.String(),
  status: Type.Union([
    Type.Literal("trialing"),
    Type.Literal("active"),
    Type.Literal("canceled"),
    Type.Literal("expired"),
    Type.Literal("past_due"),
  ]),
  plan: PlanSummary,
  user: UserSummary,
  stripe_customer_id: Type.Union([Type.String(), Type.Null()]),
  stripe_subscription_id: Type.Union([Type.String(), Type.Null()]),
  current_period_start: Type.String(),
  current_period_end: Type.String(),
  trial_ends_at: Type.Union([Type.String(), Type.Null()]),
  canceled_at: Type.Union([Type.String(), Type.Null()]),
  created_at: Type.String(),
  updated_at: Type.String(),
});

export const getAllSubscriptionsSchema = {
  querystring: Type.Object({
    status: Type.Optional(
      Type.Union([
        Type.Literal("trialing"),
        Type.Literal("active"),
        Type.Literal("canceled"),
        Type.Literal("expired"),
        Type.Literal("past_due"),
      ]),
    ),
  }),
  response: { 200: successResponse(Type.Array(SubscriptionDetailSchema)) },
};

export const getSubscriptionByIdSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(SubscriptionDetailSchema) },
};

export const getSubscriptionsByUserSchema = {
  params: Type.Object({ userId: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(Type.Array(SubscriptionDetailSchema)) },
};

export const createSubscriptionSchema = {
  body: Type.Object({
    user_uuid: Type.String({ format: "uuid" }),
    plan_uuid: Type.String({ format: "uuid" }),
    status: Type.Optional(Type.Union([Type.Literal("trialing"), Type.Literal("active")])),
    current_period_start: Type.String({ format: "date-time" }),
    current_period_end: Type.String({ format: "date-time" }),
    trial_ends_at: Type.Optional(Type.String({ format: "date-time" })),
    stripe_customer_id: Type.Optional(Type.String()),
    stripe_subscription_id: Type.Optional(Type.String()),
  }),
  response: { 201: successResponse(SubscriptionDetailSchema) },
};

export const updateSubscriptionSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  body: Type.Object({
    plan_uuid: Type.Optional(Type.String({ format: "uuid" })),
    status: Type.Optional(
      Type.Union([
        Type.Literal("trialing"),
        Type.Literal("active"),
        Type.Literal("canceled"),
        Type.Literal("expired"),
        Type.Literal("past_due"),
      ]),
    ),
    current_period_end: Type.Optional(Type.String({ format: "date-time" })),
    trial_ends_at: Type.Optional(Type.Union([Type.String({ format: "date-time" }), Type.Null()])),
    stripe_customer_id: Type.Optional(Type.String()),
    stripe_subscription_id: Type.Optional(Type.String()),
  }),
  response: { 200: successResponse(SubscriptionDetailSchema) },
};

export const cancelSubscriptionSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(SubscriptionDetailSchema) },
};
