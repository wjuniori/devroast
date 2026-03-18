# Homepage editor with automatic syntax highlight

## Context

Today the homepage renders a static code block with server-side Shiki in `src/components/ui/code-block.tsx`, but the requested feature is an interactive editor where the user can paste code, get syntax highlight automatically, and optionally override the detected language from the homepage UI.

## Goal

Build a homepage editor that:

- accepts pasted and typed code
- applies syntax highlight automatically based on detected language
- lets the user switch language manually when detection is wrong or ambiguous
- preserves the existing DevRoast visual language and theme tokens
- stays lightweight enough for the homepage hero

## Study conclusion

The best option for this project is a **Ray.so-style custom editor**:

- editable layer: transparent `textarea`
- visual layer: highlighted HTML rendered underneath/behind it
- highlighting engine: `shiki`
- language detection: `highlight.js` `highlightAuto`
- manual override: language combobox with an `Auto-detect` mode

This is the best fit because:

- the repo already uses `shiki` and already has a code-block visual language
- the feature scope is paste/edit/highlight, not a full IDE
- it keeps the homepage bundle smaller than Monaco
- it gives more visual control than CodeMirror while still matching the Ray.so interaction model you referenced

## What Ray.so does

From the Ray.so source:

- input is handled by a real `textarea` in `app/(navigation)/(code)/components/Editor.tsx`
- syntax-highlighted output is rendered separately in `app/(navigation)/(code)/components/HighlightedCode.tsx`
- language auto-detection uses `highlight.js` `highlightAuto(...)` in `app/(navigation)/(code)/store/code.ts`
- syntax colors come from a client-side Shiki highlighter with dynamic language loading in `app/(navigation)/(code)/code.tsx`
- manual language selection includes an `Auto-Detect` option in `app/(navigation)/(code)/components/LanguageControl.tsx`

Important detail: Ray.so is **not** using Monaco or CodeMirror for the core code-image editor. It uses a lighter custom editing surface and separates editing from highlighting.

## Options evaluated

### 1. Ray.so-style custom editor + Shiki + highlight.js

Pros:

- closest match to the Ray.so experience
- aligns with the current stack and existing `shiki` dependency
- easier to fully control layout, chrome, spacing, and homepage visuals
- lighter than Monaco
- enough for paste, edit, auto-detect, line numbers, and manual language switching

Cons:

- we own cursor/scroll sync, resize behavior, and editing polish
- advanced editor features require extra custom work
- IME, mobile editing, and selection edge cases need careful QA

Verdict: **recommended**.

### 2. CodeMirror 6

Pros:

- battle-tested editing behavior
- excellent extension model
- easier than a hand-rolled editor if we later want richer editing
- lighter and more flexible than Monaco

Cons:

- not as visually freeform as the Ray.so overlay approach
- syntax coloring would either use CodeMirror highlighting or require a more custom Shiki integration
- automatic language detection still needs a separate detector; it is not the core built-in workflow

Verdict: strong fallback if the feature expands beyond paste/edit/highlight.

### 3. Monaco Editor

Pros:

- richest editor capabilities
- familiar VS Code-like behavior
- excellent for future diagnostics, autocomplete, and heavy editing workflows

Cons:

- too heavy for a homepage hero use case
- workers and language packaging add complexity
- visually feels more like an IDE than a marketing/editor hybrid
- overkill for the current requirements

Verdict: not recommended for v1.

## Recommendation

Implement v1 as a **client-side homepage editor component** that follows the Ray.so architecture, with these rules:

- keep `shiki` as the syntax renderer
- use `highlight.js` only for language detection, not for final rendered colors
- expose a manual language selector with `Auto-detect` as the default
- keep a safe fallback to `plaintext` when detection confidence is weak or unsupported

## Proposed feature spec

### UX behavior

