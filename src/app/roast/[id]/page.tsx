import Link from "next/link";

import { Button, Card, CodeBlockRoot } from "@/components/ui";
import { DiffLine } from "@/components/ui/diff-line";

export const metadata = {
  title: "Roast Result | Devroast",
  description: "Your code has been thoroughly roasted",
};

const staticData = {
  score: 3.5,
  verdict: "needs_serious_help",
  roastTitle:
    "this code looks like it was written during a power outage... in 2005.",
  language: "javascript" as const,
  lines: 7,
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
  
  // TODO: handle tax calculation
  // TODO: handle currency conversion
  
  calculateTax(total);
}

function calculateTax(amount) {
  return amount * 1.1;
}`,
  issues: [
    {
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
      type: "error" as const,
    },
    {
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
      type: "error" as const,
    },
    {
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
      type: "success" as const,
    },
    {
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
      type: "success" as const,
    },
  ],
};

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

function IssueCard({ issue }: { issue: (typeof staticData.issues)[number] }) {
  return (
    <Card className="p-5" padding="none">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={
            issue.type === "error"
              ? "size-2 rounded-full bg-accent-red"
              : "size-2 rounded-full bg-accent-green"
          }
        />
        <span
          className={
            issue.type === "error"
              ? "font-mono text-xs text-accent-red"
              : "font-mono text-xs text-accent-green"
          }
        >
          {issue.type === "error" ? "issue" : "positive"}
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

export default async function RoastResultPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  void _params;

  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-20 py-10">
        <section className="flex items-center justify-center gap-12">
          <ScoreRing score={staticData.score} />

          <div className="flex max-w-xl flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-red" />
              <span className="font-mono text-sm font-medium text-accent-red">
                verdict: {staticData.verdict}
              </span>
            </div>

            <h1 className="font-mono text-xl leading-relaxed text-text-primary">
              "{staticData.roastTitle}"
            </h1>

            <div className="flex items-center gap-4 font-mono text-xs text-text-tertiary">
              <span>lang: {staticData.language}</span>
              <span>·</span>
              <span>{staticData.lines} lines</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-9 px-4">
                $ share_roast
              </Button>
            </div>
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
            code={staticData.code}
            lang={staticData.language}
            showLineNumbers
          />
        </section>

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
            {staticData.issues.map((issue) => (
              <IssueCard key={issue.title} issue={issue} />
            ))}
          </div>
        </section>

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

          <Card className="overflow-hidden p-0" padding="none">
            <div className="flex h-10 items-center border-b border-border-primary px-4 font-mono text-xs text-text-secondary">
              your_code.ts → improved_code.ts
            </div>
            <div className="flex flex-col">
              <DiffLine variant="context">
                function calculateTotal(items) {"{"}
              </DiffLine>
              <DiffLine variant="removed"> var total = 0;</DiffLine>
              <DiffLine variant="removed">
                {" "}
                for (var i = 0; i &lt; items.length; i++) {"{"}
              </DiffLine>
              <DiffLine variant="removed">
                {" "}
                total = total + items[i].price;
              </DiffLine>
              <DiffLine variant="removed"> {"}"}</DiffLine>
              <DiffLine variant="removed"> return total;</DiffLine>
              <DiffLine variant="added">
                {"  "}return items.reduce((sum, item) =&gt; sum + item.price,
                0);
              </DiffLine>
              <DiffLine variant="context">{"}"}</DiffLine>
            </div>
          </Card>
        </section>

        <div className="flex justify-center">
          <Link href="/leaderboard">
            <Button variant="outline" size="sm" className="h-9 px-4">
              &lt; back to leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
