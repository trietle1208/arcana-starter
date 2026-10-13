# ShuffleDeck

A face-down deck that riffles while `shuffling` is true: odd cards swing right, even cards left (78px, ±12°), then fall back interleaved with a 45ms stagger, three times in 2.7s, with gold dust rising from the centre.

- Use it on night surfaces only. Stop it after 2.7s — it is a moment, not a loader.
- Under reduced motion the deck stays still.

Consumer provides: `shuffling`, optional `count` (default 14), `width` (default 96).
