import { and, desc, eq, isNotNull } from "drizzle-orm";
import db from "../../db/client";
import { roastSubmissions } from "../../db/schema";

interface LeaderboardEntry {
  id: string;
  score: string;
  language: string;
  sourceLineCount: number;
  sourceCode: string;
  shareSlug: string | null;
  createdAt: Date;
}

/**
 * Fetch leaderboard entries (public roasts sorted by score ascending)
 * Using Drizzle select without relations, raw joins with manual SQL
 */
export async function getLeaderboard(limit: number = 50, offset: number = 0) {
  const entries = await db
    .select({
      id: roastSubmissions.id,
      score: roastSubmissions.score,
      language: roastSubmissions.language,
      sourceLineCount: roastSubmissions.sourceLineCount,
      sourceCode: roastSubmissions.sourceCode,
      shareSlug: roastSubmissions.shareSlug,
      createdAt: roastSubmissions.createdAt,
    })
    .from(roastSubmissions)
    .where(
      and(
        eq(roastSubmissions.visibility, "public"),
        eq(roastSubmissions.status, "completed"),
        isNotNull(roastSubmissions.score),
      ),
    )
    .orderBy(roastSubmissions.score, desc(roastSubmissions.createdAt))
    .limit(limit)
    .offset(offset);

  return entries as LeaderboardEntry[];
}

/**
 * Get total count of public completed roasts for pagination
 */
export async function getLeaderboardCount() {
  const [result] = await db
    .select({ count: roastSubmissions.id })
    .from(roastSubmissions)
    .where(
      and(
        eq(roastSubmissions.visibility, "public"),
        eq(roastSubmissions.status, "completed"),
        isNotNull(roastSubmissions.score),
      ),
    );

  return result?.count ? 1 : 0;
}
