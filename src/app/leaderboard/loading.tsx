const SKELETON_ITEMS = Array.from({ length: 20 }, (_, i) => i);

export default function LeaderboardLoading() {
  return (
    <div className="flex flex-col gap-5">
      {SKELETON_ITEMS.map((i) => (
        <div
          key={`loading-row-${i}`}
          className="flex flex-col overflow-hidden border border-border-primary bg-bg-surface"
        >
          <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
            <div className="flex items-center gap-4">
              <div className="h-4 w-8 animate-pulse rounded bg-bg-page" />
              <div className="h-4 w-12 animate-pulse rounded bg-bg-page" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3 w-16 animate-pulse rounded bg-bg-page" />
              <div className="h-3 w-12 animate-pulse rounded bg-bg-page" />
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border-primary bg-bg-page p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
              <div className="h-4 w-full animate-pulse rounded bg-bg-surface" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-bg-surface" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
