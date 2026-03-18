import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  codeLanguageEnum,
  roastModeEnum,
  roastStatusEnum,
  roastVerdictEnum,
  visibilityEnum,
} from "./enums";

export const roastSubmissions = pgTable(
  "roast_submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    shareSlug: text().unique(),
    sourceCode: text().notNull(),
    sourceLineCount: integer().notNull(),
    language: codeLanguageEnum().notNull(),
    mode: roastModeEnum().notNull().default("roast"),
    status: roastStatusEnum().notNull().default("queued"),
    visibility: visibilityEnum().notNull().default("private"),
    score: numeric({ precision: 3, scale: 1 }),
    verdict: roastVerdictEnum(),
    headline: text(),
    summary: text(),
    modelName: text(),
    errorMessage: text(),
    isFeatured: boolean().notNull().default(false),
    featuredRank: integer(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index("idx_status_created_at").on(table.status, table.createdAt.desc()),
    index("idx_visibility_score").on(table.visibility, table.score.asc()),
    uniqueIndex("idx_share_slug_unique").on(table.shareSlug),
    index("idx_leaderboard_public")
      .on(table.score.asc(), table.createdAt.desc())
      .where(sql`"visibility" = 'public' AND "status" = 'completed'`),
  ],
);

export type RoastSubmission = typeof roastSubmissions.$inferSelect;
export type NewRoastSubmission = typeof roastSubmissions.$inferInsert;
