# Arcana — Claude Code prompt plan

Cách dùng: dán từng prompt bên dưới vào Claude Code theo thứ tự. Mỗi prompt bắt Claude lập kế hoạch trước và chờ bạn duyệt. Duyệt xong bạn trả lời "OK, làm đi" (hoặc góp ý), Claude mới viết code. Hết mỗi phase thì review diff, chạy app, rồi commit trước khi sang prompt tiếp theo.

Các prompt viết bằng tiếng Anh để Claude Code bám sát tài liệu; Claude vẫn trả lời bạn bằng tiếng Việt (theo `CLAUDE.md`).

---

## Prompt 0 — Orientation (no code)

```
Read CLAUDE.md, docs/TECH_DESIGN.md, docs/PROMPTS.md and design-system/README.md in full, then skim design-system/components/*/README.md and look at design-system/screenshots/.

Do not write any code yet. Reply with:
1. A 10-line summary of the product, the stack and the layer rules as you understand them.
2. The full list of design-system components and which phase each one is needed in.
3. Any contradiction or gap you found between TECH_DESIGN.md, the design-system README and PROMPTS.md (note: the Reading Room now uses the animated ReadingRitual from the design system — shuffle, cut, fan, flight, reveal — which TECH_DESIGN describes only as "cards revealed one by one"; the design system wins on visuals and interaction).
4. Questions you need answered before Phase 0.
```

---

## Phase 0 — Project setup and foundation

```
Phase 0 of docs/TECH_DESIGN.md §11. Plan first, wait for my approval, then implement.

Goal: a running Next.js 16 app with the full toolchain, the design tokens, fonts, the app shell and empty routes.

Do:
- Scaffold Next.js 16 (App Router, TypeScript strict, ESLint, src/ dir, alias @/*) with pnpm, no Tailwind. If create-next-app refuses because the folder is not empty, scaffold into a temporary sibling folder and move the files in. Never overwrite CLAUDE.md, docs/, design-system/ or assets/.
- Add Prettier, Vitest, Playwright, and scripts: dev, build, start, test, test:e2e, lint, typecheck, format.
- Create the folder structure from TECH_DESIGN §8 (empty index files are fine) and the ESLint no-restricted-imports boundary rules from §8.
- Copy design-system/tokens.css to src/styles/tokens.css; create globals.css with the base styles from the top of design-system/components/bundle.css (body, focus ring, .ar-overline and friends). Load Fraunces (opsz, SOFT, WONK; normal + italic) and Inter (opsz) with next/font/google as --font-display / --font-sans.
- Copy assets/cards/*.webp to public/cards/.
- Port Icon, Button (all variants incl. gold and night) and AppNav as typed components with CSS Modules.
- Root layout with AppNav (side on desktop, bottom bar under 768px); placeholder pages for /, /library, /reading, /study, /journal, /settings, each with its title.
- src/server/env.ts parsing process.env with Zod; .env.example; .gitignore incl. data/.
- A README section "Getting started".

Acceptance:
- pnpm dev shows the cream layout; navigation works between the 6 routes with the correct active state.
- A file in src/domain that imports react fails pnpm lint.
- pnpm typecheck, pnpm lint, pnpm test (one sample test) and pnpm test:e2e (each route renders its title) all pass.
- Take a Playwright screenshot of / and compare the nav with design-system/screenshots/AppNav.png.
Stop after this phase and summarise.
```

---

## Phase 1 — Tarot data model and card library

```
Phase 1 of docs/TECH_DESIGN.md §11. Plan first, wait for my approval, then implement.

Do:
- Domain types from TECH_DESIGN §5.1 in src/domain/tarot/types.ts, plus interpret.ts (interpretationFor, interpret).
- Zod content schema (src/content/schema.ts) and the registry (src/content/index.ts: ALL_CARDS, ALL_CARD_IDS, getCard). Card ids: 'the-fool' … 'the-world', '<suit>-ace', '<suit>-02' … '<suit>-10', '<suit>-page|knight|queen|king'. image paths must match the files in public/cards/.
- Card JSON files (major.json, cups.json, wands.json, swords.json, pentacles.json). For now generate a complete structural skeleton for all 78 cards with correct ids, numbers, suits, ranks, image paths, EN + VI names, and fully written content for the 22 major arcana only. Mark minor-arcana text fields with the exact string "TODO" so the content test can report them. (Full minor content comes from the Content prompt.)
- searchCards (accent-insensitive EN/VI name + keyword search, arcana/suit filters, sort by number or name) in src/application/cards/.
- i18n: typed en.ts / vi.ts dictionaries and t(locale, key); locale fixed to 'en' until Phase 3 settings exist, with a temporary dev toggle.
- Port TarotCard (including CardBack, the reveal shine and Sparkles), CardTile, Tag, SegmentedControl, TextField, MeaningPanel, Divider (rule, sprig, star).
- /library: search field, arcana/suit chips, sort, grid; state in URL search params.
- /library/[cardId]: statically generated for all 78; sticky large card with Upright/Reversed toggle, meanings, symbolism, reflection questions, reflection panel (save button disabled until Phase 3).

Tests: content validity suite (TECH_DESIGN §10, allowing "TODO" only in minor text fields and listing them), search/filter/sort, interpret upright vs reversed, i18n key parity, e2e flow 1.
Acceptance: screens match design-system/screenshots/ScreenLibrary.png and ScreenCardDetail.png in layout, type and colour; all gates green. Stop and summarise.
```

