"use client";

import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface CodeBlockClientProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  lang: string;
  highlightedHtml?: string;
  showLineNumbers?: boolean;
}

export interface CodeBlockHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockWindowControlsProps
  extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockTitleProps extends HTMLAttributes<HTMLSpanElement> {}

function getLineNumbers(code: string) {
  return code.split("\n").map((_, index) => index + 1);
}

export function CodeBlockClient({
  children,
  className,
  code,
  highlightedHtml,
  showLineNumbers = true,
  ...props
}: CodeBlockClientProps) {
  const lineNumbers = getLineNumbers(code);

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

        <div className="code-block-content overflow-x-auto px-3 py-3 font-mono text-[13px]">
          {highlightedHtml ? (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki returns trusted server-generated HTML
            <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <pre className="whitespace-pre-wrap">
              <code>{code}</code>
            </pre>
          )}
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
