# Roast Creation Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to submit code, receive AI-powered analysis (roast) via OpenAI GPT-4o-mini, and view results on a dedicated page.

**Architecture:** Server Action in Next.js App Router handles form submission, calls OpenAI API, saves results to PostgreSQL via Drizzle, and redirects to result page.

**Tech Stack:** Next.js 16, Server Actions, OpenAI SDK, Drizzle ORM, PostgreSQL

---

## File Structure

```
src/
├── app/
│   ├── actions.ts              # Server Action - createRoast
│   ├── components/
│   │   └── code-editor-section.tsx  # Updated to use form + Server Action
│   └── roast/[id]/
│       └── page.tsx            # Updated to fetch from DB
├── lib/
│   └── ai.ts                   # OpenAI integration (NEW)
├── db/
│   └── schema/
│       └── index.ts            # Export new tables for use
├── .env.local                  # Add OPENAI_API_KEY
└── package.json                # Add openai dependency
```

---

## Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install openai package**

Run: `npm install openai`
Expected: Package added to package.json

- [ ] **Step 2: Commit**

```bash
npm install openai && git add package.json package-lock.json && git commit -m "chore: add openai dependency"
```

---

## Task 2: Create AI Integration

**Files:**
- Create: `src/lib/ai.ts`

- [ ] **Step 1: Create src/lib/ai.ts with callOpenAI function**

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

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai.ts && git commit -m "feat: add OpenAI integration for code roasting"
```

---

## Task 3: Create Server Action

**Files:**
- Create: `src/app/actions.ts`

- [ ] **Step 1: Check current schema exports**

Read: `src/db/schema/index.ts` to see what's exported

- [ ] **Step 2: Create src/app/actions.ts**

```typescript
"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import db from "@/db/client"
import { roastSubmissions, roastAnalysisItems, roastDiffBlocks } from "@/db/schema"
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
    language,
    mode: mode || "roast",
    status: "queued",
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
        const { roastDiffLines } = await import("@/db/schema")
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

- [ ] **Step 3: Commit**

```bash
git add src/app/actions.ts && git commit -m "feat: add createRoast Server Action"
```

---

## Task 4: Update Code Editor Section

**Files:**
- Modify: `src/app/components/code-editor-section.tsx`

- [ ] **Step 1: Read current file to understand structure**

Read: `src/app/components/code-editor-section.tsx`

- [ ] **Step 2: Update to use form with Server Action**

Replace the component to:
1. Change from "use client" button with onClick to a form
2. Add hidden inputs for code, language, mode
3. Add client-side validation for 2000 char limit
4. Use formAction instead of onClick

```typescript
"use client"

import { useState } from "react"
import { useFormStatus } from "react"

import { Button } from "@/components/ui/button"
import { CodeEditorRoot } from "@/components/ui/code-editor-root"
import {
  SwitchDescription,
  SwitchField,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui/switch"
import { createRoast } from "@/app/actions"

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button disabled={disabled || pending} type="submit">
      {pending ? "$ processing..." : "$ roast_my_code"}
    </Button>
  )
}

export function CodeEditorSection() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [mode, setMode] = useState<"roast" | "honest">("roast")
  const isOverLimit = code.length > 2000

  return (
    <section className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <span className="font-mono text-4xl font-bold leading-none text-accent-green">
            $
          </span>
          <h1 className="font-mono text-4xl font-bold leading-none text-text-primary">
            paste your code. get roasted.
          </h1>
        </div>
      </div>

      <form action={createRoast} className="flex w-full flex-col items-center gap-8">
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="language" value={language} />
        <input type="hidden" name="mode" value={mode} />
        
        <CodeEditorRoot
          className="w-full max-w-[780px]"
          placeholder="Paste or type your code here..."
          showLanguageSelect
          showLineNumbers
          onChange={setCode}
          onLanguageChange={setLanguage}
          value={code}
        />

        <div className="flex w-full max-w-[780px] items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <div className="flex items-center gap-4 max-md:flex-col max-md:items-start">
            <SwitchRoot 
              defaultChecked 
              onCheckedChange={(checked) => setMode(checked ? "roast" : "honest")}
            >
              <SwitchThumb />
              <SwitchField>
                <SwitchLabel>roast mode</SwitchLabel>
              </SwitchField>
            </SwitchRoot>

            <SwitchDescription>{"// maximum sarcasm enabled"}</SwitchDescription>
          </div>

          <SubmitButton disabled={isOverLimit || code.length === 0} />
        </div>
      </form>
    </section>
  )
}
```

