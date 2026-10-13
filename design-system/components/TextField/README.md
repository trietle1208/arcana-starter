# TextField

A labelled input; `multiline` turns it into the journal's ruled notebook textarea.

- The label always sits above, visible — never placeholder-as-label. Placeholders are examples in `ink-muted`.
- Border is `line-strong` (≥3:1) on `surface`; focus adds the 2px `focus` outline.
- Multiline text is `body-lg` (17/28) over faint `line` rules every 28px, so long reflections read like a notebook page. Keep rows ≥ 3.
- `hint` sits below in `caption`, wired with `aria-describedby`. Use it for guidance, not errors — phrase errors as what to do ("Add a few words before saving").

Consumer provides: `label` (required), `hint`, `multiline`, `rows`, plus native input/textarea props (`value`, `onChange`, `placeholder`, `name`).
