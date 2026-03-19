"use client";

import {
  TableRowLanguage,
  TableRowPreview,
  TableRowPreviewLine,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui/table-row";
import type { RoastSubmission } from "@/db/schema/roast-submissions";
import { trpc } from "@/trpc/client";

interface LeaderboardProps {
  initialData?: RoastSubmission[];
}

export function LeaderboardDisplay({ initialData }: LeaderboardProps) {
  const { data } = trpc.metrics.worstRoasts.useQuery(undefined, {
    staleTime: 60 * 1000,
    initialData,
  });

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
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((roast, idx) => (
        <TableRowRoot
          key={roast.id}
          bordered={idx !== data.length - 1}
          scoreTone="critical"
        >
          <TableRowRank>{idx + 1}</TableRowRank>
          <TableRowScore>{Number(roast.score).toFixed(1)}</TableRowScore>
          <TableRowPreview>
            {roast.sourceCode
              .split("\n")
              .slice(0, 3)
              .map((line) => (
                <TableRowPreviewLine key={`${roast.id}-${line.slice(0, 20)}`}>
                  {line}
                </TableRowPreviewLine>
              ))}
          </TableRowPreview>
          <TableRowLanguage>{roast.language}</TableRowLanguage>
        </TableRowRoot>
      ))}
    </div>
  );
}
