import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface CodeEditorInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  /**
   * Optional CSS class name for additional styling.
   */
  className?: string;
}

/**
 * Transparent textarea input layer for the code editor.
 * Sits on top of the highlighted code layer and syncs scroll position.
 * Extends native textarea attributes for seamless integration.
 */
export const CodeEditorInput = forwardRef<
  HTMLTextAreaElement,
  CodeEditorInputProps
>(({ className, style, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`absolute inset-0 z-10 resize-none overflow-auto bg-transparent p-4 font-mono text-base text-transparent caret-white placeholder-text-secondary outline-none ${
        className ?? ""
      }`.trim()}
      style={{
        lineHeight: 1.5,
        scrollBehavior: "smooth",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...style,
      }}
      spellCheck="false"
      {...props}
    />
  );
});

CodeEditorInput.displayName = "CodeEditorInput";
