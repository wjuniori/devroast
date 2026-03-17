"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";

import { tv, type VariantProps } from "tailwind-variants";

const statusBadgeVariants = tv({
  slots: {
    base: "inline-flex items-center gap-2 font-mono text-xs leading-none",
    dot: "size-2 rounded-full",
    label: "text-current",
  },
  variants: {
    variant: {
      critical: {
        base: "text-accent-red",
        dot: "bg-accent-red",
      },
      warning: {
        base: "text-accent-amber",
        dot: "bg-accent-amber",
      },
      good: {
        base: "text-accent-green",
        dot: "bg-accent-green",
      },
      verdict: {
        base: "text-[13px] text-accent-red",
        dot: "bg-accent-red",
      },
    },
  },
  defaultVariants: {
    variant: "critical",
  },
});

type StatusBadgeSlots = ReturnType<typeof statusBadgeVariants>;

const StatusBadgeContext = createContext<StatusBadgeSlots | null>(null);

function useStatusBadgeContext() {
  const context = useContext(StatusBadgeContext);

  if (!context) {
    throw new Error(
      "StatusBadge compound components must be used within StatusBadgeRoot.",
    );
  }

  return context;
}

export type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>;

export interface StatusBadgeRootProps
  extends HTMLAttributes<HTMLDivElement>,
    StatusBadgeVariants {
  children?: ReactNode;
}

export interface StatusBadgeDotProps extends HTMLAttributes<HTMLSpanElement> {}

export interface StatusBadgeLabelProps
  extends HTMLAttributes<HTMLSpanElement> {}

export function StatusBadgeRoot({
  children,
  className,
  variant,
  ...props
}: StatusBadgeRootProps) {
  const slots = statusBadgeVariants({ variant });

  return (
    <StatusBadgeContext.Provider value={slots}>
      <div className={slots.base({ className })} {...props}>
        {children}
      </div>
    </StatusBadgeContext.Provider>
  );
}

export function StatusBadgeDot({ className, ...props }: StatusBadgeDotProps) {
  const { dot } = useStatusBadgeContext();

  return <span aria-hidden="true" className={dot({ className })} {...props} />;
}

export function StatusBadgeLabel({
  children,
  className,
  ...props
}: StatusBadgeLabelProps) {
  const { label } = useStatusBadgeContext();

  return (
    <span className={label({ className })} {...props}>
      {children}
    </span>
  );
}

export { statusBadgeVariants };
