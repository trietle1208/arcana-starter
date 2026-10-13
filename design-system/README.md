Arcana is a Tarot reading, learning and journaling app that should feel like an independent bookstore, a personal reading journal and a vintage Tarot deck in one: warm, personal, calm and quietly artistic. It is **Warm Indie / Cozy Editorial with a storybook night**: by day, paper, books and analog photography; at the reading table, a midnight sky with gilded line art, like the endpapers of an old fairy-tale book. It is not a SaaS dashboard, an occult game or a luxury fortune-telling service. Everyday screens stay calm paper; magic is saved for ritual moments — shuffling, drawing, revealing, the card of the day.

## Principles

1. **Usability before decoration.** Familiar navigation, obvious buttons and states, visible focus, descriptive labels. If an ornament makes something harder to find, remove the ornament.
2. **Let the cards speak.** Show the original illustrations untouched — no filters, tints, glows or overlays. Frames, paper and type do the styling.
3. **Paper on paper.** Cream and parchment grounds, thin warm borders, barely-there shadows. Accents appear in small doses for actions, active states, tags and highlights.
4. **Editorial rhythm.** Clear hierarchy, comfortable reading widths (`measure`, 66ch), generous but practical whitespace.
5. **Ritual motion.** Motion tells the story of a reading — the deck riffles, the fan opens, a chosen card flies to its place and turns over in candle light. It happens when the reader acts, lasts under three seconds per step, and is fully skippable through reduced motion. Lists, forms and settings stay still.
6. **Day and night.** Paper for reading, studying and writing; a framed `midnight` sky (`NightSky`) for the reading table and the card of the day. Night is always a panel inside the paper page, never the whole screen.

## Content fundamentals

- **Voice:** a thoughtful friend who knows the cards. Warm, plain, second person ("you"); the app never says "I". Sentence case everywhere, including buttons and headings.
- **Reflective, not predictive.** Offer readings as ways to look at a question, never verdicts. Write "This card can point to…", "You might ask yourself…" — never "You will…" or "Destiny awaits".
- **Plain verbs on controls:** "Shuffle the deck", "Draw three cards", "Save reading", "Write a reflection". Avoid grand mystical verbs ("Divine", "Unveil", "Consult the oracle").
- **A storybook hush in ritual guidance:** the line above the reading table may be gently fairy-tale ("Hold your question in mind, then shuffle the deck.", "Turn each card over when you are ready."), set in Fraunces italic. Never promise outcomes.
- **Prompts are single open questions:** "Where could a little quiet help you hear yourself today?"
- **Feedback says what happened, then what's next:** "Reading saved to your journal. Add notes to it any time."
- **No emoji, no exclamation marks, no fake urgency, no streak guilt.** Numbers are stated plainly ("14 of 22").
- Card names keep their traditional form and capitals: "The Hermit", "Three of Cups", "Ace of Wands". Suits are capitalised (Cups, Wands, Swords, Pentacles); "major arcana" and "minor arcana" are lowercase in running text.

## Colour

Most of every screen is `paper`, `parchment` and `surface`. Use `terracotta-ink` and `olive-ink` only for selected actions, active navigation, tags and small highlights — think 5–10% of a screen, never a large field.

| Role | Token | Rules |
| --- | --- | --- |
| Page | `paper` #F6F1E8 | Default background of every screen. |
| Quiet panels | `parchment` #EAE0D0 | Side nav, the Reading Room table, secondary panels. Small secondary text on it is `ink-soft`, not `ink-muted`. |
| Cards, inputs | `surface` #FFFCF6 | Anything the reader touches or reads closely, and the frame around Tarot art. |
| Text | `ink` #352F29 / `ink-muted` #756B60 / `ink-soft` #6B6156 | `ink` for primary text everywhere; `ink-muted` for metadata on paper or surface; `ink-soft` on parchment. |
| Primary accent | `terracotta` #B8755B → `terracotta-ink` #8C4F38 | The brief's terracotta is 3.3:1 on paper — too light for text or white labels. It stays exact for large decorative marks (card-back monogram, wordmark full stop, cover). Text, the primary button, links, selected states and the focus ring use the deeper `terracotta-ink` (5.7:1). Tints: `terracotta-soft`. |
| Secondary accent | `olive` #7D8461 → `olive-ink` #5E6447 | `olive` for progress fills and the sprig; `olive-ink` for success text, "Learned" tags and the switch's on state. Tint: `olive-soft`. |
| Decorative | `rose` #C8A39A, `rose-soft` | Card-back rules, the journal margin line, mood tags, the reflection-prompt panel. Never a state. |
| Borders | `line` #DCD2C3 / `line-strong` | `line` for decorative hairlines and card edges; `line-strong` (≥3.3:1) for anything that marks a control: inputs, chips, switches, secondary buttons. |
| Storybook night | `midnight` #1F2340, `midnight-raised` #2B3052 | The reading table, the card back, the arched window around the card of the day. Always a framed panel (`radius-lg` or the arch), never a page background. |
| Night text | `starlight` #F3EAD6 / `starlight-muted` #B8B2C9 | Headings and guidance on midnight (12.8:1 / 7.5:1). |
| Gilt | `gold` #D4AF6A → `gold-ink` #7D5C22 | `gold` only on midnight: card-back line art, sparkles, the gold button (label `on-gold`), the focus ring on night surfaces (7.4:1). On paper use `gold-ink` (5.5:1) for the star divider. `shadow-glow` is the candle halo, night surfaces only. |

