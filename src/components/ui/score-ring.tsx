import type { CSSProperties, HTMLAttributes } from "react";

import { tv, type VariantProps } from "tailwind-variants";

const scoreRingVariants = tv({
  slots: {
    base: "relative inline-flex items-center justify-center rounded-full",
    svg: "absolute inset-0 size-full -rotate-90 overflow-visible",
    track: "fill-none stroke-border-primary",
    arcPrimary: "fill-none stroke-accent-green",
    arcSecondary: "fill-none stroke-accent-amber",
    center: "relative z-10 flex items-end justify-center gap-0.5",
    score: "font-mono font-bold leading-none text-text-primary",
    max: "font-mono leading-none text-text-tertiary",
  },
  variants: {
    size: {
      sm: {
        base: "size-[120px]",
        score: "text-3xl",
        max: "text-sm",
      },
      md: {
        base: "size-[160px]",
        score: "text-[40px]",
        max: "text-[15px]",
      },
      lg: {
        base: "size-[180px]",
        score: "text-5xl",
        max: "text-base",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

const ringThicknessBySize = {
  sm: 3,
  md: 4,
  lg: 4,
} as const;

const viewBoxSize = 120;
const viewBoxCenter = viewBoxSize / 2;

export type ScoreRingVariants = VariantProps<typeof scoreRingVariants>;

export interface ScoreRingProps
  extends HTMLAttributes<HTMLDivElement>,
    ScoreRingVariants {
  score: number;
  max?: number;
  decimals?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(value: number, decimals: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Number.isInteger(value) ? 0 : decimals,
  });

  return formatter.format(value);
}

export function ScoreRing({
  "aria-label": ariaLabel,
  className,
  decimals = 1,
  max = 10,
  score,
  size = "lg",
  ...props
}: ScoreRingProps) {
  const {
    arcPrimary,
    arcSecondary,
    base,
    center,
    max: maxClass,
    score: scoreClass,
    svg,
    track,
  } = scoreRingVariants({ size });
  const safeMax = max > 0 ? max : 10;
  const clampedScore = clamp(score, 0, safeMax);
  const progress = clampedScore / safeMax;
  const thickness = ringThicknessBySize[size];
  const radius = viewBoxCenter - thickness / 2;
  const circumference = 2 * Math.PI * radius;
  const accentFraction = progress > 0 ? Math.min(progress, 0.035) : 0;
  const primaryFraction = Math.max(progress - accentFraction, 0);
  const primaryLength = circumference * primaryFraction;
  const accentLength = circumference * accentFraction;
  const trackStyle: CSSProperties = { strokeWidth: thickness };
  const primaryStyle: CSSProperties = {
    strokeDasharray: `${primaryLength} ${circumference}`,
    strokeDashoffset: 0,
    strokeLinecap: "round",
    strokeWidth: thickness,
  };
  const accentStyle: CSSProperties = {
    strokeDasharray: `${accentLength} ${circumference}`,
    strokeDashoffset: -primaryLength,
    strokeLinecap: "round",
    strokeWidth: thickness,
  };
  const formattedScore = formatValue(clampedScore, decimals);
  const formattedMax = formatValue(safeMax, 0);

  return (
    <div
      aria-label={ariaLabel ?? `Score ${formattedScore} out of ${formattedMax}`}
      className={base({ className })}
      role="img"
      {...props}
    >
      <svg
        aria-hidden="true"
        className={svg()}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <circle
          className={track()}
          cx={viewBoxCenter}
          cy={viewBoxCenter}
          r={radius}
          style={trackStyle}
        />
        {primaryLength > 0 ? (
          <circle
            className={arcPrimary()}
            cx={viewBoxCenter}
            cy={viewBoxCenter}
            r={radius}
            style={primaryStyle}
          />
        ) : null}
        {accentLength > 0 ? (
          <circle
            className={arcSecondary()}
            cx={viewBoxCenter}
            cy={viewBoxCenter}
            r={radius}
            style={accentStyle}
          />
        ) : null}
      </svg>
      <span className={center()}>
        <span className={scoreClass()}>{formattedScore}</span>
        <span className={maxClass()}>{`/${formattedMax}`}</span>
      </span>
    </div>
  );
}

export { scoreRingVariants };
