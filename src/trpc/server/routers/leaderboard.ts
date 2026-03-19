import { and, eq } from "drizzle-orm";
import { z } from "zod";
import db from "@/db/client";
import { roastSubmissions } from "@/db/schema";
import { publicProcedure, router } from "../trpc";

export const leaderboardRouter = router({
  getTopRoasts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      return db.query.roastSubmissions.findMany({
        where: and(
          eq(roastSubmissions.status, "completed"),
          eq(roastSubmissions.visibility, "public"),
        ),
        orderBy: [roastSubmissions.score, roastSubmissions.createdAt],
        limit: input.limit,
      });
    }),
});
