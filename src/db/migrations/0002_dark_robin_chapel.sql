CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'generating', 'ready', 'failed');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'admin';--> statement-breakpoint
CREATE TABLE "proposals" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"title" text NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"prompt" text NOT NULL,
	"content" jsonb DEFAULT '{"sections":[]}'::jsonb NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("internal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposals_user_id_created_at_idx" ON "proposals" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "proposals_id_idx" ON "proposals" USING btree ("id");