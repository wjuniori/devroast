# Project Rules

- Stack: Next.js App Router, React 19, Tailwind CSS v4, Base UI, Shiki.
- Design source of truth: Pencil selection and existing app visual language.
- Theme: always use Tailwind tokens from `src/app/globals.css` `@theme`; avoid hardcoded colors/radii/spacing.
- Typography: `font-mono` for terminal/code UI, `font-sans` for regular text.
- UI architecture: prefer reusable compound components in `src/components/ui`; use named exports only.
- Styling: use `tailwind-variants` for component variants; keep APIs small and composable.
- Keep shared components generic; page copy and route-specific behavior stay in app routes.
- Validate changes with `npm run lint` and `npm run build` when relevant.
- Data fetching: use tRPC for type-safe API calls. See `src/trpc/AGENTS.md`.
- Number animation: use `@number-flow/react`. See `src/components/AGENTS.md`.
