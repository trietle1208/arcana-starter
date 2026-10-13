# Tag

A small label (keywords, moods, study state) — or, given `onClick`/`selected`, a pressable filter chip.

- Static tones: neutral (`parchment`), `terracotta` (keywords on the featured card), `olive` (study progress: "Learned"), `rose` (journal moods). Tone carries meaning; don't pick one for decoration.
- Filter chips are 34px tall, `surface` with a `line-strong` border; selected adds a check icon, `terracotta-soft` fill and a `terracotta-ink` border — never colour alone. They use `aria-pressed`.
- Group chips under a visible label or `aria-label` ("Filter by arcana"). One row, wrapping; no more than ~8 chips before switching to a select.

Consumer provides: `children`, optional `tone`, or `selected` + `onClick` for chips.
