export const MAX_TAGS = 8;
export const MAX_TAG_LENGTH = 24;

/** Trims tags, drops empty ones and repeats (ignoring case), keeping the first spelling. */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim();
    const key = tag.toLocaleLowerCase();
    if (tag === '' || seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }
  return result;
}

/** What the reader typed into the tags field: "Work, Calm" → ['Work', 'Calm']. */
export function splitTagInput(text: string): string[] {
  return normalizeTags(text.split(/[,\n;]/));
}

/** The note collapsed to one line and cut at a word, for the list. */
export function excerptOf(body: string, max = 200): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
