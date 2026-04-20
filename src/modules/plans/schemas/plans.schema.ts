import { Type } from "@sinclair/typebox";
import { successResponse } from "@/shared/http/response.utils";

const PlanSchema = Type.Object({
  id: Type.String(),
  name: Type.Union([Type.Literal("free"), Type.Literal("pro"), Type.Literal("ultimate")]),
  price_monthly: Type.Number(),
  price_yearly: Type.Number(),
  max_documents_per_day: Type.Number(),
  features: Type.Unknown(),
  stripe_product_id: Type.Union([Type.String(), Type.Null()]),
  stripe_monthly_price_id: Type.Union([Type.String(), Type.Null()]),
  stripe_yearly_price_id: Type.Union([Type.String(), Type.Null()]),
  is_active: Type.Boolean(),
  created_at: Type.String(),
  updated_at: Type.String(),
});

export const getAllPlansSchema = {
  response: { 200: successResponse(Type.Array(PlanSchema)) },
};

export const getPlanByIdSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(PlanSchema) },
};

export const createPlanSchema = {
  body: Type.Object({
    name: Type.Union([Type.Literal("free"), Type.Literal("pro"), Type.Literal("ultimate")]),
    price_monthly: Type.Number({ minimum: 0 }),
    price_yearly: Type.Number({ minimum: 0 }),
    max_documents_per_day: Type.Number({ minimum: 1 }),
    features: Type.Optional(Type.Unknown()),
    stripe_product_id: Type.Optional(Type.String()),
    stripe_monthly_price_id: Type.Optional(Type.String()),
    stripe_yearly_price_id: Type.Optional(Type.String()),
  }),
  response: { 201: successResponse(PlanSchema) },
};

export const updatePlanSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  body: Type.Object({
    price_monthly: Type.Optional(Type.Number({ minimum: 0 })),
    price_yearly: Type.Optional(Type.Number({ minimum: 0 })),
    max_documents_per_day: Type.Optional(Type.Number({ minimum: 1 })),
    features: Type.Optional(Type.Unknown()),
    stripe_product_id: Type.Optional(Type.String()),
    stripe_monthly_price_id: Type.Optional(Type.String()),
    stripe_yearly_price_id: Type.Optional(Type.String()),
    is_active: Type.Optional(Type.Boolean()),
  }),
  response: { 200: successResponse(PlanSchema) },
};

export const deactivatePlanSchema = {
  params: Type.Object({ id: Type.String({ format: "uuid" }) }),
  response: { 200: successResponse(PlanSchema) },
};