Never use neon purple, saturated gradients, glassmorphism, heavy drop shadows or pure black. The only glow is the soft gold candle halo on night surfaces; the night sky's lighting is two faint radial washes, not a gradient you notice. There is one theme, **Paper**; the night panels live inside it.

## Typography

- **Fraunces** (`--font-display`) for personality: screen titles, card names, section headings, reflection prompts. Use its soft optical sizes at weights 360–500; never all caps, never bold-heavy.
- **DM Sans** (`--font-sans`) for reading and every control. Body copy is `body` (15/24); meanings and journal text are `body-lg` (17/28) capped at `measure`.
- Scale: `display-xl` 48 (Home greeting) · `display` 36 (card name, Reading Room question) · `title` 28 (page titles) · `heading` 22 · `subheading` 18 · `quote` 20 italic · `body-lg` 17 · `body` 15 · `label` 14 · `caption` 13 · `overline` 12 uppercase, tracked 0.08em.
- One `display-*` per screen. Serif is for expression; never set controls, tables or long body copy in it.
- Display headings (`.ar-h1`–`.ar-h3`, the ritual question, position names) turn on Fraunces' `SOFT 100` and `WONK 1` axes (`font-variation-settings`) for a softer, slightly leaning storybook letter. Body copy never does.
- Both families load from Google Fonts: `Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,0..100,0..1;1,9..144,300..500,0..100,0..1` and `DM+Sans:opsz,wght@9..40,400..700`. In Next.js use `next/font/google` with `axes: ['SOFT', 'WONK', 'opsz']`.

## Space, shape and depth

- 4px base: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48 · `space-16` 64. Page gutters are `space-4` on mobile and `space-12` on desktop; sections are `space-8` / `space-12` apart.
- Layout: side nav `nav-width` (232px) + content up to `content-max` (1120px). Reading text never exceeds `measure`.
- Radii are small paper corners: `radius-sm` 4 (tags), `radius-md` 8 (buttons, inputs, notices), `radius-lg` 14 (cards, panels), `radius-card` 10 (Tarot frames), `radius-full` (switch, progress, number badges).
- Borders separate; shadows barely lift. `shadow-paper` for cards and frames at rest, `shadow-lift` only for hover on journal entries, a settling card, or a menu.

## Interaction and states

- **Focus:** every interactive element shows a 2px solid `focus` (= `terracotta-ink`) outline, offset 2px; on night surfaces the ring is `gold`. Never remove it.
- **Selected / active** always changes at least two things: fill plus border or icon (chips get a check; nav gets a surface pill, a `terracotta-ink` bar and icon; segmented controls get a raised surface chip).
- **Hover** is understated on paper: a parchment or surface fill appears. On night surfaces a face-down card rises (6px in a spread, 20px in the fan) and takes `shadow-glow`.
- **Disabled:** `parchment` fill, `ink-soft` text, with a reason nearby.
- **Feedback:** after drawing, an info `Notice` ("3 cards drawn — turn them over one at a time"); after saving, a success `Notice` with an "Open" action. No confirmation modals for saves; avoid modals generally and never nest tabs.
- **Motion** (all under `prefers-reduced-motion: reduce` become instant or still):

