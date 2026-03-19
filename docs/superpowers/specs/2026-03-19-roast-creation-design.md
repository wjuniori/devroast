# Roast Creation Feature - Design Spec

## Overview

Implement the core functionality for users to submit code and receive AI-powered analysis (roast). This feature allows users to paste code, select programming language and mode (roast/honest), and receive a scored evaluation with issues and suggested fixes.

## User Flow

1. User navigates to homepage
2. User pastes code into editor (max 2000 chars)
3. User selects language from dropdown
4. User toggles roast mode (default: on)
5. User clicks "roast_my_code" button
6. Server Action processes the code via OpenAI
7. Results are saved to database
8. User is redirected to `/roast/[id]` to view results

## Architecture

### Server Action (`src/app/actions.ts`)

```typescript
"use server"

import { redirect } from "next/navigation"
import db from "@/db/client"
import { roastSubmissions } from "@/db/schema"
import { callOpenAI } from "@/lib/ai"

export async function createRoast(formData: FormData) {
  const code = formData.get("code") as string
  const language = formData.get("language") as string
  const mode = formData.get("mode") as "roast" | "honest"

  // Validate input
  if (!code || code.length > 2000) {
    throw new Error("Invalid code length")
  }

  // 1. Create submission in DB with status "queued"
  const [submission] = await db.insert(roastSubmissions).values({
    sourceCode: code,
    sourceLineCount: code.split("\n").length,
    language,
    mode,
    status: "queued",
  }).returning()

  try {
    // 2. Call OpenAI (GPT-4o-mini)
    const result = await callOpenAI(code, language, mode)

    // 3. Update submission with result
    await db.update(roastSubmissions)
      .set({
        score: result.score,
        verdict: result.verdict,
        headline: result.headline,
        summary: result.summary,
        modelName: "gpt-4o-mini",
        status: "completed",
      })
      .where(eq(roastSubmissions.id, submission.id))

    // 4. Save analysis items
    if (result.issues?.length) {
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
        fromLabel: result.diff.fromLabel,
        toLabel: result.diff.toLabel,
      }).returning()

      if (result.diff.lines?.length) {
        await db.insert(roastDiffLines).values(
          result.diff.lines.map((line, idx) => ({
            blockId: diffBlock.id,
            kind: line.kind,
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
```

### AI Integration (`src/lib/ai.ts`)

```typescript
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIRoastResult {
  score: number
  verdict: "needs_serious_help" | "rough_but_fixable" | "actually_not_bad" | "clean_enough"
  headline: string
  summary: string
  issues?: Array<{
    title: string
    description: string
    severity: "critical" | "warning" | "good"
  }>
  diff?: {
    fromLabel: string
    toLabel: string
    lines: Array<{
      kind: "context" | "added" | "removed"
      content: string
    }>
  }
}

const ROAST_SYSTEM_PROMPT = `You are a sarcastic code reviewer. Roast this code mercilessly but be helpful. Make jokes about the code quality. Respond with valid JSON in this exact format:
{
  "score": number (0-10),
  "verdict": "needs_serious_help" | "rough_but_fixable" | "actually_not_bad" | "clean_enough",
  "headline": "short sarcastic headline",
  "summary": "1-2 sentence summary",
  "issues": [{"title": "...", "description": "...", "severity": "critical|warning|good"}],
  "diff": {"fromLabel": "original.ts", "toLabel": "fixed.ts", "lines": [{"kind": "context|added|removed", "content": "..."}]}
}`

const HONEST_SYSTEM_PROMPT = `You are a helpful code reviewer. Provide constructive feedback on this code. Respond with valid JSON in this exact format:
{
  "score": number (0-10),
  "verdict": "needs_serious_help" | "rough_but_fixable" | "actually_not_bad" | "clean_enough",
  "headline": "short constructive headline",
  "summary": "1-2 sentence summary",
  "issues": [{"title": "...", "description": "...", "severity": "critical|warning|good"}],
  "diff": {"fromLabel": "original.ts", "toLabel": "fixed.ts", "lines": [{"kind": "context|added|removed", "content": "..."}]}
}`

export async function callOpenAI(
  code: string,
  language: string,
  mode: "roast" | "honest"
): Promise<AIRoastResult> {
  const systemPrompt = mode === "roast" ? ROAST_SYSTEM_PROMPT : HONEST_SYSTEM_PROMPT

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze this ${language} code:\n\n${code}` }
    ],
    temperature: mode === "roast" ? 1.0 : 0.5,
    response_format: { type: "json_object" },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error("Empty response from OpenAI")
  }

  return JSON.parse(content) as AIRoastResult
}
```

### Frontend Update (`src/app/components/code-editor-section.tsx`)

- Change from button with onClick to form with Server Action
- Add hidden inputs for code, language, mode
- Client-side validation for 2000 char limit
- Preserve existing UI structure

### Result Page (`/roast/[id]`)

- Fetch data from database using Drizzle directly (not tRPC to avoid cache issues)
- Handle three states: loading, success, error
- Display score ring, verdict, headline, summary
- Render code block with submitted code
- Render analysis items as issue cards
- Render diff blocks with line-by-line changes

### Error Handling

- If AI call fails: save status as "failed" with errorMessage, redirect to result page
- Result page shows error state with "Tentar novamente" button that re-calls createRoast

### Environment Variables

```env
OPENAI_API_KEY=sk-...
```

## Database Schema

Already exists in `src/db/schema/`:
- `roastSubmissions` - main submission record
- `roastAnalysisItems` - list of issues found
- `roastDiffBlocks` - diff block container
- `roastDiffLines` - individual diff lines

## Acceptance Criteria

1. User can paste code up to 2000 characters
2. User can select from 12 programming languages
3. User can toggle roast mode (sarcastic) vs honest mode
4. Submitting redirects to result page after processing
5. Result page shows score (0-10), verdict, headline, summary
6. Result page shows submitted code with syntax highlighting
7. Result page shows analysis items (issues)
8. Result page shows suggested fix (diff)
9. Errors redirect to result page with error state
10. All results are persisted to database for leaderboard

## Not in Scope (Phase 1)

- Share functionality (public/unlisted roasts)
- History/listing of user's past roasts
- Authentication
- Rate limiting