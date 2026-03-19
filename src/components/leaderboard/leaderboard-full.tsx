"use client";

import type { RoastSubmission } from "@/db/schema/roast-submissions";
import { trpc } from "@/trpc/client";
import { RoastCard } from "./roast-card";

interface LeaderboardFullProps {
  initialData?: RoastSubmission[];
}

export function LeaderboardFull({ initialData }: LeaderboardFullProps) {
  const { data } = trpc.leaderboard.getTopRoasts.useQuery(
    { limit: 20 },
    {
      staleTime: 60 * 1000,
      initialData,
    },
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="font-sans text-xs text-text-tertiary">
          No roasts found.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {data.map((roast, idx) => (
        <RoastCard key={roast.id} roast={roast} rank={idx + 1} />
      ))}
    </div>
  );
}