---

## Content prompt — fill the 56 minor arcana (run during or after Phase 1)

```
Fill the "TODO" fields of src/content/cards/cups.json (then wands, swords, pentacles — one suit per run).

Rules:
- Follow the Zod schema and the voice in design-system/README.md "Content fundamentals": warm, plain, second person, reflective not predictive, no "you will".
- For each card write EN and VI: name (traditional Vietnamese Tarot naming, e.g. "Ba Cốc" style — keep it consistent across the suit), 3–5 general keywords, upright and reversed (summary 2–4 sentences + 3–5 keywords each), symbolism (2–3 sentences describing the Rider–Waite–Smith imagery), 2 reflection questions.
- Vietnamese must read naturally, not as a literal translation.
- Do not change ids, numbers, image paths or any major arcana entry.
After each suit: run the content tests, show me 2 sample cards in full (EN + VI) and stop for review.
```

---

## Phase 2 — Reading engine and the storybook ritual

```
Phase 2 of docs/TECH_DESIGN.md §11 plus the ReadingRitual from the design system. Plan first, wait for my approval, then implement.

Do:
- src/domain/random.ts and src/domain/reading/draw.ts exactly as TECH_DESIGN §6 (partial Fisher–Yates, injectable Rng, cryptoRng, seededRng), plus interpret for positions.
- src/content/spreads.ts: one-card, three-card, celtic-cross with keys, EN/VI names and prompts, and layout hints.
- drawReading use case (src/application/readings/drawReading.ts).
- Port the magic components: NightSky, Sparkles, ShuffleDeck, CardFan, ReadingRitual, Spread, Notice. Follow design-system/components/ReadingRitual/README.md step by step: idle → shuffle (riffle ×3, 2.7s) → cut (3 piles) → fan (21 cards, 80°) → choose (each card flies to the next empty position with the FLIP technique, 0.75s) → reveal (tap to turn, candle-light sweep + sparkles, name fades in) → done (Save reading disabled until Phase 3, Shuffle again). Celtic Cross variant with legend.
- The engine decides which cards land (draw once when the fan opens; the n-th chosen fan card receives the n-th drawn card). The fan index never affects randomness.
- /reading: spread SegmentedControl (one, three, Celtic Cross; switching resets the ritual) and the ritual on the night table, then the meanings for each revealed card (position name + prompt + orientation meaning) below the table.
- Reduced motion: honour prefers-reduced-motion now (the setting comes in Phase 3); every step still works, instantly.
- Keyboard: piles and fan cards are labelled buttons, aria-live guidance line, gold focus ring on night surfaces.

Tests: the full engine suite from TECH_DESIGN §6; spread definition tests; a component test that the ritual places N cards for an N-position spread; a Playwright test that walks the three-card ritual end to end (use button clicks / keyboard, not coordinates) and one with reducedMotion: 'reduce'.
Acceptance: the ritual matches design-system/screenshots/ritual-*.png and ScreenReadingRoom.png; no layout shift between steps; no console errors; all gates green. Stop and summarise.
```

---

## Phase 3 — Journal, settings and persistent storage

