import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createRoast } from "@/app/actions";
import { Button, Card, CodeBlockRoot } from "@/components/ui";
import { DiffLine } from "@/components/ui/diff-line";
import db from "@/db/client";
import {
  roastAnalysisItems,
  roastDiffBlocks,
  roastDiffLines,
  roastSubmissions,
} from "@/db/schema";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const roast = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, id),
  });

  if (!roast || roast.status !== 'completed') {
    return { title: 'Roast Result | Devroast' };
  }

  const score = Number(roast.score) || 0;

  return {
    title: `Roast Result: ${score.toFixed(1)}/10 - ${roast.verdict || 'analyzed'} | Devroast`,
    description: roast.headline || 'Your code has been roasted',
    openGraph: {
      images: [`/roast/${id}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/roast/${id}/opengraph-image`],
    },
  };
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 88;

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
  );
}

function IssueCard({
  issue,
}: {
  issue: { title: string; description: string; severity: string };
}) {
  const isCritical = issue.severity === "critical";
  const isWarning = issue.severity === "warning";

  return (
    <Card className="p-5" padding="none">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={
            isCritical
              ? "size-2 rounded-full bg-accent-red"
              : isWarning
                ? "size-2 rounded-full bg-accent-amber"
                : "size-2 rounded-full bg-accent-green"
          }
        />
        <span
          className={
            isCritical
              ? "font-mono text-xs text-accent-red"
              : isWarning
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
  );
}

function DiffBlockContent({ blockId }: { blockId: string }) {
  return (
    <div className="flex flex-col p-4">
      <span className="font-mono text-xs text-text-tertiary">
        {"// Diff lines will be displayed here"}
      </span>
    </div>
  );
}

async function RoastContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await db.query.roastSubmissions.findFirst({
    where: eq(roastSubmissions.id, id),
  });

  if (!submission) {
    notFound();
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
    );
  }

  if (submission.status === "queued" || submission.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-2xl text-accent-amber">
            $ processing
          </span>
          <p className="font-mono text-text-secondary">
            Analyzing your code...
          </p>
        </div>
      </div>
    );
  }

  const issues = await db.query.roastAnalysisItems.findMany({
    where: eq(roastAnalysisItems.submissionId, id),
    orderBy: (items, { asc }) => [asc(items.displayOrder)],
  });

  const diffBlocks = await db.query.roastDiffBlocks.findMany({
    where: eq(roastDiffBlocks.submissionId, id),
  });

  const score = Number(submission.score) || 0;

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

          {submission.summary && (
            <p className="font-mono text-sm text-text-secondary">
              {submission.summary}
            </p>
          )}
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
              <Card
                key={block.id}
                className="overflow-hidden p-0"
                padding="none"
              >
                <div className="flex h-10 items-center border-b border-border-primary px-4 font-mono text-xs text-text-secondary">
                  {block.fromLabel} → {block.toLabel}
                </div>
                <DiffBlockContent blockId={block.id} />
              </Card>
            ))}
          </section>
        </>
      )}
    </>
  );
}

export default async function RoastResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-20 py-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <span className="font-mono text-text-tertiary">Loading...</span>
            </div>
          }
        >
          <RoastContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