- homepage hero shows an editable code surface with line numbers instead of a static sample block
- when the user pastes code, the app detects the language automatically from the curated v1 set (JS, TS, Python, Go, Rust, Java, Ruby, PHP, SQL, Shell, CSS, HTML, JSON)
- when the user types after paste, highlight updates live
- the user can switch from `Auto-detect` to a specific language manually from the language selector
- once the user picks a language manually, auto-detection stops overriding it until the user re-enables `Auto-detect`
- the selected language persists in component state while the user stays on the homepage; it resets to `Auto-detect` on page refresh
- if the code is empty, the editor shows placeholder copy
- if the detector is unsure or detects an unsupported language, keep `Auto-detect` selected but render as `plaintext`
- line numbers appear on the left side of the code and update as the user edits

### Detection rules

- run detection on paste immediately
- run detection on normal typing with debounce
- restrict detection to the curated set of languages we actually support in the product
- use `highlight.js` result metadata (`language`, `relevance`, `secondBest`) to avoid overconfident guesses
- map detector output to the Shiki language ids we support
- if mapping fails, fall back to `text`/`plaintext`

### Rendering rules

- final syntax coloring should come from Shiki, not highlight.js
- preload the most common homepage languages
- lazy-load rarer grammars only when needed
- keep line height, padding, border, and colors on DevRoast theme tokens from `src/app/globals.css`
- keep code UI in `font-mono`

### Suggested component split

- `CodeEditorRoot`: overall shell/chrome for the homepage editor
- `CodeEditorInput`: transparent `textarea` layer
- `CodeEditorHighlight`: Shiki-rendered layer
- `CodeEditorLanguageSelect`: manual override + auto-detect state
- `useCodeLanguageDetection`: detector + debounce + mapping logic
- `useShikiHighlighter`: shared client-side highlighter lifecycle

### State model

- `code`: current editor value
- `languageMode`: `auto` | `manual`
- `detectedLanguage`: best guess from detector
- `manualLanguage`: user-selected language or `null`
- `resolvedLanguage`: actual language used for Shiki
- `isDetecting`: loading state for detector/highlighter swaps

### Performance notes

- do not recreate the Shiki highlighter on every keystroke
- keep one shared highlighter instance alive in the client
- preload only a small starter set, then lazy-load the rest
- debounce detection separately from highlight rendering if needed
- avoid detecting very short snippets aggressively because accuracy is poor

### Accessibility and edge cases

- the editable surface must remain a real `textarea` for keyboard input, selection, and screen-reader compatibility
- confirm scroll sync between input and highlighted layer
- test tabs, indentation, long lines, empty lines, and pasted code blocks with trailing newlines
- test mobile and IME composition before shipping
- handle unsupported languages without visual breakage

## Libraries and rationale

### `shiki`

- already present in this repo
- provides the final syntax-highlighted output
- supports browser usage and dynamic language loading
- does not solve language auto-detection by itself, so it should stay focused on rendering

### `highlight.js`

- gives `highlightAuto(code, subset)` for heuristic language detection
- returns `language`, `relevance`, and `secondBest`, which is useful for confidence heuristics
- should be used only as the detector layer

### Why not use only `highlight.js`

- its main value here is detection
- DevRoast already leans on Shiki for nicer, more controllable output
- using Shiki for final rendering keeps the editor aligned with the existing code block direction

## Implementation outline

1. Create a reusable client editor primitive under `src/components/ui`.
2. Move homepage-specific copy and behavior into `src/app/page.tsx`.
3. Reuse existing theme tokens from `src/app/globals.css`.
4. Add a curated language registry shared by detection and Shiki rendering.
5. Add detector confidence rules and `plaintext` fallback behavior.
6. Add the manual language selector with explicit `Auto-detect` mode.
7. Validate the editor on desktop and mobile.

## To-dos (updated with v1 scope decisions)

### Language and detection

- **define the v1 supported language registry** (JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, SQL, Shell, CSS, HTML, JSON) with aliases in `src/lib/languages.ts`
- define detection confidence thresholds for `highlight.js` (e.g., relevance > 0.7 for high confidence, fallback to plaintext if < 0.5)
- create a mapping function between highlight.js language codes and Shiki language ids

