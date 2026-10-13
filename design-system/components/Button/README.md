# Button

A labelled action in three weights: `primary`, `secondary` (default) and `quiet`.

- **Primary** (`terracotta-ink` fill, `on-accent` label) at most once per view, for the thing the screen is for: "Draw three cards", "Save reading".
- **Secondary** (`surface` with a `line-strong` border) for everything else that matters.
- **Quiet** (terracotta-ink text, no border) for inline links to more: "Read the full meaning".
- Labels are verb-first sentence case, two to four words. No exclamation marks, no "mystical" verbs ("Divine", "Unveil") — say "Draw", "Reveal", "Save".
- `icon` / `iconAfter` take an `Icon` name; use one only where it helps scanning (shuffle on draw, bookmark on save).
- `size="sm"` (32px) inside cards and toolbars; default height is 40px — never smaller targets on touch.
- Disabled shows `parchment` with `ink-soft` text and a reason nearby ("Saving…").
- On night surfaces (`NightSky`, the Reading Room table) use **gold** (`gold` fill, `on-gold` label, a soft gold halo on hover) as the one primary action and **night** (starlight outline) for the rest. Never put gold buttons on paper.

Consumer provides: `children` (label), `onClick`, optional `variant`, `size`, `icon`, `iconAfter`, and any native button props.
