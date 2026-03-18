import { count, sql } from "drizzle-orm";
import db from "../client";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../schema";

async function validateSeed() {
  try {
    // Total roasts
    const totalCount = await db
      .select({ count: count() })
      .from(roastSubmissions);

    console.log("📊 Seed Validation Results:");
    console.log("================================");
    console.log(`✓ Total roasts: ${totalCount[0].count}`);

    // By visibility
    const stats = await db
      .select({
        visibility: roastSubmissions.visibility,
        count: count(),
      })
      .from(roastSubmissions)
      .groupBy(roastSubmissions.visibility);

    console.log("\nRoasts by visibility:");
    stats.forEach((row) => {
      console.log(`  - ${row.visibility}: ${row.count}`);
    });

    // By language
    const byLanguage = await db
      .select({
        language: roastSubmissions.language,
        count: count(),
      })
      .from(roastSubmissions)
      .groupBy(roastSubmissions.language);

    console.log("\n📚 Roasts by language:");
    byLanguage.forEach((row) => {
      console.log(`  - ${row.language}: ${row.count}`);
    });

    // Analysis items count
    const analysisCount = await db
      .select({ count: count() })
      .from(roastAnalysisItems);

    console.log(`\n📝 Analysis items: ${analysisCount[0].count}`);

    // Diff blocks count
    const diffBlocksCount = await db
      .select({ count: count() })
      .from(roastDiffBlocks);

    console.log(`📋 Diff blocks: ${diffBlocksCount[0].count}`);

    // Diff lines count
    const diffLinesCount = await db
      .select({ count: count() })
      .from(roastDiffLines);

    console.log(`📄 Diff lines: ${diffLinesCount[0].count}`);

    // Average score
    const scoreStats = await db
      .select({
        avgScore: sql<string>`avg(score)`,
        minScore: sql<string>`min(score)`,
        maxScore: sql<string>`max(score)`,
      })
      .from(roastSubmissions);

    const avg = parseFloat(scoreStats[0].avgScore || "0").toFixed(2);
    const min = parseFloat(scoreStats[0].minScore || "0").toFixed(2);
    const max = parseFloat(scoreStats[0].maxScore || "0").toFixed(2);

    console.log(`\n⭐ Score statistics:`);
    console.log(`  - Average: ${avg}`);
    console.log(`  - Min: ${min}`);
    console.log(`  - Max: ${max}`);

    console.log("\n✅ Validation complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Validation error:", error);
    process.exit(1);
  }
}

validateSeed();
