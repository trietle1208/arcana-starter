# FeaturedCard

The Home hero: today's card floats in an arched night window (a small `NightSky`) on the left; its name, three keywords, a two-line summary and a reflection prompt sit on the right.

- The arched window (150px top radius) is the storybook frame for the card of the day; the card drifts 8px up and down over 6s (still under reduced motion).

- Sits on `surface` with a `line` border and `radius-lg`; one per screen.
- The prompt is a single question in `quote` style (Fraunces italic) on a `rose-soft` panel — open, gentle, second person.
- Up to two actions: one primary ("Write a reflection"), one quiet.
- Stacks to a single centred column under 640px.

Consumer provides: `src`, `name`, optional `eyebrow`, `keywords`, `summary`, `prompt`, `actions` (Buttons), `reversed`.
