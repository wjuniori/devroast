"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditorRoot } from "@/components/ui/code-editor-root";
import {
  SwitchDescription,
  SwitchField,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui/switch";
import {
  TableRowLanguage,
  TableRowPreview,
  TableRowPreviewLine,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui/table-row";

const leaderboardEntries = [
  {
    rank: "1",
    rankTone: "accent" as const,
    score: "1.2",
    scoreTone: "critical" as const,
    language: "javascript",
    previewLines: [
      { content: 'eval(prompt("enter code"))', key: "r1-1" },
      { content: "document.write(response)", key: "r1-2" },
      { content: "// trust the user lol", key: "r1-3", muted: true },
    ],
  },
  {
    rank: "2",
    rankTone: "default" as const,
    score: "1.8",
    scoreTone: "critical" as const,
    language: "typescript",
    previewLines: [
      { content: "if (x == true) { return true; }", key: "r2-1" },
      {
        content: "else if (x == false) { return false; }",
        key: "r2-2",
      },
      { content: "else { return !false; }", key: "r2-3" },
    ],
  },
  {
    rank: "3",
    rankTone: "default" as const,
    score: "2.1",
    scoreTone: "critical" as const,
    language: "sql",
    previewLines: [
      { content: "SELECT * FROM users WHERE 1=1", key: "r3-1" },
      { content: "-- TODO: add authentication", key: "r3-2", muted: true },
    ],
  },
];

export default function Home() {
  const [code, setCode] = useState("");
  const isOverLimit = code.length > 10000;

  return (
    <main className="flex-1 bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-10 pt-20">
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

          <CodeEditorRoot
            className="w-full max-w-[780px]"
            placeholder="Paste or type your code here..."
            showLanguageSelect
            showLineNumbers
            onChange={setCode}
          />

          <div className="flex w-full max-w-[780px] items-center justify-between gap-4 max-md:flex-col max-md:items-start">
            <div className="flex items-center gap-4 max-md:flex-col max-md:items-start">
              <SwitchRoot defaultChecked>
                <SwitchThumb />
                <SwitchField>
                  <SwitchLabel>roast mode</SwitchLabel>
                </SwitchField>
              </SwitchRoot>

              <SwitchDescription>
                {"// maximum sarcasm enabled"}
              </SwitchDescription>
            </div>

            <Button disabled={isOverLimit || code.length === 0}>
              $ roast_my_code
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-center max-md:flex-wrap">
            <span className="font-sans text-xs text-text-tertiary">
              2,847 codes roasted
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-xs text-text-tertiary"
            >
              ·
            </span>
            <span className="font-sans text-xs text-text-tertiary">
              avg score: 4.2/10
            </span>
          </div>
        </section>

        <div className="h-[60px] w-full" />

        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-[60px]">
          <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold leading-none text-accent-green">
                  {"//"}
                </span>
                <h2 className="font-mono text-sm font-bold leading-none text-text-primary">
                  shame_leaderboard
                </h2>
              </div>

              <p className="font-sans text-[13px] text-text-tertiary">
                {"// the worst code on the internet, ranked by shame"}
              </p>
            </div>

            <Link
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8 px-3 text-xs",
              })}
              href="/leaderboard"
            >
              $ view_all &gt;&gt;
            </Link>
          </div>

          <Card className="overflow-hidden" padding="none">
            <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5 font-mono text-xs font-medium text-text-tertiary">
              <div className="w-[50px] shrink-0">#</div>
              <div className="w-[70px] shrink-0">score</div>
              <div className="flex-1">code</div>
              <div className="w-[100px] shrink-0">lang</div>
            </div>

            {leaderboardEntries.map((entry, index) => (
              <TableRowRoot
                key={entry.rank}
                bordered={index !== leaderboardEntries.length - 1}
                rankTone={entry.rankTone}
                scoreTone={entry.scoreTone}
              >
                <TableRowRank>{entry.rank}</TableRowRank>
                <TableRowScore>{entry.score}</TableRowScore>
                <TableRowPreview>
                  {entry.previewLines.map((line) => (
                    <TableRowPreviewLine key={line.key} muted={line.muted}>
                      {line.content}
                    </TableRowPreviewLine>
                  ))}
                </TableRowPreview>
                <TableRowLanguage>{entry.language}</TableRowLanguage>
              </TableRowRoot>
            ))}
          </Card>

          <div className="flex justify-center pt-4">
            <p className="font-sans text-xs text-text-tertiary">
              showing top 3 of 2,847 ·{" "}
              <Link
                className="transition-colors hover:text-text-primary"
                href="/leaderboard"
              >
                view full leaderboard &gt;&gt;
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
