import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  bigserial,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.schema.js";
import { plans } from "./plan.schema.js";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "canceled",
  "expired",
  "past_due",
]);

export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    internal_id: bigserial("internal_id", { mode: "number" }).primaryKey(),
    id: uuid("id").notNull().defaultRandom(),
    user_id: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.internal_id, { onDelete: "cascade" }),
    plan_id: bigint("plan_id", { mode: "number" })
      .notNull()
      .references(() => plans.internal_id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("active"),
    current_period_start: timestamp("current_period_start").notNull(),
    current_period_end: timestamp("current_period_end").notNull(),
    trial_ends_at: timestamp("trial_ends_at"),
    canceled_at: timestamp("canceled_at"),
    stripe_customer_id: text("stripe_customer_id"),
    stripe_subscription_id: text("stripe_subscription_id"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_subscriptions_user_id_idx").on(table.user_id),
    index("user_subscriptions_plan_id_idx").on(table.plan_id),
    index("user_subscriptions_status_idx").on(table.status),
    // enforce one active subscription per user at the DB level
    uniqueIndex("one_active_sub_per_user_uidx")
      .on(table.user_id)
      .where(sql`status = 'active'`),
  ],
);
