export function LeaderboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid grid-cols-[50px_70px_1fr_100px] items-center gap-4 border border-border-primary bg-bg-page p-5">
        <div className="h-4 w-4 animate-pulse rounded-full bg-bg-surface" />
        <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-bg-surface" />
          <div className="h-4 w-24 animate-pulse rounded bg-bg-surface" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-bg-surface" />
      </div>
      <div className="grid grid-cols-[50px_70px_1fr_100px] items-center gap-4 border border-border-primary bg-bg-page p-5">
        <div className="h-4 w-4 animate-pulse rounded-full bg-bg-surface" />
        <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-bg-surface" />
          <div className="h-4 w-24 animate-pulse rounded bg-bg-surface" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-bg-surface" />
      </div>
      <div className="grid grid-cols-[50px_70px_1fr_100px] items-center gap-4 border border-border-primary bg-bg-page p-5">
        <div className="h-4 w-4 animate-pulse rounded-full bg-bg-surface" />
        <div className="h-4 w-12 animate-pulse rounded bg-bg-surface" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-bg-surface" />
          <div className="h-4 w-24 animate-pulse rounded bg-bg-surface" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-bg-surface" />
      </div>
    </div>
  );
}
