# Notice

Inline feedback: `success` (`olive-soft` with an `olive-ink` check) after saving, `info` (`surface`, `terracotta-ink` info icon) for guidance such as "3 cards drawn".

- Title says what happened, in past tense; body says what's next. One optional quiet action ("Open", "Undo").
- Show it in place, near what changed — or as a toast at the bottom on mobile — and keep it until the reader moves on. It is `role="status"`.
- Never use a modal to confirm a save.

Consumer provides: `title`, optional `children`, `tone` (`success` | `info`), `action`.
