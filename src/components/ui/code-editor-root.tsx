"use client";

import { type HTMLAttributes, useRef, useState } from "react";
import type { SupportedLanguage } from "@/lib/languages";
import { useCodeLanguageDetection } from "@/lib/useCodeLanguageDetection";
import { CodeEditorHighlight } from "./code-editor-highlight";
import { CodeEditorInput } from "./code-editor-input";
import { CodeEditorLanguageSelect } from "./code-editor-language-select";

export interface CodeEditorRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /**
   * The code value.
   */
  value?: string;
  /**
   * Callback when code changes.
   */
  onChange?: (code: string) => void;
  /**
   * Placeholder text when code is empty.
   * @default "Paste or type your code here..."
   */
  placeholder?: string;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
  /**
   * Show or hide the language selector.
   * @default true
   */
  showLanguageSelect?: boolean;
  /**
   * Show or hide line numbers.
   * @default true
   */
  showLineNumbers?: boolean;
}

/**
 * Ray.so-style code editor with automatic syntax highlighting.
 * Features:
 * - Transparent textarea overlay for editing
 * - Shiki-powered syntax highlighting
 * - Auto-detection with manual language override
 * - Line numbers
 * - Session-level language persistence
 */
export function CodeEditorRoot({
  value = "",
  onChange,
  placeholder = "Paste or type your code here...",
  className,
  showLanguageSelect = true,
  showLineNumbers = true,
  style,
  ...props
}: CodeEditorRootProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State management
  const [code, setCode] = useState(value);
  const [languageMode, setLanguageMode] = useState<"auto" | "manual">("auto");
  const [detectedLanguage, setDetectedLanguage] =
    useState<SupportedLanguage | null>(null);
  const [manualLanguage, setManualLanguage] =
    useState<SupportedLanguage | null>(null);

  // Detection hook
  const { detectImmediate, detectDebounced } = useCodeLanguageDetection();

  // Determine resolved language based on mode
  const resolvedLanguage =
    languageMode === "manual" && manualLanguage
      ? manualLanguage
      : detectedLanguage;

  // Handle code change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onChange?.(newCode);

    // Debounce detection on typing
    if (languageMode === "auto") {
      detectDebounced(newCode, (result) => {
        if (result.isSupported) {
          setDetectedLanguage(result.language);
        }
      });
    }
  };

  // Handle paste events
  const handlePaste = () => {
    // Use setTimeout to allow the textarea to update first
    setTimeout(() => {
      const newCode = textareaRef.current?.value ?? "";
      if (newCode !== code) {
        setCode(newCode);
        onChange?.(newCode);

        // Immediate detection on paste
        if (languageMode === "auto") {
          const result = detectImmediate(newCode);
          if (result.isSupported) {
            setDetectedLanguage(result.language);
          }
        }
      }
    }, 0);
  };

  // Handle language selector change
  const handleLanguageChange = (value: "auto" | SupportedLanguage) => {
    if (value === "auto") {
      setLanguageMode("auto");
      // Re-detect current code
      const result = detectImmediate(code);
      if (result.isSupported) {
        setDetectedLanguage(result.language);
      }
    } else {
      setLanguageMode("manual");
      setManualLanguage(value);
    }
  };

  // Handle scroll sync between textarea and highlight layer
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const highlightContainer = textarea
      .closest("[data-editor-root]")
      ?.querySelector("[data-highlight-scroll]") as HTMLElement;
    if (highlightContainer) {
      highlightContainer.scrollTop = textarea.scrollTop;
      highlightContainer.scrollLeft = textarea.scrollLeft;
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 ${className ?? ""}`.trim()}
      data-editor-root
      style={style}
      {...props}
    >
      {/* Language Selector */}
      {showLanguageSelect && (
        <div className="flex justify-end">
          <CodeEditorLanguageSelect
            value={
              languageMode === "auto" ? "auto" : (manualLanguage ?? "auto")
            }
            onChange={handleLanguageChange}
            detectedLanguage={detectedLanguage}
          />
        </div>
      )}

      {/* Editor Container */}
      <div className="relative w-full rounded-lg border border-border-primary bg-bg-input">
        {/* Highlight Layer (behind textarea) */}
        <div
          data-highlight-scroll
          className="absolute inset-0 overflow-hidden rounded-lg"
          style={{
            maxHeight: "400px",
          }}
        >
          <CodeEditorHighlight
            code={code}
            language={resolvedLanguage}
            showLineNumbers={showLineNumbers}
            className="w-full"
          />
        </div>

        {/* Input Layer (transparent textarea on top) */}
        <CodeEditorInput
          ref={textareaRef}
          value={code}
          onChange={(e) => handleCodeChange(e.currentTarget.value)}
          onPaste={handlePaste}
          onScroll={handleScroll}
          placeholder={placeholder}
          style={{
            height: "400px",
            maxHeight: "400px",
          }}
        />
      </div>
    </div>
  );
}
