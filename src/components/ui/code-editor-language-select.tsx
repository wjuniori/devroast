"use client";

import type { SelectHTMLAttributes } from "react";
import {
  getLanguageDisplayName,
  getSupportedLanguagesForUI,
  type SupportedLanguage,
} from "@/lib/languages";

export interface CodeEditorLanguageSelectProps
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "children" | "onChange"
  > {
  /**
   * Current selected value: 'auto' or a language ID.
   */
  value: "auto" | SupportedLanguage;
  /**
   * Callback when selection changes.
   */
  onChange: (value: "auto" | SupportedLanguage) => void;
  /**
   * The currently detected language (for display hint).
   */
  detectedLanguage?: SupportedLanguage | null;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
}

/**
 * Language selector combobox for the code editor.
 * Allows users to manually override auto-detected language or re-enable auto-detection.
 */
export function CodeEditorLanguageSelect({
  value,
  onChange,
  detectedLanguage,
  className,
  ...props
}: CodeEditorLanguageSelectProps) {
  const supportedLanguages = getSupportedLanguagesForUI();

  // Determine display text for auto-detect option
  const autoDetectLabel = detectedLanguage
    ? `Auto-detect (${getLanguageDisplayName(detectedLanguage)})`
    : "Auto-detect";

  return (
    <select
      value={value}
      onChange={(e) => {
        const val = e.currentTarget.value;
        onChange(val === "auto" ? "auto" : (val as SupportedLanguage));
      }}
      className={`rounded border border-border-primary bg-bg-input px-3 py-2 font-mono text-sm text-text-primary outline-none transition-colors hover:border-border-focus focus:border-accent-green focus:ring-1 focus:ring-accent-green ${
        className ?? ""
      }`.trim()}
      {...props}
    >
      <option value="auto">{autoDetectLabel}</option>
      <optgroup label="Languages">
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageDisplayName(lang)}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
