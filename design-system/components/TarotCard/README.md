# TarotCard

One Tarot card: the original artwork inside a warm off-white frame — the visual centre of every screen.

- Artwork is shown as-is: `object-fit: cover`, no filters, tints or overlays. The frame (`surface`, `line` border, `radius-card`, `shadow-paper`) does the styling.
- Sizes: `sm` 96px (spreads, journal), `md` 148px (library), `lg` 236px (Home, Card Detail). Ratio is fixed at 284:511.
- **Face-down** shows the storybook card back (`CardBack`): `midnight` with gilded line art — a double border with curled corners, a sun cradling a crescent moon, two sparkles. A face-down card that can be turned lifts 6px and gains `shadow-glow` under the pointer.
- **Revealing:** when `faceDown` goes from true to false the card turns over in 550ms (`cubic-bezier(.2,.7,.2,1)`), then a band of candle light sweeps across the art once, the frame glows gold and a burst of gold sparkles scatters (1.4s in all). With reduced motion it switches instantly with no light or sparkles.
- **Reversed** rotates the artwork 180° *and* (with `showName`) prints "Reversed" under the name — never rely on orientation alone.
- **Selected** adds a 2px `terracotta-ink` outline, 3px off the frame.
- Without `src` it shows a quiet placeholder with numeral and name — for loading states only.
- Clickable cards (`onClick`) render as buttons; face-down ones are labelled "Face-down card — select to reveal".

Consumer provides: `src` (card image URL), `name`, optional `numeral`, `size`, `faceDown`, `reversed`, `selected`, `showName`, `onClick`, `label`.
