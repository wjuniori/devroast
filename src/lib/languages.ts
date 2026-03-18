import type { BundledLanguage } from "shiki";

/**
 * V1 supported languages for the homepage editor.
 * 12 curated languages covering popular web and backend use cases.
 */
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "ruby",
  "php",
  "sql",
  "shell",
  "css",
  "html",
  "json",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Maps highlight.js language codes to Shiki language IDs.
 * Used to normalize auto-detected language to Shiki equivalents.
 */
export const DETECT_TO_SHIKI_MAP: Record<string, SupportedLanguage | null> = {
  // JavaScript variants
  js: "javascript",
  javascript: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  node: "javascript",
  // TypeScript variants
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  // Python variants
  py: "python",
  python: "python",
  python3: "python",
  py3: "python",
  gyp: "python",
  // Go variants
  go: "go",
  golang: "go",
  // Rust variants
  rs: "rust",
  rust: "rust",
  // Java variants
  java: "java",
  gradle: "java",
  // Ruby variants
  rb: "ruby",
  ruby: "ruby",
  rbx: "ruby",
  // PHP variants
  php: "php",
  php3: "php",
  php4: "php",
  php5: "php",
  // SQL variants
  sql: "sql",
  plsql: "sql",
  psql: "sql",
  mysql: "sql",
  // Shell variants
  sh: "shell",
  shell: "shell",
  bash: "shell",
  zsh: "shell",
  fish: "shell",
  // CSS variants
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",
  // HTML variants
  html: "html",
  htm: "html",
  xhtml: "html",
  xml: "html",
  // JSON variants
  json: "json",
  jsonc: "json",
  // Unsupported fallback
  null: null,
};

/**
 * Detection confidence thresholds from highlight.js.
 * Used to determine when to trust detection vs. fallback to plaintext.
 */
export const CONFIDENCE_THRESHOLDS = {
  // High confidence: use detection result immediately
  HIGH: 0.7,
  // Medium confidence: use detection but with caution (may need plaintext fallback)
  MEDIUM: 0.5,
  // Low confidence: fallback to plaintext
  LOW: 0.5,
} as const;

/**
 * Maps SupportedLanguage to Shiki BundledLanguage type for type safety.
 */
export const LANGUAGE_TO_SHIKI: Record<SupportedLanguage, BundledLanguage> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  go: "go",
  rust: "rust",
  java: "java",
  ruby: "ruby",
  php: "php",
  sql: "sql",
  shell: "shell",
  css: "css",
  html: "html",
  json: "json",
};

/**
 * Resolves a detected language code to a supported Shiki language.
 * Falls back to null if the language is not supported or not recognized.
 */
export function resolveLanguage(detected: string): SupportedLanguage | null {
  const normalized = detected.toLowerCase().trim();
  const mapped = DETECT_TO_SHIKI_MAP[normalized];
  return mapped ?? null;
}

/**
 * Returns true if the detected language is in the v1 supported set.
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Gets the Shiki language ID for a supported language.
 */
export function getShikiLanguage(lang: SupportedLanguage): BundledLanguage {
  return LANGUAGE_TO_SHIKI[lang];
}

/**
 * Returns all supported languages as a sorted array for UI selection.
 */
export function getSupportedLanguagesForUI(): SupportedLanguage[] {
  return [...SUPPORTED_LANGUAGES].sort();
}

/**
 * Gets a display name for a language (capitalize first letter).
 */
export function getLanguageDisplayName(lang: SupportedLanguage): string {
  const nameMap: Record<SupportedLanguage, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    go: "Go",
    rust: "Rust",
    java: "Java",
    ruby: "Ruby",
    php: "PHP",
    sql: "SQL",
    shell: "Shell",
    css: "CSS",
    html: "HTML",
    json: "JSON",
  };
  return nameMap[lang] ?? lang;
}