- [ ] **Step 3: Check if CodeEditorRoot has onLanguageChange prop**

Read: `src/components/ui/code-editor-root.tsx` to check props

If onLanguageChange doesn't exist, we need to add it. Check the file and add if needed.

- [ ] **Step 4: Commit**

```bash
git add src/app/components/code-editor-section.tsx && git commit -m "feat: update code editor to use Server Action form"
```

---

## Task 5: Update Code Editor Root (if needed)

**Files:**
- Modify: `src/components/ui/code-editor-root.tsx`

- [ ] **Step 1: Read current CodeEditorRoot**

Read: `src/components/ui/code-editor-root.tsx`

- [ ] **Step 2: Add onLanguageChange prop if missing**

If the prop doesn't exist, add it to the component interface and pass it to the language selector.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/code-editor-root.tsx && git commit -m "feat: add onLanguageChange to CodeEditorRoot"
```

---

## Task 6: Update Roast Result Page

**Files:**
- Modify: `src/app/roast/[id]/page.tsx`

- [ ] **Step 1: Read current page structure**

Read: `src/app/roast/[id]/page.tsx`

- [ ] **Step 2: Update to fetch from database**

Replace static data with database queries:
1. Fetch submission by ID from roastSubmissions
2. Fetch analysis items from roastAnalysisItems
3. Fetch diff blocks and lines from roastDiffBlocks/roastDiffLines
4. Handle loading state with Suspense
5. Handle error state (status: "failed")
6. Handle not-found state

```typescript
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import db from "@/db/client"
import { roastSubmissions, roastAnalysisItems, roastDiffBlocks, roastDiffLines } from "@/db/schema"
import { Button, Card, CodeBlockRoot } from "@/components/ui"
import { DiffLine } from "@/components/ui/diff-line"
import { createRoast } from "@/app/actions"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Roast Result | Devroast",
  description: "Your code has been thoroughly roasted",
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 88

  return (
    <div
      aria-label={`Score ${score} out of 10`}
      className="relative flex h-[180px] w-[180px] items-center justify-center"
      role="img"
    >
      <svg
        aria-hidden="true"
        className="size-full -rotate-90"
        viewBox="0 0 180 180"
      >
        <circle
          className="fill-none stroke-border-primary"
          cx="90"
          cy="90"
          r="88"
          strokeWidth="4"
        />
        <circle
          className="fill-none"
          cx="90"
          cy="90"
          r="88"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 10)}
          strokeLinecap="round"
          style={{
            stroke: "url(#score-gradient)",
          }}
        />
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="35%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-5xl font-bold text-accent-amber">
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-base text-text-tertiary">/10</span>
      </div>
    </div>
  )
}

function IssueCard({ issue }: { issue: { title: string; description: string; severity: string } }) {
  return (
    <Card className="p-5" padding="none">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={
            issue.severity === "critical"
              ? "size-2 rounded-full bg-accent-red"
              : issue.severity === "warning"
              ? "size-2 rounded-full bg-accent-amber"
              : "size-2 rounded-full bg-accent-green"
          }
        />
        <span
          className={
            issue.severity === "critical"
              ? "font-mono text-xs text-accent-red"
              : issue.severity === "warning"
              ? "font-mono text-xs text-accent-amber"
              : "font-mono text-xs text-accent-green"
          }
        >
          {issue.severity}
        </span>
      </div>
      <h4 className="mb-2 font-mono text-sm font-medium text-text-primary">
        {issue.title}
      </h4>
      <p className="font-mono text-xs leading-relaxed text-text-secondary">
        {issue.description}
      </p>
    </Card>
  )
}

