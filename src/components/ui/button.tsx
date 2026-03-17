import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const buttonVariants = tv({
  base: [
    "inline-flex cursor-pointer items-center justify-center gap-2",
    "whitespace-nowrap rounded-none px-6 py-2.5",
    "bg-accent-green font-mono text-[13px] font-medium text-text-inverse outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-border-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-accent-green text-text-inverse hover:bg-accent-green-hover active:bg-accent-green-active",
      secondary:
        "bg-bg-surface text-text-primary hover:bg-bg-elevated active:border active:border-border-primary active:bg-bg-surface",
      ghost:
        "bg-transparent text-text-primary hover:bg-bg-surface active:bg-bg-elevated",
      outline:
        "border border-border-primary bg-transparent text-text-primary hover:bg-bg-surface active:bg-bg-elevated",
    },
    size: {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-2.5 text-[13px]",
      lg: "px-7 py-3 text-sm",
      icon: "size-10 px-0 py-0",
    },
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  children,
  className,
  fullWidth,
  leadingIcon,
  size,
  trailingIcon,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonVariants({ variant, size, fullWidth, className })}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

export { buttonVariants };
