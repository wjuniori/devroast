"use client";

import type { HTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface CodeBlockClientProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  lang: string;
  showLineNumbers?: boolean;
}

export interface CodeBlockHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockWindowControlsProps
  extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockTitleProps extends HTMLAttributes<HTMLSpanElement> {}

function getLineNumbers(code: string) {
  return code.split("\n").map((_, index) => index + 1);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

const KEYWORDS: Record<string, string[]> = {
  javascript: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "class",
    "import",
    "export",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "throw",
    "new",
    "this",
    "true",
    "false",
    "null",
    "undefined",
    "typeof",
    "instanceof",
  ],
  typescript: [
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "class",
    "import",
    "export",
    "from",
    "async",
    "await",
    "try",
    "catch",
    "throw",
    "new",
    "this",
    "true",
    "false",
    "null",
    "undefined",
    "typeof",
    "instanceof",
    "interface",
    "type",
    "enum",
    "implements",
    "extends",
    "public",
    "private",
    "protected",
    "readonly",
  ],
  python: [
    "def",
    "class",
    "import",
    "from",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "return",
    "try",
    "except",
    "finally",
    "raise",
    "with",
    "as",
    "True",
    "False",
    "None",
    "and",
    "or",
    "not",
    "in",
    "is",
    "lambda",
    "yield",
    "global",
    "nonlocal",
  ],
  java: [
    "public",
    "private",
    "protected",
    "class",
    "interface",
    "extends",
    "implements",
    "static",
    "final",
    "void",
    "int",
    "String",
    "boolean",
    "if",
    "else",
    "for",
    "while",
    "return",
    "try",
    "catch",
    "throw",
    "new",
    "this",
    "true",
    "false",
    "null",
  ],
  sql: [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "LEFT",
    "RIGHT",
    "INNER",
    "OUTER",
    "ON",
    "AND",
    "OR",
    "NOT",
    "IN",
    "IS",
    "NULL",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "TABLE",
    "DROP",
    "ALTER",
    "INDEX",
    "VALUES",
    "SET",
  ],
};

const STRING_REGEX = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
const COMMENT_REGEX = /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/gm;
const NUMBER_REGEX = /\b\d+\.?\d*\b/g;
const KEYWORD_REGEX = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;

function highlightCode(code: string, lang: string): string {
  const normalizedLang = lang.toLowerCase();
  const keywords = KEYWORDS[normalizedLang] || KEYWORDS.javascript;

  let result = escapeHtml(code);

  result = result.replace(
    COMMENT_REGEX,
    (match) => `<span class="text-text-tertiary">${match}</span>`,
  );
  result = result.replace(
    STRING_REGEX,
    (match) => `<span class="text-accent-green">${match}</span>`,
  );
  result = result.replace(
    NUMBER_REGEX,
    (match) => `<span class="text-accent-amber">${match}</span>`,
  );

  result = result.replace(KEYWORD_REGEX, (match) => {
    if (keywords.some((kw) => kw.toLowerCase() === match.toLowerCase())) {
      return `<span class="text-accent-blue">${match}</span>`;
    }
    return match;
  });

  return result;
}

export function CodeBlockClient({
  children,
  className,
  code,
  lang,
  showLineNumbers = true,
  ...props
}: CodeBlockClientProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [highlighted, setHighlighted] = useState(false);
  const lineNumbers = getLineNumbers(code);
  const highlightedCode = highlightCode(code, lang);

  useEffect(() => {
    setHighlighted(true);
  }, []);

  return (
    <div
      className={twMerge(
        "overflow-hidden border border-border-primary bg-bg-input",
        className,
      )}
      {...props}
    >
      {children}
      <div className="grid grid-cols-[auto_1fr]">
        {showLineNumbers ? (
          <div className="border-r border-border-primary bg-bg-surface px-[10px] py-3">
            <div className="grid gap-[6px] text-right font-mono text-[13px] text-text-tertiary">
              {lineNumbers.map((lineNumber) => (
                <span key={lineNumber} className="min-h-[19px] leading-[19px]">
                  {lineNumber}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="code-block-content overflow-x-auto px-3 py-3">
          <pre className="font-mono text-[13px]">
            {highlighted ? (
              <code
                ref={codeRef}
                // biome-ignore lint: custom highlighting with escaped input
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            ) : (
              <code>{code}</code>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function CodeBlockHeader({
  children,
  className,
  ...props
}: CodeBlockHeaderProps) {
  return (
    <div
      className={twMerge(
        "flex h-10 items-center gap-3 border-b border-border-primary px-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CodeBlockWindowControls({
  className,
  ...props
}: CodeBlockWindowControlsProps) {
  return (
    <div className={twMerge("flex items-center gap-2", className)} {...props}>
      <span className="size-2.5 rounded-full bg-accent-red" />
      <span className="size-2.5 rounded-full bg-accent-amber" />
      <span className="size-2.5 rounded-full bg-accent-green" />
    </div>
  );
}

export function CodeBlockTitle({
  children,
  className,
  ...props
}: CodeBlockTitleProps) {
  return (
    <span
      className={twMerge("font-mono text-xs text-text-tertiary", className)}
      {...props}
    >
      {children}
    </span>
  );
}
