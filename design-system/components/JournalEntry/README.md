# JournalEntry

One saved reading in the Journal list, styled as a notebook page: the date large on the left behind a `rose` margin line, the spread name, a title, a two-line excerpt, mood tags and thumbnails of the cards drawn.

- Titles are the reader's own words (default to the first card's name). Excerpts clamp at two lines.
- Mood tags use `tone="rose"`. Order entries newest first, grouped by month.
- Card thumbnails hide under 560px.

Consumer provides: `day`, `month`, `spread`, `title`, optional `excerpt`, `tags`, `cards` (image URLs), `href`.
