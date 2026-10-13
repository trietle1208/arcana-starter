# CardFan

Face-down cards spread over an 80° arc, each rotating about a point far below the fan so the arc reads like a hand of cards. They sweep open in 0.7s (18ms stagger).

- Hover or focus lifts a card 20px along its own angle with `shadow-glow`. Taken cards leave a gap.
- Each card is a button labelled "Choose card n of N"; the fan is a labelled group.

Consumer provides: `onPick(index, element)`, optional `count` (default 21), `taken` (indexes), `spread` (degrees), `cardWidth` (default 64), `disabled`.
