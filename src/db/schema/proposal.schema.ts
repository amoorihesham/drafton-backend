import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  bigserial,
  bigint,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema.js";

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "generating",
  "ready",
  "failed",
]);

export const proposals = pgTable(
  "proposals",
  {
    internal_id: bigserial("internal_id", { mode: "number" }).primaryKey(),
    id: uuid("id").notNull().defaultRandom(),
    user_id: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.internal_id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: proposalStatusEnum("status").notNull().default("draft"),
    prompt: text("prompt").notNull(),
    content: jsonb("content").notNull().default({ sections: [] }),
    model: text("model").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("proposals_user_id_created_at_idx").on(table.user_id, table.created_at),
    index("proposals_id_idx").on(table.id),
  ],
);
