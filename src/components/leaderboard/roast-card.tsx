"use client";

import { useState } from "react";
import { CodeBlockClient } from "@/components/ui/code-block-client";
import type { RoastSubmission } from "@/db/schema/roast-submissions";

interface RoastCardProps {
  roast: RoastSubmission;
  rank: number;
}

const PREVIEW_LINES = 3;

export function RoastCard({ roast, rank }: RoastCardProps) {
  const [open, setOpen] = useState(false);
  const lineCount = roast.sourceCode.split("\n").length;
  const previewCode = roast.sourceCode
    .split("\n")
    .slice(0, PREVIEW_LINES)
    .join("\n");
  const isLongCode = lineCount > PREVIEW_LINES;

  return (
    <div className="overflow-hidden border border-border-primary bg-bg-surface">
      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-between border-b border-border-primary px-5 hover:bg-bg-page"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-accent-amber">
            #{rank}
          </span>
          <span className="font-mono text-sm font-bold text-accent-red">
            {Number(roast.score).toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">
            {roast.language}
          </span>
          <span className="font-mono text-xs text-text-tertiary">
            {lineCount} lines
          </span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {isLongCode ? (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? "max-h-[500px] overflow-y-auto" : "max-h-[120px]"
          }`}
        >
          <CodeBlockClient
            className="border-t border-border-primary"
            code={open ? roast.sourceCode : previewCode}
            lang={roast.language}
            showLineNumbers
          />
        </div>
      ) : (
        <CodeBlockClient
          className="border-t border-border-primary"
          code={roast.sourceCode}
          lang={roast.language}
          showLineNumbers
        />
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-4 text-text-tertiary transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
