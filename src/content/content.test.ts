import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { COURT_RANKS, DECK_IDS, MINOR_RANKS, SUITS } from '@/domain/tarot/deck';
import { isPlaceholder, PLACEHOLDER } from '@/domain/tarot/placeholder';
import type { Localized, TarotCard } from '@/domain/tarot/types';
import cups from './cards/cups.json';
import major from './cards/major.json';
import pentacles from './cards/pentacles.json';
import swords from './cards/swords.json';
import wands from './cards/wands.json';
import { ALL_CARD_IDS, ALL_CARDS, getCard, hasCard } from './index';
import { CardFileSchema, TarotCardSchema } from './schema';

const RAW_FILES = { major, cups, wands, swords, pentacles };
const CARD_IMAGES = join(process.cwd(), 'public', 'cards');
const LOCALES = ['en', 'vi'] as const;

const majors = ALL_CARDS.filter((card) => card.arcana === 'major');
const minors = ALL_CARDS.filter((card) => card.arcana === 'minor');

/** Every string of a card with the path it sits at: 'meanings.upright.summary.en'. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      strings(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

/** The fields that carry prose. Only these may still say "TODO", and only on minor cards. */
const TEXT_FIELD =
  /^(intro|keywords|symbolism|reflectionQuestions|meanings\.(upright|reversed)\.(summary|keywords))\./;

const todoFields = (card: TarotCard) =>
  strings(card)
    .filter(([, text]) => isPlaceholder(text))
    .map(([path]) => path);

const sentences = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean).length;

