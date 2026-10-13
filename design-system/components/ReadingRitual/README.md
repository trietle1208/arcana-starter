# ReadingRitual

The heart of the Reading Room: a storybook ritual on a midnight table, in six steps — **shuffle → cut → fan → choose → place → reveal**.

1. **Idle** — the deck rests on the table; the reader holds the question in mind and presses "Shuffle the deck" (gold button).
2. **Shuffle** — the deck riffles three times (2.7s): the stack splits left and right and interleaves back, gold dust rising.
3. **Cut** — the deck is dealt into three piles; the chosen pile lifts and the others gather under it (0.75s).
4. **Fan** — 21 face-down cards spread in an arc. A card under the pointer or keyboard focus rises 20px with a gold halo. The guidance line counts "1 of 3 chosen".
5. **Place** — each chosen card flies from the fan to the next empty position (0.75s arc, lifting and brightening mid-air) and lands face down; the empty position is a dashed gold outline.
6. **Reveal** — face-down cards gently pulse; tapping one turns it over with the candle-light sweep and sparkles, and its name fades in under the position. When all are turned, "Save reading" (gold) and "Shuffle again" appear.

- Order of draw is decided by the reading engine, not by which fan card is tapped; the fan is the ritual, the engine is the randomness. Pass the drawn cards as `cards`, in position order.
- `layout="celtic"` places ten cards into the Celtic Cross (position 2 lands crossways); the default places one or three in a row.
- Every step is reachable by keyboard: piles and fan cards are buttons with labels ("Choose card 7 of 21"); the guidance line is an `aria-live` region.
- With reduced motion all steps still happen, instantly: no riffle, no flight, no sparkles, no pulsing.
- Guidance copy may be gently storybook ("Hold your question in mind"); button labels stay plain verbs.

Consumer provides: `cards` `[{src,name,reversed}]`, optional `question`, `layout` (`row` | `celtic`), `positions`, `fanCount` (default 21), `onSave`, `onComplete`, `initialStep`, `seed`.
