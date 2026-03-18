import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { analysisSeverityEnum } from "./enums";
import { roastSubmissions } from "./roast-submissions";

export const roastAnalysisItems = pgTable(
  "roast_analysis_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    severity: analysisSeverityEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    displayOrder: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Removed FK index - Drizzle creates it automatically
  ],
);

export type RoastAnalysisItem = typeof roastAnalysisItems.$inferSelect;
export type NewRoastAnalysisItem = typeof roastAnalysisItems.$inferInsert;
