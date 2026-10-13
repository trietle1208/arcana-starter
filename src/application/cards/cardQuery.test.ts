import { describe, expect, it } from 'vitest';
import { EMPTY_CARD_QUERY, parseCardQuery, serializeCardQuery } from './cardQuery';

const parse = (search: string) => parseCardQuery(new URLSearchParams(search));

describe('parseCardQuery', () => {
  it('uses the defaults for an empty URL', () => {
    expect(parse('')).toEqual({ q: '', sort: 'number' });
  });

  it('reads every parameter', () => {
    expect(parse('q=hermit&arcana=major&suit=cups&sort=name')).toEqual({
      q: 'hermit',
      arcana: 'major',
      suit: 'cups',
      sort: 'name',
    });
  });

  it('falls back to the default for a value it does not know', () => {
    expect(parse('arcana=other&suit=hearts&sort=price')).toEqual({ q: '', sort: 'number' });
  });

  it('trims the search text and caps its length', () => {
    expect(parse('q=%20%20hermit%20').q).toBe('hermit');
    expect(parse(`q=${'a'.repeat(300)}`).q).toBe('');
  });
});

describe('serializeCardQuery', () => {
  it('leaves out every default', () => {
    expect(serializeCardQuery(EMPTY_CARD_QUERY)).toBe('');
    expect(serializeCardQuery({ q: '  ', sort: 'number' })).toBe('');
  });

  it('writes what is set', () => {
    expect(serializeCardQuery({ q: 'high priestess', arcana: 'major', sort: 'name' })).toBe(
      'q=high+priestess&arcana=major&sort=name',
    );
    expect(serializeCardQuery({ q: '', suit: 'wands', sort: 'number' })).toBe('suit=wands');
  });

  it('round-trips through parse', () => {
    const query = { q: 'ẩn sĩ', arcana: 'major' as const, suit: undefined, sort: 'name' as const };
    expect(parse(serializeCardQuery(query))).toEqual({ q: 'ẩn sĩ', arcana: 'major', sort: 'name' });
  });
});
