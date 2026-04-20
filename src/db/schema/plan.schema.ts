import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  bigserial,
  integer,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const planNameEnum = pgEnum("plan_name", ["free", "pro", "ultimate"]);

export const plans = pgTable(
  "plans",
  {
    internal_id: bigserial("internal_id", { mode: "number" }).primaryKey(),
    id: uuid("id").notNull().defaultRandom(),
    name: planNameEnum("name").notNull(),
    price_monthly: integer("price_monthly").notNull().default(0),
    price_yearly: integer("price_yearly").notNull().default(0),
    max_documents_per_day: integer("max_documents_per_day").notNull(),
    features: jsonb("features"),
    stripe_product_id: text("stripe_product_id"),
    stripe_monthly_price_id: text("stripe_monthly_price_id"),
    stripe_yearly_price_id: text("stripe_yearly_price_id"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("plans_name_uidx").on(table.name)],
);
