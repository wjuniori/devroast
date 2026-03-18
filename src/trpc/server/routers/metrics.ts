import { and, eq, sql } from "drizzle-orm";
import db from "@/db/client";
import { roastSubmissions } from "@/db/schema";
import { publicProcedure, router } from "../trpc";

export const metricsRouter = router({
  getMetrics: publicProcedure.query(async () => {
    const result = await db
      .select({
        totalRoasts: sql<number>`count(*)::int`,
        avgScore: sql<number>`coalesce(avg(${roastSubmissions.score})::numeric(3,1), 0)::numeric(3,1)`,
      })
      .from(roastSubmissions)
      .where(
        and(
          eq(roastSubmissions.status, "completed"),
          eq(roastSubmissions.visibility, "public"),
        ),
      );

    return {
      totalRoasts: result[0]?.totalRoasts ?? 0,
      avgScore: Number(result[0]?.avgScore ?? 0),
    };
  }),
});
