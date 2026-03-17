import "server-only";

import type { HTMLAttributes, ReactNode } from "react";
import { cache } from "react";

import { type BundledLanguage, codeToHtml } from "shiki";
import { twMerge } from "tailwind-merge";

export interface CodeBlockRootProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  code: string;
  lang: BundledLanguage;
  showLineNumbers?: boolean;
}

export interface CodeBlockHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockWindowControlsProps
  extends HTMLAttributes<HTMLDivElement> {}

export interface CodeBlockTitleProps extends HTMLAttributes<HTMLSpanElement> {}

function getLineNumbers(code: string) {
  return code.split("\n").map((_, index) => index + 1);
}

const highlightCode = cache(async (code: string, lang: BundledLanguage) => {
  return codeToHtml(code, {
    lang,
    theme: "vesper",
  });
});

export async function CodeBlockRoot({
  children,
  className,
  code,
  lang,
  showLineNumbers = true,
  ...props
}: CodeBlockRootProps) {
  const html = await highlightCode(code, lang);
  const normalizedHtml = html.replace(/background-color:[^;"']+;?/g, "");
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
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki returns trusted server-generated HTML. */}
          <div dangerouslySetInnerHTML={{ __html: normalizedHtml }} />
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
