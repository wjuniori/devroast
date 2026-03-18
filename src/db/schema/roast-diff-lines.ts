import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { diffLineKindEnum } from "./enums";
import { roastDiffBlocks } from "./roast-diff-blocks";

export const roastDiffLines = pgTable(
  "roast_diff_lines",
  {
    id: uuid().primaryKey().defaultRandom(),
    diffBlockId: uuid()
      .notNull()
      .references(() => roastDiffBlocks.id, { onDelete: "cascade" }),
    kind: diffLineKindEnum().notNull(),
    displayOrder: integer().notNull(),
    content: text().notNull(),
    oldLineNumber: integer(),
    newLineNumber: integer(),
  },
  (table) => [
    // Removed FK index - Drizzle creates it automatically
  ],
);

export type RoastDiffLine = typeof roastDiffLines.$inferSelect;
export type NewRoastDiffLine = typeof roastDiffLines.$inferInsert;
