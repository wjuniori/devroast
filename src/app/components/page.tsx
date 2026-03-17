import type { Metadata } from "next";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlockHeader,
  CodeBlockRoot,
  CodeBlockTitle,
  CodeBlockWindowControls,
  DiffLine,
  ScoreRing,
  StatusBadgeDot,
  StatusBadgeLabel,
  StatusBadgeRoot,
  SwitchField,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
  TableRowLanguage,
  TableRowPreview,
  TableRowPreviewLine,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui";

const buttonVariants = ["primary", "secondary", "ghost", "outline"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;
const badgeVariants = ["critical", "warning", "good", "verdict"] as const;

const codeSamples = {
  javascript: [
    "function calculateTotal(items) {",
    "  var total = 0;",
    "  for (var i = 0; i < items.length; i++) {",
    "    total = total + items[i].price;",
    "  }",
    "  return total;",
    "}",
  ].join("\n"),
  sql: ["SELECT * FROM users WHERE 1 = 1", "-- TODO: add authentication"].join(
    "\n",
  ),
};

export const metadata: Metadata = {
  title: "UI Components | Devroast",
  description: "Visual showcase for shared UI components",
};

function Section({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-5 border border-border-primary bg-bg-surface p-6 md:p-8">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 font-mono text-sm leading-none">
          <span className="font-bold text-accent-green">{"//"}</span>
          <span className="font-bold text-text-primary">{title}</span>
        </p>
        <p className="max-w-3xl font-sans text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export default async function ComponentsPage() {
  return (
    <main className="min-h-screen bg-bg-page px-6 py-10 text-text-primary md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3 border border-border-primary bg-bg-surface p-6 md:p-8">
          <p className="inline-flex items-center gap-2 font-mono text-base leading-none">
            <span className="font-bold text-accent-green">{"//"}</span>
            <span className="font-bold text-text-primary">
              component_library
            </span>
          </p>
          <div className="space-y-2">
            <h1 className="font-mono text-3xl text-text-primary md:text-4xl">
              Shared components preview
            </h1>
            <p className="max-w-3xl font-sans text-sm leading-6 text-text-secondary md:text-base">
              Living gallery for everything inside `src/components/ui`, based on
              the Pencil component library. This route is the fastest way to
              inspect variants, behavior, and alignment before wiring components
              into real screens.
            </p>
          </div>
        </header>

        <Section
          title="buttons"
          description="Primary actions, secondary actions, compact controls, and utility affordances from the component library."
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {buttonVariants.map((variant) => (
                <div
                  key={variant}
                  className="space-y-4 border border-border-primary bg-bg-page p-5"
                >
                  <div className="space-y-1">
                    <h3 className="font-mono text-sm uppercase tracking-[0.18em] text-text-primary">
                      {variant}
                    </h3>
                    <p className="font-sans text-xs text-text-tertiary">
                      Default, icon pairing, and disabled state.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant={variant}>$ roast_my_code</Button>
                    <Button
                      variant={variant}
                      leadingIcon={<span aria-hidden="true">$</span>}
                      trailingIcon={<span aria-hidden="true">-&gt;</span>}
                    >
                      Run analysis
                    </Button>
                    <Button variant={variant} disabled>
                      Disabled
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 border border-border-primary bg-bg-page p-5">
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-text-tertiary">
                  Size scale
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {buttonSizes.map((size) => (
                    <Button key={size} size={size}>
                      {size}
                    </Button>
                  ))}
                  <Button size="icon" aria-label="Run command">
                    $()
                  </Button>
                </div>
              </div>

              <div className="space-y-3 border border-border-primary bg-bg-page p-5">
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-text-tertiary">
                  Width behavior
                </p>
                <div className="flex flex-col gap-3">
                  <Button fullWidth>$ roast_my_code</Button>
                  <Button variant="secondary" fullWidth>
                    $ share_roast
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="toggle"
          description="Interactive switch built with Base UI primitives and styled to match the Pencil track and knob proportions."
        >
          <div className="flex flex-wrap gap-8 border border-border-primary bg-bg-page p-5">
            <SwitchRoot defaultChecked>
              <SwitchThumb />
              <SwitchField>
                <SwitchLabel>roast mode</SwitchLabel>
              </SwitchField>
            </SwitchRoot>
            <SwitchRoot>
              <SwitchThumb />
              <SwitchField>
                <SwitchLabel>roast mode</SwitchLabel>
              </SwitchField>
            </SwitchRoot>
            <SwitchRoot defaultChecked disabled>
              <SwitchThumb />
              <SwitchField>
                <SwitchLabel>roast mode</SwitchLabel>
              </SwitchField>
            </SwitchRoot>
          </div>
        </Section>

        <Section
          title="badge_status"
          description="Small semantic markers for severity, quality, and verdict-style labels."
        >
          <div className="flex flex-wrap gap-6 border border-border-primary bg-bg-page p-5">
            {badgeVariants.map((variant) => (
              <StatusBadgeRoot key={variant} variant={variant}>
                <StatusBadgeDot />
                <StatusBadgeLabel>
                  {variant === "verdict" ? "needs_serious_help" : variant}
                </StatusBadgeLabel>
              </StatusBadgeRoot>
            ))}
          </div>
        </Section>

        <Section
          title="cards"
          description="Reusable surface containers for issue summaries, metric panels, or grouped content."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <StatusBadgeRoot variant="critical">
                  <StatusBadgeDot />
                  <StatusBadgeLabel>critical</StatusBadgeLabel>
                </StatusBadgeRoot>
                <CardTitle>using var instead of const/let</CardTitle>
                <CardDescription>
                  The `var` keyword is function-scoped rather than block-scoped,
                  which can lead to unexpected behavior and bugs in modern
                  JavaScript code.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <p className="inline-flex items-center gap-2 font-mono text-xs leading-none">
                  <span className="font-bold text-accent-green">{"//"}</span>
                  <span className="font-bold text-text-primary">
                    analysis_card
                  </span>
                </p>
                <CardTitle>ready for composable layouts</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <p className="font-sans text-sm leading-6 text-text-secondary">
                  Use the base surface as a shell for denser content blocks,
                  charts, summaries, and result modules.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          title="code_block"
          description="Server-rendered syntax highlighting with Shiki using the Vesper theme, wrapped in the same shell style as the Pencil editor blocks."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlockRoot code={codeSamples.javascript} lang="javascript">
              <CodeBlockHeader>
                <CodeBlockWindowControls />
                <CodeBlockTitle>calculate.js</CodeBlockTitle>
              </CodeBlockHeader>
            </CodeBlockRoot>
            <CodeBlockRoot code={codeSamples.sql} lang="sql">
              <CodeBlockHeader>
                <CodeBlockWindowControls />
                <CodeBlockTitle>query.sql</CodeBlockTitle>
              </CodeBlockHeader>
            </CodeBlockRoot>
          </div>
        </Section>

        <Section
          title="diff_line"
          description="Single-line diff primitive for additions, removals, and unchanged context."
        >
          <div className="overflow-hidden border border-border-primary bg-bg-input">
            <DiffLine variant="removed">var total = 0;</DiffLine>
            <DiffLine variant="added">const total = 0;</DiffLine>
            <DiffLine variant="context">
              {"for (let i = 0; i < items.length; i++) {"}
            </DiffLine>
          </div>
        </Section>

        <Section
          title="table_row"
          description="Leaderboard-style data row with mono spacing, weighted score emphasis, and clipped code preview content."
        >
          <div className="overflow-hidden border border-border-primary bg-bg-page">
            <TableRowRoot>
              <TableRowRank>#1</TableRowRank>
              <TableRowScore>2.1</TableRowScore>
              <TableRowPreview>
                <TableRowPreviewLine>
                  function calculateTotal(items) {"{"}
                </TableRowPreviewLine>
                <TableRowPreviewLine>var total = 0;</TableRowPreviewLine>
                <TableRowPreviewLine muted>
                  {"// this row now uses compound components"}
                </TableRowPreviewLine>
              </TableRowPreview>
              <TableRowLanguage>javascript</TableRowLanguage>
            </TableRowRoot>
          </div>
        </Section>

        <Section
          title="score_ring"
          description="Circular score indicator with a thin terminal-style track, partial accent arc, and centered numeric value."
        >
          <div className="flex justify-center border border-border-primary bg-bg-page p-8">
            <ScoreRing score={3.5} />
          </div>
        </Section>
      </div>
    </main>
  );
}
