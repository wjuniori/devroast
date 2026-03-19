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