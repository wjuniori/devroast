import { pgEnum } from "drizzle-orm/pg-core";

// Code language enum
export const codeLanguageEnum = pgEnum("code_language", [
  "javascript",
  "typescript",
  "sql",
  "python",
  "java",
  "go",
  "rust",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "other",
]);

// Roast mode enum
export const roastModeEnum = pgEnum("roast_mode", ["roast", "honest"]);

// Roast status enum
export const roastStatusEnum = pgEnum("roast_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

// Roast verdict enum
export const roastVerdictEnum = pgEnum("roast_verdict", [
  "needs_serious_help",
  "rough_but_fixable",
  "actually_not_bad",
  "clean_enough",
]);

// Analysis severity enum
export const analysisSeverityEnum = pgEnum("analysis_severity", [
  "critical",
  "warning",
  "good",
]);

// Diff line kind enum
export const diffLineKindEnum = pgEnum("diff_line_kind", [
  "context",
  "added",
  "removed",
]);

// Visibility enum
export const visibilityEnum = pgEnum("visibility", [
  "private",
  "unlisted",
  "public",
]);
