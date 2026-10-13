# Switch

A settings row: label, one-line description, and an on/off switch that applies immediately.

- On is `olive-ink` with the thumb moved right; off is `parchment` with a `line-strong` border — position and fill both change.
- Use for settings that take effect at once (Settings screen). For choices that need a Save, use a checkbox in a form.
- Labels state the setting, not the action: "Include reversed cards", not "Turn on reversals".

Consumer provides: `label`, `description`, `checked` + `onChange` or `defaultChecked`.
