"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

export function MetricsDisplay() {
  const [displayValue, setDisplayValue] = useState({
    totalRoasts: 0,
    avgScore: 0,
  });
  const [isAnimating, setIsAnimating] = useState(true);

  const { data } = trpc.metrics.getMetrics.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setIsAnimating(true);
      setDisplayValue({
        totalRoasts: data.totalRoasts,
        avgScore: data.avgScore,
      });

      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [data]);

  return (
    <div className="flex items-center justify-center gap-6 text-center max-md:flex-wrap">
      <span className="font-sans text-xs text-text-tertiary">
        <NumberFlow value={displayValue.totalRoasts} willChange={isAnimating} />{" "}
        codes roasted
      </span>
      <span aria-hidden="true" className="font-mono text-xs text-text-tertiary">
        ·
      </span>
      <span className="font-sans text-xs text-text-tertiary">
        avg score:{" "}
        <NumberFlow
          value={displayValue.avgScore}
          willChange={isAnimating}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        />
        /10
      </span>
    </div>
  );
}
