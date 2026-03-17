import type { HTMLAttributes } from "react";

import { tv, type VariantProps } from "tailwind-variants";

const cardVariants = tv({
  base: "border border-border-primary bg-bg-surface",
  variants: {
    variant: {
      default: "",
      elevated: "bg-bg-elevated",
      inset: "bg-bg-page",
    },
    padding: {
      none: "",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

const cardHeaderVariants = tv({
  base: "flex flex-col gap-2",
});

const cardTitleVariants = tv({
  base: "font-mono text-[13px] text-text-primary",
});

const cardDescriptionVariants = tv({
  base: "font-sans text-sm leading-6 text-text-secondary",
});

const cardContentVariants = tv({
  base: "",
});

export type CardVariants = VariantProps<typeof cardVariants>;

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    CardVariants {}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({
  children,
  className,
  padding,
  variant,
  ...props
}: CardProps) {
  return (
    <div className={cardVariants({ variant, padding, className })} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cardHeaderVariants({ className })} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 className={cardTitleVariants({ className })} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cardDescriptionVariants({ className })} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={cardContentVariants({ className })} {...props}>
      {children}
    </div>
  );
}

export { cardVariants };
