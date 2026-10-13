# NightSky

The storybook night: a `midnight` surface lit by a faint candle glow from below and a `midnight-raised` haze above, scattered with twinkling `starlight` dots and a few `gold` sparkles (deterministic per `seed`, 3–7s twinkle).

- Always a framed panel inside the paper page (`radius-lg`, or the arched `ar-window`), never a full-page background.
- Text on it: `starlight` for headings, `starlight-muted` for guidance (both ≥ 6:1). Buttons: `gold` and `night` variants. Focus ring turns gold.
- Under reduced motion the stars hold still.

Consumer provides: `children`, optional `stars` (default 36), `seed`, `as`, `className`, `label`, `style`.
