# CardTile

A card in the Card Library grid: artwork, a one-line meta ("Cups · Three"), the name in Fraunces, and up to two keyword tags.

- Lay tiles out in `.ar-grid` (auto-fill, min 150px, `space-4` gap) — 2 columns on phones, 4–6 on desktop.
- Hover is understated: a `surface` fill and `line` border appear behind the tile. No lift, no glow, no zoom on the artwork.
- The whole tile is one link to Card Detail.

Consumer provides: `src`, `name`, `meta`, optional `keywords` (≤2), `href`.