```
Phase 3 of docs/TECH_DESIGN.md §11. Plan first, wait for my approval, then implement.

Do:
- better-sqlite3 + Drizzle (pnpm onlyBuiltDependencies for better-sqlite3), src/server/db/client.ts with PRAGMA foreign_keys=ON and journal_mode=WAL, schema exactly as TECH_DESIGN §5.3, first migration in drizzle/.
- scripts: db:generate, db:migrate (backs up the DB file first; runs as predev/prestart), db:backup, db:restore.
- Repositories and use cases: saveReading (one transaction: reading + cards + journal entry, validating ids against content), getJournalEntry, listJournalEntries, updateJournalEntry, deleteJournalEntry (with reading cascade), settings get/save with Zod defaults, JSON export/import (/api/backup + import action).
- Server Actions per feature; await connection() on DB pages; revalidatePath after mutations.
- Reading Room: enable "Save reading" → save form (title prefilled with the first card, note, tags) → success Notice with "Open".
- /journal (grouped by month, filter chips), /journal/[entryId] (reopen the spread with Spread, meanings, edit, delete with a short Undo), /journal/new (free reflection). Port JournalEntry.
- /settings: language EN/VI, include reversed cards, reveal one by one, default spread, reduce motion (system/on/off — wire it into the ritual and all animations), interpretation detail, export/import.
- Switch the locale from the dev toggle to the saved setting, read in the root layout.

Tests: journal integration suite, persistence-after-reopen, settings defaults and invalid-JSON fallback, backup round-trip, e2e flows 2–5 from TECH_DESIGN §10 (including a server restart).
Acceptance: data survives pnpm start restarts; Vietnamese switch changes nav, labels and card names on first paint; Reduce motion makes the ritual instant; all gates green. Stop and summarise.
```

---

## Phase 4 — Study and Home

```
Phase 4 of docs/TECH_DESIGN.md §11. Plan first, wait for my approval, then implement.

Do:
- src/domain/study/leitner.ts (boxes 1–5, intervals 1/2/4/8/16 days) and quiz.ts (name↔image, keyword→card, upright vs reversed; deterministic with a seed; no duplicate options).
- study_progress repository, recordStudySession use case and action.
- /study: Flashcard session (10 cards, "Still learning" / "Got it"), quiz mode, ProgressMeter per suit. Port Flashcard and ProgressMeter.
- / (Home): greeting by time of day, FeaturedCard with the card of the day (seeded by the local date, stable all day) in the arched NightSky window, reflection prompt (Write a reflection → /journal/new prefilled), learning progress, quick actions. Match design-system/screenshots/ScreenHome.png.

Tests: Leitner transitions, quiz generation, study upsert integration, card-of-the-day stability, e2e: finish a session → progress changes on Study and Home.
Acceptance: all gates green; screens match the screenshots. Stop and summarise.
```

---

## Phase 5 — Polish, accessibility, optional AI

```
Phase 5 of docs/TECH_DESIGN.md §11. Plan first, wait for my approval, then implement.

Do:
- Accessibility pass: keyboard order, labels, live regions for shuffle/reveal/save, focus rings on paper and night surfaces, @axe-core/playwright on every page (no serious violations).
- Responsive pass at 390px and 768px: bottom nav, stacked layouts, Celtic Cross legend below the cross, fan and ritual sized for phones.
- Empty, loading and error states for library search, journal, study.
- Performance: next/image sizes for every card size, check bundle size of /reading.
- Optional AI behind ARCANA_AI_ENABLED (default false): Interpreter interface in src/application/ai, one server-only adapter, buttons "Ask for an interpretation" (after a reading) and "Suggest a reflection question" that only render when enabled; nothing is sent automatically. Ask me which provider and model before writing the adapter.

Acceptance: app fully usable by keyboard; works with AI disabled and offline; all gates green. Stop and summarise.
```

---

## Utility prompts

**Visual check against the design system**
```
Start the app, take Playwright screenshots of <route> at 1280px and 390px, and compare them with design-system/screenshots/<Name>.png and design-system/previews/<Name>.html. List every difference in spacing, type, colour, states or motion, then fix them. Do not change the design system files.
```

**Resume after a break**
```
Read CLAUDE.md and docs/PROMPTS.md, run git log --oneline -15 and pnpm test, and tell me which phase we are in, what is done, what is left, and what you propose to do next. Do not change code yet.
```

**Failing tests**
```
Run pnpm typecheck && pnpm lint && pnpm test. For each failure, explain the cause in one line, then fix it with the smallest change. Never weaken or skip a test to make it pass without asking me.
```

**Review before commit**
```
Review the uncommitted diff against CLAUDE.md (layer boundaries, tokens only, reduced motion, no new dependencies) and TECH_DESIGN.md. List problems by severity, fix the real ones, then propose a Conventional Commit message.
```