### UI and state

- design the homepage language selector UI (combobox with the 12 supported languages + Auto-detect option)
- design empty-state copy for when the editor is empty
- implement session-level state storage for selected language (no persistence across page refresh)
- add line number rendering (CSS-generated or React-rendered gutter column)

### Implementation

- implement a shared client-side Shiki highlighter lifecycle (`useShikiHighlighter` hook or singleton)
- implement textarea/highlight overlay sync (cursor, scroll, line height matching)
- add manual override state and `Auto-detect` reset behavior
- add fallback behavior for unsupported or ambiguous snippets (render as plaintext)
- ensure line number alignment with input and highlight layers

### Testing and validation

- QA paste flows (single/multi-line, trailing newlines, edge cases)
- QA typing flows and debounce behavior
- QA mobile behavior and IME composition
- QA line number alignment at various viewport sizes
- measure homepage bundle impact before shipping (target: < 50 KB gzipped for editor bundle)

## Decisions on v1 scope

### Supported languages

**Decision: Start with a curated mid-tier set including popular backends.**

v1 will support: **JavaScript, TypeScript, Python, Go, Rust, Java, Ruby, PHP, SQL, Shell, CSS, HTML, JSON**.

**Rationale:**
- Covers the vast majority of DevRoast's developer audience
- Small enough to keep bundle impact minimal (lazy-load rarer languages if needed)
- Balances "paste any code" UX against bundle size
- Future v2 can easily expand the registry without architectural changes

**Implementation note:** Define the curated language list and aliases in a shared registry (e.g., `src/lib/languages.ts`) that both the detector and Shiki loader reference.

### Language persistence

**Decision: Persist the selected language during the user's session.**

The selected language will be kept in component state (React state or a custom hook). When the user refreshes the page, the selection resets to `Auto-detect`. If the user navigates away from the homepage and returns, the editor state resets.

**Rationale:**
- Simpler initial implementation; avoids storage setup and complexity
- Aligns with the homepage hero as a "try it now" surface, not a persistent workspace
- Can upgrade to sessionStorage/localStorage in v2 if users request persistence across refreshes

**Implementation note:** Store language selection in a `useEditor` hook or component state; no need for storage layer in v1.

### Line numbers

**Decision: Include line numbers in v1.**

The editor will show line numbers on the left side of the highlighted code layer. This makes the surface feel more like a real editor and provides visual reference for code snippets.

**Rationale:**
- Improves perceived polish and credibility of the editor surface
- Helps users identify issues by line number (especially for error messages)
- Not a significant implementation cost (can be CSS-generated or React-rendered)
- Aligns with typical code-display expectations

**Implementation note:** Render line numbers as part of `CodeEditorHighlight` or as a separate column; ensure alignment with the textarea input.

## Final recommendation

Build **v1 with the Ray.so-style overlay editor**, powered by **Shiki for final highlight** and **highlight.js for auto-detection**, with a **manual language selector supporting 12 curated web and backend languages**, **line numbers**, **session-level language persistence**, and a **conservative fallback to plaintext when detection is uncertain**.

### Summary of v1 scope

| Feature | Decision |
|---------|----------|
| Language support | JS, TS, Python, Go, Rust, Java, Ruby, PHP, SQL, Shell, CSS, HTML, JSON |
| Detection | highlight.js with confidence thresholds; fallback to plaintext for low confidence |
| Manual override | Combobox with Auto-detect option; disables auto-detection until re-enabled |
| Line numbers | Yes; rendered as a left gutter column aligned with input and highlight layers |
| Persistence | Session-level (component state); resets on page refresh |
| Input method | Transparent textarea overlay; supports paste, typing, selection, and IME composition |
| Fallback rendering | Plaintext when language is unsupported, ambiguous, or auto-detect confidence is low |
| Bundle target | < 50 KB gzipped for editor bundle (Shiki + highlight.js + components) |
