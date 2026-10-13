import { z } from 'zod';

// The library keeps its state in the URL: ?q=hermit&arcana=major&suit=cups&sort=name.
// A bad value falls back to its default so a hand-edited URL never breaks the page.
export const CardQuerySchema = z.object({
  q: z.string().trim().max(100).catch('').default(''),
  arcana: z.enum(['major', 'minor']).optional().catch(undefined),
  suit: z.enum(['cups', 'wands', 'swords', 'pentacles']).optional().catch(undefined),
  sort: z.enum(['number', 'name']).catch('number').default('number'),
});

export type CardQuery = z.infer<typeof CardQuerySchema>;
export type CardSort = CardQuery['sort'];

export const EMPTY_CARD_QUERY: CardQuery = { q: '', sort: 'number' };

/** Anything with a `get`: URLSearchParams, Next's ReadonlyURLSearchParams. */
interface ParamSource {
  get(name: string): string | null;
}

export function parseCardQuery(params: ParamSource): CardQuery {
  return CardQuerySchema.parse({
    q: params.get('q') ?? undefined,
    arcana: params.get('arcana') ?? undefined,
    suit: params.get('suit') ?? undefined,
    sort: params.get('sort') ?? undefined,
  });
}

/** The query string without the leading "?", leaving out every default. */
export function serializeCardQuery(query: CardQuery): string {
  const params = new URLSearchParams();
  if (query.q.trim()) params.set('q', query.q);
  if (query.arcana) params.set('arcana', query.arcana);
  if (query.suit) params.set('suit', query.suit);
  if (query.sort !== 'number') params.set('sort', query.sort);
  return params.toString();
}
