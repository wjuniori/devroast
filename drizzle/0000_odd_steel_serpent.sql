CREATE TYPE "public"."analysis_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."code_language" AS ENUM('javascript', 'typescript', 'sql', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'php', 'ruby', 'other');--> statement-breakpoint
CREATE TYPE "public"."diff_line_kind" AS ENUM('context', 'added', 'removed');--> statement-breakpoint
CREATE TYPE "public"."roast_mode" AS ENUM('roast', 'honest');--> statement-breakpoint
CREATE TYPE "public"."roast_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."roast_verdict" AS ENUM('needs_serious_help', 'rough_but_fixable', 'actually_not_bad', 'clean_enough');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'unlisted', 'public');--> statement-breakpoint
CREATE TABLE "roast_analysis_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "analysis_severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"display_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_diff_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"from_label" text DEFAULT 'your_code.ts' NOT NULL,
	"to_label" text DEFAULT 'improved_code.ts' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roast_diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diff_block_id" uuid NOT NULL,
	"kind" "diff_line_kind" NOT NULL,
	"display_order" integer NOT NULL,
	"content" text NOT NULL,
	"old_line_number" integer,
	"new_line_number" integer
);
--> statement-breakpoint
CREATE TABLE "roast_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_slug" text,
	"source_code" text NOT NULL,
	"source_line_count" integer NOT NULL,
	"language" "code_language" NOT NULL,
	"mode" "roast_mode" DEFAULT 'roast' NOT NULL,
	"status" "roast_status" DEFAULT 'queued' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"score" numeric(3, 1),
	"verdict" "roast_verdict",
	"headline" text,
	"summary" text,
	"model_name" text,
	"error_message" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_rank" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "roast_submissions_shareSlug_unique" UNIQUE("share_slug")
);
--> statement-breakpoint
ALTER TABLE "roast_analysis_items" ADD CONSTRAINT "roast_analysis_items_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_diff_blocks" ADD CONSTRAINT "roast_diff_blocks_submission_id_roast_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."roast_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roast_diff_lines" ADD CONSTRAINT "roast_diff_lines_diff_block_id_roast_diff_blocks_id_fk" FOREIGN KEY ("diff_block_id") REFERENCES "public"."roast_diff_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_status_created_at" ON "roast_submissions" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_visibility_score" ON "roast_submissions" USING btree ("visibility","score");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_share_slug_unique" ON "roast_submissions" USING btree ("share_slug");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_public" ON "roast_submissions" USING btree ("score","created_at" DESC NULLS LAST) WHERE "roast_submissions"."visibility" = $1 AND "roast_submissions"."status" = $2;