describe('card files', () => {
  it.each(Object.entries(RAW_FILES))('%s.json matches the card schema', (_name, data) => {
    const result = CardFileSchema.safeParse(data);
    expect(result.success, result.success ? '' : result.error.message).toBe(true);
  });

  it('holds exactly the 78 cards of the deck, once each, in deck order', () => {
    expect(ALL_CARDS).toHaveLength(78);
    expect(new Set(ALL_CARD_IDS).size).toBe(78);
    expect([...ALL_CARD_IDS]).toEqual([...DECK_IDS]);
  });

  it('numbers the 22 major arcana 0 to 21 without gaps', () => {
    expect(majors.map((card) => (card.arcana === 'major' ? card.number : -1))).toEqual(
      Array.from({ length: 22 }, (_, i) => i),
    );
  });

  it.each(SUITS)('gives %s fourteen cards: ace to ten and the four courts', (suit) => {
    const ranks = minors.flatMap((card) =>
      card.arcana === 'minor' && card.suit === suit ? [card.rank] : [],
    );
    expect(ranks).toEqual([...MINOR_RANKS]);
    expect(MINOR_RANKS.filter((rank) => typeof rank === 'string')).toEqual([...COURT_RANKS]);
  });

  it('gives every card an id of the documented shape', () => {
    for (const card of ALL_CARDS) expect(card.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(ALL_CARD_IDS).toContain('the-fool');
    expect(ALL_CARD_IDS).toContain('the-world');
    expect(ALL_CARD_IDS).toContain('cups-ace');
    expect(ALL_CARD_IDS).toContain('swords-02');
    expect(ALL_CARD_IDS).toContain('pentacles-king');
  });

  it('points every image at a file in public/cards, and every file at a card', () => {
    for (const card of ALL_CARDS) {
      expect(existsSync(join(process.cwd(), 'public', card.image)), card.image).toBe(true);
    }
    const files = readdirSync(CARD_IMAGES).filter((file) => file.endsWith('.webp'));
    expect(files.sort()).toEqual(ALL_CARDS.map((card) => card.image.replace('/cards/', '')).sort());
  });

  it('names every card in English and Vietnamese', () => {
    for (const card of ALL_CARDS) {
      for (const locale of LOCALES) expect(card.name[locale].trim(), card.id).not.toBe('');
    }
  });

  it('gives every card both meanings and a reflection question per language', () => {
    for (const card of ALL_CARDS) {
      for (const orientation of ['upright', 'reversed'] as const) {
        for (const locale of LOCALES) {
          expect(card.meanings[orientation].summary[locale].trim(), card.id).not.toBe('');
          expect(card.meanings[orientation].keywords[locale].length, card.id).toBeGreaterThan(0);
        }
      }
      for (const locale of LOCALES) {
        expect(card.reflectionQuestions[locale].length, card.id).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('looks cards up by id and rejects an unknown id', () => {
    expect(getCard('the-hermit').name.en).toBe('The Hermit');
    expect(getCard('the-hermit').name.vi).toBe('Ẩn Sĩ');
    expect(hasCard('cups-03')).toBe(true);
    expect(hasCard('cups-3')).toBe(false);
    expect(() => getCard('cups-3')).toThrow(/Unknown card id/);
  });

  it('rejects a card whose structure is wrong', () => {
    const hermit = structuredClone(getCard('the-hermit'));
    expect(TarotCardSchema.safeParse(hermit).success).toBe(true);
    expect(TarotCardSchema.safeParse({ ...hermit, number: 22 }).success).toBe(false);
    expect(TarotCardSchema.safeParse({ ...hermit, image: 'cards/x.png' }).success).toBe(false);
    expect(TarotCardSchema.safeParse({ ...hermit, name: { en: 'The Hermit' } }).success).toBe(
      false,
    );
    expect(
      TarotCardSchema.safeParse({ ...hermit, reflectionQuestions: { en: [], vi: [] } }).success,
    ).toBe(false);
    expect(TarotCardSchema.safeParse({ ...hermit, extra: true }).success).toBe(false);
  });
});

describe('placeholders', () => {
  it('leaves no "TODO" in the 22 major arcana', () => {
    for (const card of majors) expect(todoFields(card), card.id).toEqual([]);
  });

  it('allows "TODO" only as the whole value of a prose field of a minor card', () => {
    for (const card of ALL_CARDS) {
      for (const [path, text] of strings(card)) {
        if (!text.includes(PLACEHOLDER)) continue;
        expect(card.arcana, `${card.id} ${path}`).toBe('minor');
        expect(text, `${card.id} ${path}`).toBe(PLACEHOLDER);
        expect(path, `${card.id} ${path}`).toMatch(TEXT_FIELD);
      }
    }
  });

  it('reports the minor cards that still need their text', () => {
    const lines = SUITS.map((suit) => {
      const cards = minors.filter((card) => card.arcana === 'minor' && card.suit === suit);
      const open = cards.filter((card) => todoFields(card).length > 0);
      const fields = open.reduce((sum, card) => sum + todoFields(card).length, 0);
      return `${suit}: ${open.length} of ${cards.length} cards still TODO (${fields} fields)`;
    });
    console.info(`Content still to write:\n  ${lines.join('\n  ')}`);
    expect(lines).toHaveLength(4);
  });
});

describe('finished cards', () => {
  // A card with no "TODO" left is held to the full content rules, so the Content prompt that
  // fills the minor arcana is checked by these tests as it goes.
  const finished = ALL_CARDS.filter((card) => todoFields(card).length === 0);

  it('includes at least the 22 major arcana', () => {
    expect(finished.length).toBeGreaterThanOrEqual(22);
  });

  it('gives each card 3 to 5 keywords, in every list and language', () => {
    for (const card of finished) {
      const lists: Localized<string[]>[] = [
        card.keywords,
        card.meanings.upright.keywords,
        card.meanings.reversed.keywords,
      ];
      for (const list of lists) {
        for (const locale of LOCALES) {
          expect(list[locale].length, `${card.id} ${locale}`).toBeGreaterThanOrEqual(3);
          expect(list[locale].length, `${card.id} ${locale}`).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('keeps the texts to the documented length', () => {
    for (const card of finished) {
      for (const locale of LOCALES) {
        const where = `${card.id} ${locale}`;
        expect(sentences(card.intro[locale]), `${where} intro`).toBeGreaterThanOrEqual(1);
        expect(sentences(card.intro[locale]), `${where} intro`).toBeLessThanOrEqual(3);
        for (const orientation of ['upright', 'reversed'] as const) {
          const n = sentences(card.meanings[orientation].summary[locale]);
          expect(n, `${where} ${orientation}`).toBeGreaterThanOrEqual(2);
          expect(n, `${where} ${orientation}`).toBeLessThanOrEqual(4);
        }
        expect(sentences(card.symbolism[locale]), `${where} symbolism`).toBeGreaterThanOrEqual(2);
        expect(sentences(card.symbolism[locale]), `${where} symbolism`).toBeLessThanOrEqual(3);
      }
    }
  });

  it('writes Vietnamese that is not a copy of the English', () => {
    for (const card of finished) {
      for (const [path, text] of strings(card)) {
        if (!path.endsWith('.en')) continue;
        const vi = strings(card).find(([p]) => p === path.replace(/\.en$/, '.vi'))?.[1];
        expect(vi, `${card.id} ${path}`).not.toBe(text);
      }
    }
  });

  it('keeps the voice of the brand book: no exclamation marks, emoji or predictions', () => {
    for (const card of finished) {
      for (const [path, text] of strings(card)) {
        const where = `${card.id} ${path}`;
        expect(text, where).not.toContain('!');
        expect(text, where).not.toMatch(/\p{Extended_Pictographic}/u);
        if (path.endsWith('.en') || path.includes('.en[')) {
          expect(text, where).not.toMatch(/\byou(?:'ll| will)\b/i);
        }
      }
    }
  });
});
