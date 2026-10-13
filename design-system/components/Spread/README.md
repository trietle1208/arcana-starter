# Spread

Lays out drawn cards in a named spread: `three` (Past · Present · Future) or `celtic` (the ten-card Celtic Cross).

- Every position has a number badge (`surface` disc, `terracotta-ink` numeral). Three-card slots print the position name and question beneath; the Celtic Cross pairs the layout with a numbered **legend** listing each position and, once revealed, its card.
- Celtic Cross geometry: 1 Present at the centre, 2 Challenge crossing it (rotated 90°), 3 Foundation below, 4 Recent past left, 5 Possibility above, 6 Near future right; 7–10 (Self → Outcome) stack bottom-to-top in the staff column.
- Unrevealed positions are face-down cards; tapping one reveals it (`onCardClick`). Highlight the position being read with `current` — it outlines the card and tints its legend row `terracotta-soft`.
- Card width scales with the viewport (64–92px for the Celtic Cross, 96–168px for three cards). Below ~560px put the legend under the layout.

Consumer provides: `type`, `cards` `[{src,name,reversed,revealed}]`, optional `positions` `[[name, question]]`, `current`, `onCardClick`, `legend`.
