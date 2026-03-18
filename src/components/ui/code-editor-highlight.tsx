"use client";

import {
  type HTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { LANGUAGE_TO_SHIKI, type SupportedLanguage } from "@/lib/languages";
import { useShikiHighlighter } from "@/lib/useShikiHighlighter";

export interface CodeEditorHighlightProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * The code to highlight.
   */
  code: string;
  /**
   * The language to highlight with.
   */
  language: SupportedLanguage | null;
  /**
   * Whether to show line numbers.
   * @default true
   */
  showLineNumbers?: boolean;
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
}

/**
 * Shiki-rendered syntax-highlighted code layer for the code editor.
 * Displays syntax-highlighted HTML underneath the input textarea.
 * Handles language loading and fallback to plaintext.
 */
export function CodeEditorHighlight({
  code,
  language,
  showLineNumbers = true,
  className,
  style,
  ...props
}: CodeEditorHighlightProps) {
  const { highlight } = useShikiHighlighter();
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const containerId = useId();

  useEffect(() => {
    const highlightCode = async () => {
      if (!code) {
        setHighlightedHtml("");
        return;
      }

      setIsLoading(true);

      try {
        // Use provided language or fallback to plaintext
        // biome-ignore lint/suspicious/noExplicitAny: Shiki supports plaintext at runtime
        const shikiLang: any = language
          ? LANGUAGE_TO_SHIKI[language]
          : "plaintext";

        const html = await highlight(code, shikiLang);
        setHighlightedHtml(html);
      } catch (error) {
        console.error("Failed to highlight code:", error);
        // Fallback to plaintext on error
        setHighlightedHtml(
          `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [code, language, highlight]);

  // Inject highlighted HTML into DOM
  useEffect(() => {
    const container = document.getElementById(`${containerId}-content`);
    if (container && highlightedHtml) {
      container.innerHTML = highlightedHtml;
    }
  }, [containerId, highlightedHtml]);

  // Calculate line count for rendering line numbers
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // Generate line numbers with stable keys
  const lineNumbers = useMemo(
    () =>
      Array.from({ length: lineCount }, (_, i) => ({
        number: i + 1,
        id: i,
      })),
    [lineCount],
  );

  return (
    <div
      className={`pointer-events-none relative w-full overflow-auto ${className ?? ""}`.trim()}
      style={style}
      {...props}
    >
      <div className="flex min-h-full">
        {/* Line numbers column (optional) */}
        {showLineNumbers && (
          <div className="flex select-none flex-col bg-transparent px-3 py-4 text-right font-mono text-sm text-text-tertiary">
            {lineNumbers.map((line) => (
              <div
                key={line.id}
                style={{ lineHeight: 1.5 }}
                suppressHydrationWarning
              >
                {line.number}
              </div>
            ))}
          </div>
        )}

        {/* Highlighted code column */}
        <div className="flex-1 overflow-auto">
          <pre
            id={`${containerId}-content`}
            className="m-0 overflow-visible font-mono text-base leading-[1.5] text-text-primary whitespace-pre-wrap"
          />
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-bg-page/50 opacity-25" />
      )}
    </div>
  );
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
