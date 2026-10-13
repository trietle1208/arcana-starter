# Arcana — project instructions for Claude Code

Arcana is a local-first, single-user Tarot web app: card library, reading room (with an animated storybook ritual), study (flashcards, quizzes), journal, settings. It runs on localhost for one person. No auth, no cloud, no multi-user.

## Read these before any work
- `docs/TECH_DESIGN.md` — the architecture, data models, SQLite schema, reading engine, folder structure, testing strategy and phase roadmap. It is the source of truth for technical decisions.
- `design-system/README.md` — the brand book: colours, type, motion, content voice, screens. It is the source of truth for anything visual.
- `design-system/components/<Name>/README.md` — usage rules per component.
- `docs/PROMPTS.md` — the phase-by-phase plan the user will feed you.

## Stack (do not change without asking)
Node.js 24 LTS · pnpm · Docker (dev, tests and the production run all happen in containers) · Next.js 16 App Router · React 19 · TypeScript `strict` · CSS Modules + global design tokens (`src/styles/tokens.css`) · static JSON content validated by Zod · SQLite via better-sqlite3 + Drizzle ORM (from Phase 3) · Vitest · Playwright · ESLint + Prettier.
Not used: Tailwind, shadcn/ui, Prisma, Redux/Zustand or any state library, react-hook-form, animation libraries, i18n frameworks. Ask before adding any dependency not listed here.

## Architecture rules
- Layers: `src/app` + `src/components` + `src/features` (presentation) → `src/application` (use cases, Zod input schemas) → `src/domain` (pure TS). Data: `src/content` (static JSON) and `src/server` (DB, repositories, backup).
- `src/domain/**` must not import React, Next.js, Drizzle, better-sqlite3, `fs`, `@/server/*` or `@/components/*`. Time and randomness are injected (`Rng`, `now`). Enforce with ESLint `no-restricted-imports`.
- Server-only modules start with `import 'server-only'`. DB access only in server code (Server Components, Server Actions, Route Handlers).
- Pages that read SQLite call `await connection()` so they are not prerendered; mutations call `revalidatePath()`.
- Card and spread IDs are permanent. User records reference them by ID; card content is never copied into the DB.
- Prefer plain functions and modules over classes, DI containers or abstract interfaces. The RNG and (later) the AI `Interpreter` are the only injected seams.

## Design system rules
- `design-system/` is a **reference**, not a dependency. Port each component from `design-system/components/bundle.js` + `bundle.css` into `src/components/ui/<Name>/<Name>.tsx` + `<Name>.module.css`, typed per `design-system/components/index.d.ts`. Keep behaviour, states, timings and token references identical.
- Never hard-code colours, spacing or radii: use `var(--token)` from `tokens.css` (copied from `design-system/tokens.css`). Gold and midnight belong only on night surfaces (`NightSky`, the reading table, the arched window); paper screens stay plain.
- Fonts via `next/font/google`: Fraunces (axes `opsz`, `SOFT`, `WONK`, normal + italic) and Inter (`opsz`; DM Sans has no Vietnamese glyphs). next/font exposes `--font-fraunces` and `--font-inter`; `tokens.css` maps them to `--font-display` and `--font-sans`, which are the names components use.
- Every animation must respect `prefers-reduced-motion` and the user's Reduce motion setting: steps still happen, instantly. `<html data-motion="system|reduce|full">` is the switch (see `globals.css`); the setting drives it from Phase 3.
- UI components in `src/components/ui` are not given a dictionary: they take already-translated strings as props (a `labels` object with English defaults).
- Card images live in `public/cards/<slug>.webp` (copy from `assets/cards/`). Render with `next/image`; never filter, tint or overlay the art.
- To check visuals, open `design-system/previews/<Name>.html` or compare with `design-system/screenshots/*.png`. When you build a screen, take a Playwright screenshot and compare it with the matching screenshot before calling it done.

## Workflow
- Work one phase at a time, in order. Start each phase with a short plan (files to create/change, tests to write) and wait for approval before writing code.
- Keep changes small and reviewable; no drive-by refactors outside the phase.
- A phase is done only when `pnpm typecheck && pnpm lint && pnpm test` pass plus `pnpm test:e2e` (from Phase 0) and the acceptance criteria in `docs/PROMPTS.md` are met. Then stop and summarise; do not start the next phase on your own.
- Commit messages in English, Conventional Commits style (`feat(reading): add ritual flight`). Commit at the end of each phase or meaningful step only when asked.
- If a requirement is unclear or two docs disagree, stop and ask instead of guessing. The design system README wins on visuals; TECH_DESIGN wins on architecture.

## Language
- Reply to the user in Vietnamese. Code, comments, identifiers, commit messages and docs stay in English.
- UI strings exist in English and Vietnamese (`src/i18n/en.ts`, `vi.ts`).

## Running things (Docker)
The host only needs Docker and pnpm; Node 24 lives in the containers. The project folder is bind-mounted, so `node_modules` and `.pnpm-store` are on the host and the editor sees them. The app is on **http://localhost:3100** (host port `ARCANA_PORT`, container port 3000; 3000 is often taken on this machine).
- `pnpm docker:dev` — dev server with hot reload · `pnpm docker:check` — install, typecheck, lint, unit tests · `pnpm docker:e2e` — build, serve and run Playwright (own `.next-e2e` folder) · `pnpm docker:prod` — production image, restarts automatically · `pnpm docker:sh` — shell in the dev container.
- One-off commands: `docker compose run --rm app pnpm <script>` (e.g. `pnpm add <pkg>`, `pnpm format`). Never run `pnpm install` on the host: it would use the host's Node.

## Commands (inside the container)
`pnpm dev` · `pnpm build && pnpm start` · `pnpm test` · `pnpm test:e2e` · `pnpm lint` · `pnpm typecheck` · `pnpm format` · from Phase 3: `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:backup` · `pnpm db:restore <file>`
