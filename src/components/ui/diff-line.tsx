import type { HTMLAttributes, ReactNode } from "react";

import { tv, type VariantProps } from "tailwind-variants";

const diffLineVariants = tv({
  slots: {
    base: "flex items-start gap-2 px-4 py-2 font-mono text-[13px]",
    prefix: "w-3 shrink-0 text-left",
    content: "min-w-0 text-wrap break-all",
  },
  variants: {
    variant: {
      removed: {
        base: "bg-diff-removed-bg",
        prefix: "text-accent-red",
        content: "text-text-secondary",
      },
      added: {
        base: "bg-diff-added-bg",
        prefix: "text-accent-green",
        content: "text-text-primary",
      },
      context: {
        base: "bg-diff-context-bg",
        prefix: "text-text-tertiary",
        content: "text-text-secondary",
      },
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const defaultPrefixes = {
  added: "+",
  context: " ",
  removed: "-",
} as const;

export type DiffLineVariants = VariantProps<typeof diffLineVariants>;

export interface DiffLineProps
  extends HTMLAttributes<HTMLDivElement>,
    DiffLineVariants {
  children: ReactNode;
  prefix?: string;
}

export function DiffLine({
  children,
  className,
  prefix,
  variant = "context",
  ...props
}: DiffLineProps) {
  const { base, content, prefix: prefixClass } = diffLineVariants({ variant });

  return (
    <div className={base({ className })} {...props}>
      <span aria-hidden="true" className={prefixClass()}>
        {prefix ?? defaultPrefixes[variant]}
      </span>
      <span className={content()}>{children}</span>
    </div>
  );
}

export { diffLineVariants };
