"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import db from "@/db/client"
import { roastSubmissions, roastAnalysisItems, roastDiffBlocks, roastDiffLines } from "@/db/schema"
import { callOpenAI } from "@/lib/ai"

export async function createRoast(formData: FormData) {
  const code = formData.get("code") as string
  const language = formData.get("language") as string
  const mode = (formData.get("mode") as string) as "roast" | "honest"

  // Validate input
  if (!code || code.length > 2000) {
    throw new Error("Invalid code length")
  }

  if (!language) {
    throw new Error("Language is required")
  }

  // 1. Create submission in DB with status "queued"
  const [submission] = await db.insert(roastSubmissions).values({
    sourceCode: code,
    sourceLineCount: code.split("\n").length,
    language: language as any,
    mode: (mode || "roast") as any,
    status: "queued" as any,
  }).returning()

  try {
    // 2. Call OpenAI (GPT-4o-mini)
    const result = await callOpenAI(code, language, mode || "roast")

    // 3. Update submission with result
    await db.update(roastSubmissions)
      .set({
        score: result.score.toString(),
        verdict: result.verdict,
        headline: result.headline,
        summary: result.summary,
        modelName: "gpt-4o-mini",
        status: "completed",
      })
      .where(eq(roastSubmissions.id, submission.id))

    // 4. Save analysis items if present
    if (result.issues && result.issues.length > 0) {
      await db.insert(roastAnalysisItems).values(
        result.issues.map((issue, idx) => ({
          submissionId: submission.id,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          displayOrder: idx,
        }))
      )
    }

    // 5. Save diff blocks if present
    if (result.diff) {
      const [diffBlock] = await db.insert(roastDiffBlocks).values({
        submissionId: submission.id,
        fromLabel: result.diff.fromLabel || "original.ts",
        toLabel: result.diff.toLabel || "fixed.ts",
      }).returning()

      if (result.diff.lines && result.diff.lines.length > 0) {
        await db.insert(roastDiffLines).values(
          result.diff.lines.map((line, idx) => ({
            diffBlockId: diffBlock.id,
            kind: line.kind as any,
            content: line.content,
            displayOrder: idx,
          }))
        )
      }
    }
  } catch (error) {
    // On failure, save error and redirect to result page
    await db.update(roastSubmissions)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(roastSubmissions.id, submission.id))
  }

  // 6. Redirect to result page
  redirect(`/roast/${submission.id}`)
}