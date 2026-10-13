# Flashcard

A study card that turns over: a question in Fraunces on the front, the answer in `body-lg` on a ruled back.

- Tap or Enter/Space turns it (500ms; instant with reduced motion). The visible side is announced; the hidden side is `aria-hidden`.
- Below it, offer two plain buttons — "Still learning" (secondary) and "Got it" (primary) — never a score popup.
- Keep questions to one line; answers to two sentences.

Consumer provides: `front`, `back`, optional `eyebrow`, `flipped` + `onFlip` or `defaultFlipped`.
