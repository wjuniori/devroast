import { Button } from "@/components/ui";

interface PreviewLine {
  content: string;
  key: string;
  muted?: boolean;
}

interface LeaderboardEntry {
  rank: string;
  rankTone: "accent" | "default";
  score: number;
  scoreTone: "critical" | "warning" | "good";
  language: string;
  author: string;
  roastCount: number;
  previewLines: PreviewLine[];
}

const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: "1",
    rankTone: "accent" as const,
    score: 1.2,
    scoreTone: "critical" as const,
    language: "javascript",
    author: "user_420",
    roastCount: 847,
    previewLines: [
      { content: 'eval(prompt("enter code"))', key: "r1-1" },
      { content: "document.write(response)", key: "r1-2" },
      { content: "return confirm('are you sure?')", key: "r1-3" },
      { content: 'alert("trust me bro")', key: "r1-4" },
    ],
  },
  {
    rank: "2",
    rankTone: "default" as const,
    score: 1.8,
    scoreTone: "critical" as const,
    language: "typescript",
    author: "senior_dev_2020",
    roastCount: 623,
    previewLines: [
      { content: "if (x == true) { return true; }", key: "r2-1" },
      { content: "else if (x == false) { return false; }", key: "r2-2" },
      { content: "else { return !false; }", key: "r2-3" },
      { content: "// I have 10 years experience", key: "r2-4", muted: true },
    ],
  },
  {
    rank: "3",
    rankTone: "default" as const,
    score: 2.1,
    scoreTone: "critical" as const,
    language: "sql",
    author: "db_whisperer",
    roastCount: 512,
    previewLines: [
      { content: "SELECT * FROM users WHERE 1=1", key: "r3-1" },
      { content: "-- TODO: add authentication", key: "r3-2", muted: true },
      { content: "DROP TABLE IF EXISTS safety;", key: "r3-3" },
    ],
  },
  {
    rank: "4",
    rankTone: "default" as const,
    score: 2.4,
    scoreTone: "critical" as const,
    language: "python",
    author: "indentation_errors",
    roastCount: 489,
    previewLines: [
      { content: "import everything", key: "r4-1" },
      { content: "from * import *", key: "r4-2" },
      {
        content: "eval(input())  # live dangerously",
        key: "r4-3",
        muted: true,
      },
    ],
  },
  {
    rank: "5",
    rankTone: "default" as const,
    score: 2.7,
    scoreTone: "warning" as const,
    language: "rust",
    author: "borrow_checker_hater",
    roastCount: 398,
    previewLines: [
      { content: "unsafe {", key: "r5-1" },
      { content: "    let mut v = vec![1,2,3];", key: "r5-2" },
      { content: "    v.push(4); // I know what I'm doing", key: "r5-3" },
      { content: "}", key: "r5-4" },
    ],
  },
];

export const metadata = {
  title: "Shame Leaderboard | Devroast",
  description: "The most roasted code on the internet, ranked by shame",
};

function ScoreRing({
  score,
  max = 10,
  className = "",
}: {
  score: number;
  max?: number;
  className?: string;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / max, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      aria-label={`Score ${score}/${max}`}
      className={`relative inline-flex items-center justify-center ${className}`}
      role="img"
    >
      <svg
        aria-hidden="true"
        className="size-full -rotate-90"
        viewBox="0 0 48 48"
        width="48"
        height="48"
      >
        <circle
          className="fill-none stroke-border-primary"
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="3"
        />
        <circle
          className="fill-none stroke-accent-green"
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="absolute font-mono text-xs font-bold text-text-primary">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function LeaderboardEntry({
  entry,
}: {
  entry: (typeof leaderboardEntries)[number];
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-none border border-border-primary bg-bg-surface">
      <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={entry.score} className="size-12" />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={
                  entry.rankTone === "accent"
                    ? "font-mono text-sm text-accent-amber"
                    : "font-mono text-sm text-text-tertiary"
                }
              >
                #{entry.rank}
              </span>
              <span className="font-mono text-xs text-text-tertiary">
                @{entry.author}
              </span>
            </div>
            <span className="font-sans text-[11px] text-text-tertiary">
              {entry.roastCount} roasts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-bg-elevated px-2.5 py-1 font-mono text-[11px] text-text-secondary">
            {entry.language}
          </span>
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-xs">
            &gt; view_roast
          </Button>
        </div>
      </div>

      <div className="flex h-[120px] overflow-hidden border-t border-border-primary bg-bg-input">
        <div className="flex h-full shrink-0 items-end border-r border-border-primary bg-bg-surface px-3 pb-3 font-mono text-[11px] leading-[19px] text-text-tertiary">
          <div className="flex flex-col gap-1.5">
            {entry.previewLines.map((line, i) => (
              <span key={line.key || `line-num-${i}`}>{i + 1}</span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden px-4 py-3 font-mono text-[13px] leading-[19px]">
          {entry.previewLines.map((line) => (
            <span
              key={line.key}
              className={line.muted ? "text-[#8b8b8b]" : "text-text-primary"}
            >
              {line.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-10 pb-20 pt-6">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[32px] font-bold leading-none text-accent-green">
                &gt;
              </span>
              <h1 className="font-mono text-[28px] font-bold leading-none text-text-primary">
                shame_leaderboard
              </h1>
            </div>

            <p className="font-mono text-sm font-normal text-text-secondary">
              {"// the most roasted code on the internet"}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
            <span>2,847 submissions</span>
            <span>·</span>
            <span>avg score: 4.2/10</span>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          {leaderboardEntries.map((entry) => (
            <LeaderboardEntry key={entry.rank} entry={entry} />
          ))}
        </section>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" size="sm" className="h-9 px-4">
            &lt; prev
          </Button>
          <div className="flex items-center gap-2 font-mono text-xs text-text-tertiary">
            <span className="text-text-primary">1</span>
            <span>2</span>
            <span>3</span>
            <span>...</span>
            <span>95</span>
          </div>
          <Button variant="outline" size="sm" className="h-9 px-4">
            next &gt;
          </Button>
        </div>
      </div>
    </main>
  );
}
