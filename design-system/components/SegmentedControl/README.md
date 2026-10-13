# SegmentedControl

One choice among two to four peers that change what's shown — the spread picker in the Reading Room, Upright/Reversed on Card Detail.

- Use it instead of tabs; never nest it inside another tab set.
- Selected segment is a `surface` chip on the `parchment` track with `shadow-paper`; unselected labels are `ink-soft`.
- It is a `radiogroup`: give it a `label`.

Consumer provides: `options` `[{value,label}]`, `value` + `onChange` (controlled) or `defaultValue`, `label`.
