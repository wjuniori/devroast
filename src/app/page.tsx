import { and, eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { LeaderboardDisplay } from "@/components/leaderboard/leaderboard-display";
import { LeaderboardSkeleton } from "@/components/leaderboard/leaderboard-skeleton";
import { MetricsDisplay } from "@/components/metrics/metrics-display";
import { buttonVariants } from "@/components/ui/button";
import db from "@/db/client";
import { roastSubmissions } from "@/db/schema";
import { CodeEditorSection } from "./components/code-editor-section";

async function getWorstRoasts() {
  "use cache";
  cacheLife({ revalidate: 3600 });
  return db.query.roastSubmissions.findMany({
    where: and(
      eq(roastSubmissions.status, "completed"),
      eq(roastSubmissions.visibility, "public"),
    ),
    orderBy: [roastSubmissions.score],
    limit: 3,
  });
}

export default async function Home() {
  const roasts = await getWorstRoasts();

  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-10 pt-20">
        <Suspense fallback={null}>
          <CodeEditorSection />
        </Suspense>

        <div className="h-[60px] w-full" />

        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-[60px]">
          <div className="flex items-center justify-center gap-6 text-center max-md:flex-wrap">
            <MetricsDisplay />
          </div>
        </section>

        <div className="h-[60px] w-full" />

        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-[60px]">
          <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold leading-none text-accent-green">
                  {"//"}
                </span>
                <h2 className="font-mono text-sm font-bold leading-none text-text-primary">
                  shame_leaderboard
                </h2>
              </div>

              <p className="font-sans text-[13px] text-text-tertiary">
                {"// the worst code on the internet, ranked by shame"}
              </p>
            </div>

            <Link
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8 px-3 text-xs",
              })}
              href="/leaderboard"
            >
              $ view_all &gt;&gt;
            </Link>
          </div>

          <Suspense fallback={<LeaderboardSkeleton />}>
            <LeaderboardDisplay initialData={roasts} />
          </Suspense>

          <div className="flex justify-center pt-4">
            <p className="font-sans text-xs text-text-tertiary">
              showing worst 3 ·{" "}
              <Link
                className="transition-colors hover:text-text-primary"
                href="/leaderboard"
              >
                view full leaderboard &gt;&gt;
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
