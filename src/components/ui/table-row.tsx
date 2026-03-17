"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";

import { tv, type VariantProps } from "tailwind-variants";

const tableRowVariants = tv({
  slots: {
    base: "flex items-center gap-6 border-b border-border-primary px-5 py-4 font-mono",
    rankCell: "w-10 shrink-0",
    scoreCell: "w-[60px] shrink-0",
    previewCell: "min-w-0 flex-1",
    languageCell: "w-[100px] shrink-0",
    rank: "text-[13px] text-text-tertiary",
    score: "text-[13px] font-bold",
    preview: "flex flex-col gap-[3px] text-xs leading-4",
    previewLine: "block text-text-primary",
    previewLineMuted: "block text-[#8b8b8b]",
    language: "text-xs text-text-tertiary",
  },
  variants: {
    bordered: {
      true: {
        base: "border-b border-border-primary",
      },
      false: {
        base: "border-b-0",
      },
    },
    rankTone: {
      default: {
        rank: "text-text-tertiary",
      },
      accent: {
        rank: "text-accent-amber",
      },
    },
    scoreTone: {
      critical: {
        score: "text-accent-red",
      },
      warning: {
        score: "text-accent-amber",
      },
      good: {
        score: "text-accent-green",
      },
    },
  },
  defaultVariants: {
    bordered: true,
    rankTone: "default",
    scoreTone: "critical",
  },
});

type TableRowSlots = ReturnType<typeof tableRowVariants>;

const TableRowContext = createContext<TableRowSlots | null>(null);

function useTableRowContext() {
  const context = useContext(TableRowContext);

  if (!context) {
    throw new Error(
      "TableRow compound components must be used within TableRowRoot.",
    );
  }

  return context;
}

export type TableRowVariants = VariantProps<typeof tableRowVariants>;

export interface TableRowRootProps
  extends HTMLAttributes<HTMLDivElement>,
    TableRowVariants {
  children?: ReactNode;
}

export interface TableRowRankProps extends HTMLAttributes<HTMLSpanElement> {}

export interface TableRowScoreProps extends HTMLAttributes<HTMLSpanElement> {}

export interface TableRowPreviewProps extends HTMLAttributes<HTMLDivElement> {}

export interface TableRowPreviewLineProps
  extends HTMLAttributes<HTMLSpanElement> {
  muted?: boolean;
}

export interface TableRowLanguageProps
  extends HTMLAttributes<HTMLSpanElement> {}

export function TableRowRoot({
  bordered,
  children,
  className,
  rankTone,
  scoreTone,
  ...props
}: TableRowRootProps) {
  const slots = tableRowVariants({ bordered, rankTone, scoreTone });

  return (
    <TableRowContext.Provider value={slots}>
      <div className={slots.base({ className })} {...props}>
        {children}
      </div>
    </TableRowContext.Provider>
  );
}

export function TableRowRank({
  children,
  className,
  ...props
}: TableRowRankProps) {
  const { rank, rankCell } = useTableRowContext();

  return (
    <div className={rankCell()}>
      <span className={rank({ className })} {...props}>
        {children}
      </span>
    </div>
  );
}

export function TableRowScore({
  children,
  className,
  ...props
}: TableRowScoreProps) {
  const { score, scoreCell } = useTableRowContext();

  return (
    <div className={scoreCell()}>
      <span className={score({ className })} {...props}>
        {children}
      </span>
    </div>
  );
}

export function TableRowPreview({
  children,
  className,
  ...props
}: TableRowPreviewProps) {
  const { preview, previewCell } = useTableRowContext();

  return (
    <div className={previewCell()}>
      <div className={preview({ className })} {...props}>
        {children}
      </div>
    </div>
  );
}

export function TableRowPreviewLine({
  children,
  className,
  muted = false,
  ...props
}: TableRowPreviewLineProps) {
  const { previewLine, previewLineMuted } = useTableRowContext();

  return (
    <span
      className={
        muted ? previewLineMuted({ className }) : previewLine({ className })
      }
      {...props}
    >
      {children}
    </span>
  );
}

export function TableRowLanguage({
  children,
  className,
  ...props
}: TableRowLanguageProps) {
  const { language, languageCell } = useTableRowContext();

  return (
    <div className={languageCell()}>
      <span className={language({ className })} {...props}>
        {children}
      </span>
    </div>
  );
}

export { tableRowVariants };
