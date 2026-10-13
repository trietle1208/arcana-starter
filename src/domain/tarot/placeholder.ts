/** Text fields of cards that are not written yet carry exactly this string. */
export const PLACEHOLDER = 'TODO';

export function isPlaceholder(text: string): boolean {
  return text === PLACEHOLDER;
}

/** The keywords that are real words, without the placeholder. */
export function withoutPlaceholders(texts: readonly string[]): string[] {
  return texts.filter((text) => !isPlaceholder(text));
}
