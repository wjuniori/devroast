"use client"

import { useState } from "react"

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

export function CodeEditorSection() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [mode, setMode] = useState<"roast" | "honest">("roast")
  const [pending, setPending] = useState(false)
  const isOverLimit = code.length > 2000

  const handleSubmit = async (formData: FormData) => {
    setPending(true)
    try {
      await createRoast(formData)
    } catch {
      setPending(false)
    }
  }

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

      <form action={handleSubmit} className="flex w-full flex-col items-center gap-8">
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

          <Button disabled={isOverLimit || code.length === 0 || pending} type="submit">
            {pending ? "$ processing..." : "$ roast_my_code"}
          </Button>
        </div>
      </form>
    </section>
  )
}