async function RoastContent({ id }: { id: string }) {
  const submission = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, id),
  })

  if (!submission) {
    notFound()
  }

  if (submission.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-2xl text-accent-red">$ error</span>
          <p className="font-mono text-text-secondary">
            {submission.errorMessage || "Failed to process your code"}
          </p>
        </div>
        <form action={createRoast}>
          <input type="hidden" name="code" value={submission.sourceCode} />
          <input type="hidden" name="language" value={submission.language} />
          <input type="hidden" name="mode" value={submission.mode} />
          <Button type="submit" variant="outline">
            $ try_again
          </Button>
        </form>
      </div>
    )
  }

  if (submission.status === "queued" || submission.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-2xl text-accent-amber">$ processing</span>
          <p className="font-mono text-text-secondary">Analyzing your code...</p>
        </div>
      </div>
    )
  }

  const issues = await db.query.roastAnalysisItems.findMany({
    where: eq(roastAnalysisItems.submissionId, id),
    orderBy: (items, { asc }) => [asc(items.displayOrder)],
  })

  const diffBlocks = await db.query.roastDiffBlocks.findMany({
    where: eq(roastDiffBlocks.submissionId, id),
  })

  const score = Number(submission.score) || 0

  return (
    <>
      <section className="flex items-center justify-center gap-12">
        <ScoreRing score={score} />

        <div className="flex max-w-xl flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent-red" />
            <span className="font-mono text-sm font-medium text-accent-red">
              verdict: {submission.verdict}
            </span>
          </div>

          <h1 className="font-mono text-xl leading-relaxed text-text-primary">
            "{submission.headline}"
          </h1>

          <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
            <span>lang: {submission.language}</span>
            <span>·</span>
            <span>{submission.sourceLineCount} lines</span>
          </div>

          <p className="font-mono text-sm text-text-secondary">{submission.summary}</p>
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent-green">
            {"//"}
          </span>
          <h2 className="font-mono text-sm font-bold text-text-primary">
            your_submission
          </h2>
        </div>

        <CodeBlockRoot
          className="h-[424px]"
          code={submission.sourceCode}
          lang={submission.language as any}
          showLineNumbers
        />
      </section>

      {issues.length > 0 && (
        <>
          <div className="h-px w-full bg-border-primary" />

          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-accent-green">
                {"//"}
              </span>
              <h2 className="font-mono text-sm font-bold text-text-primary">
                detailed_analysis
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </section>
        </>
      )}

      {diffBlocks.length > 0 && (
        <>
          <div className="h-px w-full bg-border-primary" />

          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-accent-green">
                {"//"}
              </span>
              <h2 className="font-mono text-sm font-bold text-text-primary">
                suggested_fix
              </h2>
            </div>

            {diffBlocks.map((block) => (
              <Card key={block.id} className="overflow-hidden p-0" padding="none">
                <div className="flex h-10 items-center border-b border-border-primary px-4 font-mono text-xs text-text-secondary">
                  {block.fromLabel} → {block.toLabel}
                </div>
                <div className="flex flex-col">
                  {/* TODO: Fetch diff lines for this block */}
                </div>
              </Card>
            ))}
          </section>
        </>
      )}
    </>
  )
}

export default async function RoastResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-20 py-10">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <span className="font-mono text-text-tertiary">Loading...</span>
          </div>
        }>
          <RoastContent id={id} />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/\[id\]/page.tsx && git commit -m "feat: update roast result page to fetch from database"
```

---

## Task 7: Add Environment Variable Template

**Files:**
- Create/Modify: `.env.example` (if exists) or just document

- [ ] **Step 1: Check if .env.example exists**

- [ ] **Step 2: Add OPENAI_API_KEY to docs or .env.example**

Add documentation about the required environment variable.

- [ ] **Step 3: Commit**

```bash
git commit -m "docs: add OPENAI_API_KEY to environment setup docs"
```

---

## Task 8: Verify Build

- [ ] **Step 1: Run lint and build**

Run: `npm run lint && npm run build`

- [ ] **Step 2: Fix any issues**

- [ ] **Step 3: Final commit**

```bash
git commit -m "feat: complete roast creation feature - server action, OpenAI integration, result page"
```