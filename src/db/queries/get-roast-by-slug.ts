import { eq } from "drizzle-orm";
import db from "../../db/client";
import {
  type RoastDiffLine,
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../../db/schema";

/**
 * Fetch a complete roast submission with all related data by share slug
 * Using raw query with manual joins
 */
export async function getRoastBySlug(slug: string) {
  // Fetch the submission
  const [submission] = await db
    .select()
    .from(roastSubmissions)
    .where(eq(roastSubmissions.shareSlug, slug))
    .limit(1);

  if (!submission) {
    return null;
  }

  // Fetch analysis items
  const analysisItems = await db
    .select()
    .from(roastAnalysisItems)
    .where(eq(roastAnalysisItems.submissionId, submission.id))
    .orderBy(roastAnalysisItems.displayOrder);

  // Fetch diff block and lines
  const [diffBlock] = await db
    .select()
    .from(roastDiffBlocks)
    .where(eq(roastDiffBlocks.submissionId, submission.id))
    .limit(1);

  let diffLines: RoastDiffLine[] = [];
  if (diffBlock) {
    diffLines = await db
      .select()
      .from(roastDiffLines)
      .where(eq(roastDiffLines.diffBlockId, diffBlock.id))
      .orderBy(roastDiffLines.displayOrder);
  }

  return {
    submission,
    analysisItems,
    diffBlock,
    diffLines,
  };
}
