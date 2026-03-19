import { and, eq } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { LeaderboardFull } from "@/components/leaderboard/leaderboard-full";
import { LeaderboardSkeleton } from "@/components/leaderboard/leaderboard-skeleton";
import db from "@/db/client";
import { roastSubmissions } from "@/db/schema";

export const metadata = {
  title: "Shame Leaderboard | Devroast",
  description: "The most roasted code on the internet, ranked by shame",
};

async function getLeaderboardData() {
  "use cache";
  cacheLife({ revalidate: 3600 });
  return db.query.roastSubmissions.findMany({
    where: and(
      eq(roastSubmissions.status, "completed"),
      eq(roastSubmissions.visibility, "public"),
    ),
    orderBy: [roastSubmissions.score, roastSubmissions.createdAt],
    limit: 20,
  });
}

export default async function LeaderboardPage() {
  const roasts = await getLeaderboardData();

  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-20 py-10">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold leading-none text-accent-green">
                &gt;
              </span>
              <h1 className="font-mono text-[28px] font-bold leading-none text-text-primary">
                shame_leaderboard
              </h1>
            </div>

            <p className="font-mono text-sm font-normal text-text-secondary">
              {"// the most roasted code on the internet"}
            </p>
          </div>
        </section>

        <Suspense fallback={<LeaderboardSkeleton />}>
          <LeaderboardFull initialData={roasts} />
        </Suspense>
      </div>
    </main>
  );
}
