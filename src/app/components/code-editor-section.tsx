"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodeEditorRoot } from "@/components/ui/code-editor-root";
import {
  SwitchDescription,
  SwitchField,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
} from "@/components/ui/switch";

export function CodeEditorSection() {
  const [code, setCode] = useState("");
  const isOverLimit = code.length > 2000;

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

          <SwitchDescription>{"// maximum sarcasm enabled"}</SwitchDescription>
        </div>

        <Button disabled={isOverLimit || code.length === 0}>
          $ roast_my_code
        </Button>
      </div>
    </section>
  );
}
