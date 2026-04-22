export type PlanFullType = {
  internal_id: number;
  id: string;
  name: "free" | "pro" | "ultimate";
  price_monthly: number;
  price_yearly: number;
  max_documents_per_day: number;
  features: unknown;
  stripe_product_id: string | null;
  stripe_monthly_price_id: string | null;
  stripe_yearly_price_id: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePlanDto = {
  name: "free" | "pro" | "ultimate";
  price_monthly: number;
  price_yearly: number;
  max_documents_per_day: number;
  features?: unknown;
  stripe_product_id?: string;
  stripe_monthly_price_id?: string;
  stripe_yearly_price_id?: string;
};

export type UpdatePlanDto = Partial<{
  price_monthly: number;
  price_yearly: number;
  max_documents_per_day: number;
  features: unknown;
  stripe_product_id: string;
  stripe_monthly_price_id: string;
  stripe_yearly_price_id: string;
  is_active: boolean;
}>;
