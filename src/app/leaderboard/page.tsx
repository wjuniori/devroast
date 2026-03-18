import { Card, CodeBlockRoot } from "@/components/ui";

interface LeaderboardEntry {
  rank: string;
  score: string;
  language: "javascript" | "typescript" | "sql" | "java";
  code: string;
}

const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: "1",
    score: "1.2",
    language: "javascript",
    code: 'function hello() {\n  console.log("world");\n}',
  },
  {
    rank: "2",
    score: "1.8",
    language: "typescript",
    code: "if (x == true) {\n  return true;\n}",
  },
  {
    rank: "3",
    score: "2.1",
    language: "sql",
    code: "SELECT * FROM users\nWHERE id = 1;",
  },
  {
    rank: "4",
    score: "2.4",
    language: "java",
    code: "public class Main {\n  public static void main(String[] args) {}\n}",
  },
  {
    rank: "5",
    score: "2.7",
    language: "javascript",
    code: "while(true) {\n  doSomething();\n}",
  },
];

export const metadata = {
  title: "Shame Leaderboard | Devroast",
  description: "The most roasted code on the internet, ranked by shame",
};

function LeaderboardEntry({
  entry,
}: {
  entry: (typeof leaderboardEntries)[number];
}) {
  return (
    <Card className="overflow-hidden" padding="none">
      <div className="flex h-12 items-center justify-between border-b border-border-primary px-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold text-accent-amber">
            #{entry.rank}
          </span>
          <span className="font-mono text-sm font-bold text-accent-red">
            {entry.score}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-secondary">
            {entry.language}
          </span>
          <span className="font-mono text-xs text-text-tertiary">
            {entry.code.split("\n").length} lines
          </span>
        </div>
      </div>

      <CodeBlockRoot
        className="border-t border-border-primary"
        code={entry.code}
        lang={entry.language}
        showLineNumbers
      />
    </Card>
  );
}

export default async function LeaderboardPage() {
  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-20 py-10">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold leading-none text-accent-green">
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
      </div>
    </main>
  );
}
