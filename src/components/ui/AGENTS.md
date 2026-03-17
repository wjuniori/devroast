# UI component patterns

- Keep agent instruction files uppercase as `AGENTS.md`.
- Use named exports only. Never use `default export`.
- Prefer plain function components. Do not use `forwardRef` unless a future requirement makes it unavoidable.
- When a component wraps a native element, extend that element's native props in TypeScript. Example: `ButtonHTMLAttributes<HTMLButtonElement>` for buttons.
- Use `tailwind-variants` for component variants.
- When a component is built with `tailwind-variants`, pass `className` directly into the variant function call instead of wrapping the output with `twMerge`.
- Keep variant APIs small and predictable. Favor `variant`, `size`, and boolean flags like `fullWidth`.
- Use CSS variables from `src/app/globals.css` for colors, radii, spacing, and focus styles. Avoid hardcoded design values inside components.
- Use Tailwind's default font utilities for typography: `font-sans` for traditional UI text and `font-mono` for monospaced UI text.
- Use Base UI primitives for interactive behavior when a reusable primitive exists, then style it to match the design system.
- Keep code highlighting components server-rendered when using Shiki.
- Match the active Pencil design language before inventing new visual tokens.
- Keep components generic and reusable across pages. Do not couple UI components to route-specific copy or behavior.
- Export component types alongside the component from the same file, then re-export them from `src/components/ui/index.ts`.
