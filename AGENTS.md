# AGENTS.md

## Project

- Runtime: Node.js 24.20.0
- Package manager: pnpm 12.0.0
- App: React 19, Vite 8, TypeScript 7
- Routing and styles: TanStack Router, Tailwind CSS 4
- Quality: Vitest, Oxlint, Oxfmt, Lefthook

## Working rules

- Use `pnpm`; do not create npm or Yarn lockfiles.
- Keep changes scoped to the request and match the existing style.
- Do not edit `src/routeTree.gen.ts`; TanStack Router generates it.
- Add or update tests for behavior changes.
- Run `pnpm check` and `pnpm build` before finishing.

## Commands

- `pnpm dev`: start the local server
- `pnpm test`: run tests in watch mode
- `pnpm check`: typecheck, lint, format-check, and run tests once
- `pnpm build`: typecheck and create the production build
