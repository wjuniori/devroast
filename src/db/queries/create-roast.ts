import db from "../../db/client";
import type {
  NewRoastAnalysisItem,
  NewRoastDiffBlock,
  NewRoastDiffLine,
  NewRoastSubmission,
} from "../../db/schema";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "../../db/schema";

interface RoastData {
  submission: Omit<NewRoastSubmission, "id" | "createdAt" | "updatedAt">;
  analysisItems: Omit<
    NewRoastAnalysisItem,
    "id" | "submissionId" | "createdAt"
  >[];
  diffBlock: Omit<NewRoastDiffBlock, "id" | "submissionId" | "createdAt">;
  diffLines: Omit<NewRoastDiffLine, "id" | "diffBlockId">[];
}

/**
 * Atomically create a complete roast submission with all related data
 * Using raw SQL queries for better control without Drizzle relations
 */
export async function createRoast(data: RoastData) {
  try {
    // Start transaction-like operation
    // Insert submission
    const [submission] = await db
      .insert(roastSubmissions)
      .values(data.submission)
      .returning();

    if (!submission) {
      throw new Error("Failed to create roast submission");
    }

    // Insert analysis items
    if (data.analysisItems.length > 0) {
      const analysisWithSubmissionId = data.analysisItems.map((item) => ({
        ...item,
        submissionId: submission.id,
      }));

      await db.insert(roastAnalysisItems).values(analysisWithSubmissionId);
    }

    // Insert diff block
    const diffBlockData = {
      ...data.diffBlock,
      submissionId: submission.id,
    };
    const [diffBlock] = await db
      .insert(roastDiffBlocks)
      .values(diffBlockData)
      .returning();

    if (!diffBlock) {
      throw new Error("Failed to create diff block");
    }

    // Insert diff lines
    if (data.diffLines.length > 0) {
      const diffLinesWithBlockId = data.diffLines.map((line) => ({
        ...line,
        diffBlockId: diffBlock.id,
      }));

      await db.insert(roastDiffLines).values(diffLinesWithBlockId);
    }

    return submission.id;
  } catch (error) {
    console.error("Error creating roast:", error);
    throw error;
  }
}
