import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { roastSubmissions } from "./roast-submissions";

export const roastDiffBlocks = pgTable(
  "roast_diff_blocks",
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .references(() => roastSubmissions.id, { onDelete: "cascade" }),
    fromLabel: text().notNull().default("your_code.ts"),
    toLabel: text().notNull().default("improved_code.ts"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Removed FK index - Drizzle creates it automatically
  ],
);

export type RoastDiffBlock = typeof roastDiffBlocks.$inferSelect;
export type NewRoastDiffBlock = typeof roastDiffBlocks.$inferInsert;
