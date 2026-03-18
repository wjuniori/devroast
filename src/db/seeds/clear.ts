import db from "../client";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../schema";

async function clearDatabase() {
  try {
    console.log("🗑️ Clearing database...");

    // Delete in correct order due to foreign keys
    await db.delete(roastDiffLines);
    console.log("✓ Cleared roast_diff_lines");

    await db.delete(roastDiffBlocks);
    console.log("✓ Cleared roast_diff_blocks");

    await db.delete(roastAnalysisItems);
    console.log("✓ Cleared roast_analysis_items");

    await db.delete(roastSubmissions);
    console.log("✓ Cleared roast_submissions");

    console.log("\n✅ Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  }
}

clearDatabase();
