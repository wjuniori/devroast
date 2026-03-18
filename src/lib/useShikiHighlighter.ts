"use client";

import { useCallback, useRef } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

interface ShikiHighlighter {
  highlight(code: string, language: BundledLanguage): Promise<string>;
}

// Singleton instance to avoid re-creating the highlighter on every use
let highlighterInstance: ShikiHighlighter | null = null;

/**
 * Client-side hook for Shiki syntax highlighting.
 * Maintains a single highlighter instance across component re-renders.
 * Preloads common languages and lazy-loads additional languages on demand.
 */
export function useShikiHighlighter() {
  const isInitializingRef = useRef(false);

  const getHighlighter = useCallback(async (): Promise<ShikiHighlighter> => {
    if (highlighterInstance) {
      return highlighterInstance;
    }

    if (isInitializingRef.current) {
      // Wait for initialization to complete
      let attempts = 0;
      while (!highlighterInstance && attempts < 100) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }
      if (highlighterInstance) {
        return highlighterInstance;
      }
    }

    isInitializingRef.current = true;

    try {
      highlighterInstance = {
        highlight: async (code: string, language: BundledLanguage) => {
          try {
            const html = await codeToHtml(code, {
              lang: language,
              theme: "vesper",
            });
            // Return the complete HTML with pre/code wrapper
            // The CodeEditorHighlight component will inject this into a container
            return html;
          } catch (error) {
            console.error(
              `Failed to highlight code with language ${language}:`,
              error,
            );
            // Fallback to plaintext rendering
            return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
          }
        },
      };

      return highlighterInstance;
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  const highlight = useCallback(
    async (code: string, language: BundledLanguage): Promise<string> => {
      const highlighter = await getHighlighter();
      return highlighter.highlight(code, language);
    },
    [getHighlighter],
  );

  return { highlight, getHighlighter };
}

/**
 * Escapes HTML special characters to prevent XSS.
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