| Moment | Motion | Duration · easing |
| --- | --- | --- |
| Shuffle | Riffle: halves swing ±78px / ±12°, interleave back, ×3; gold dust rises | 0.9s × 3, `cubic-bezier(.45,.05,.3,1)`, 45ms stagger |
| Cut | Three piles dealt out; chosen pile lifts 26px, others gather | 0.5s deal, 0.75s lift |
| Fan | 21 cards sweep open over 80° | 0.7s, 18ms stagger |
| Choose | Fan card rises 20px with gold halo | 0.28s |
| Place | Card flies to its position, lifting 12px and brightening mid-air | 0.75s `cubic-bezier(.3,.6,.2,1)` |
| Reveal | Card turns; candle-light sweep across the art; gold frame glow; sparkle burst | 0.55s turn + 1.1s light |
| Waiting cards | Face-down cards in a reveal step pulse a soft gold halo | 2.4s loop, only while waiting |
| Ambient | Stars twinkle; card of the day drifts 8px | 3–7s / 6s loops, night panels only |
| Everyday | Flashcard turn 500ms; hovers 150ms | — |
- **Touch targets** are at least 40px tall (34px only for filter chips in dense rows).

## Tarot artwork and decoration

- Card art is the 1909 Rider–Waite–Smith deck by Pamela Colman Smith (public domain in the US), cropped to the artwork and stored in the **Tarot** asset group as WebP (284×511). Show it at its natural ratio inside `TarotCard`'s cream frame; never recolour, blur or overlay it.
- Card back (`CardBack`): `midnight` with `gold` line art — a double border with curled corners, a sun with sixteen rays cradling a crescent moon, a sparkle above and below. It is mirror-symmetric top to bottom so reversals never show from the back.
- Reversed cards rotate 180° *and* say "Reversed" in text.
- Handmade details, used sparingly: the slightly uneven pencil-rule `Divider`, the olive botanical sprig (at most once per screen), ruled lines in journal text areas, the `rose` margin line on journal entries.
- Storybook ornament lives on night surfaces and ritual moments only: stars (`NightSky`), the card back, gold sparkles on reveal, the `star` divider. Everyday paper panels — lists, forms, settings, meanings — stay plain. No zodiac glyphs, pentagrams, eyes or occult symbols anywhere.

## Iconography

Arcana's own line set in `Icon` (24px grid, 1.6 stroke, round caps, `currentColor`): home, library, reading, study, journal, settings, search, shuffle, bookmark, pen, check, plus, arrow, turn, info, x. Icons accompany labels; an icon alone needs an accessible label. No emoji and no mystical glyphs as UI icons. There is no logo file — the wordmark is "Arcana" in Fraunces italic with a `terracotta` full stop, as `AppNav` renders it.

## Screens

- **Home** — greeting in `display-xl`, a `FeaturedCard` (card of the day floating in an arched night window, three keywords, summary, reflection prompt), learning `ProgressMeter`s and a parchment "Start something" panel of quick actions.
- **Card library** — page title, search field, one row of arcana filter chips, a `CardTile` grid (2 columns on phones, 5 on desktop). Understated hover.
- **Card detail** — reference-book layout: large card (sticky) with an Upright/Reversed `SegmentedControl` on the left; overline, name, intro, `MeaningPanel` and a reflection panel on the right.
- **Reading room** — a spread `SegmentedControl` (one card, three cards, Celtic Cross), then the `ReadingRitual` on a midnight table: the question in starlight, the deck, and empty gold-dashed positions. Shuffle → cut → choose from the `CardFan` → cards fly to their positions → turn them over → "Save reading" (gold) and "Shuffle again". The save `Notice` appears below the table.
- **Study** — one `Flashcard` with "Still learning" / "Got it", plus progress per suit. No points, levels or streak flames.
- **Journal** — "New entry" primary action, filter chips, `JournalEntry` notebook cards grouped by month; ruled `TextField` for writing.
- **Settings** — plain `Switch` rows grouped under headings, a default-spread `SegmentedControl`, export and sign out.

On mobile (<768px) the side nav becomes `AppNav orientation="bottom"` with five items, layouts stack to one column, and the Celtic Cross legend moves below the layout.

## Building with it (Next.js)

- Map tokens to CSS custom properties (`tokens.css`) and reference them with `var(--token)`; port each component as `Component.tsx` + `Component.module.css` keeping the token references.
- The ritual's flight uses a FLIP step: measure the chosen fan card and the target position with `getBoundingClientRect`, render a flying card at the start, then transition `transform` to the target. In React, keep it in one client component with refs (as `ReadingRitual` does); no animation library is required. The reading engine decides which card lands, not the fan index.
- `components/bundle.js` (`window.Arcana`, React 18) and `bundle.css` are working reference implementations of every component; port each to a typed React component (`components/index.d.ts` lists the props) keeping the class names' behaviour and the token references.
- Serve card images from your own `/public/cards/<slug>.webp` using the slugs in the Tarot group (`09-the-hermit`, `cups-03`, `wands-ace`…), via `next/image` with `sizes` matching the `TarotCard` widths.
