import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getReadingCards } from '@/application/readings/readingCards';
import { getSpread } from '@/content/spreads';
import { interpret } from '@/domain/tarot/interpret';
import { t } from '@/i18n';
import { ReadingMeanings, type MeaningItem } from './ReadingMeanings';
import { ReadingRoom } from './ReadingRoom';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const cards = getReadingCards();
const byId = new Map(cards.map((card) => [card.id, card]));

function itemFor(
  n: number,
  cardId: string,
  orientation: 'upright' | 'reversed',
  spreadId = 'three-card',
): MeaningItem {
  const spread = getSpread(spreadId);
  const card = byId.get(cardId)!;
  const drawn = {
    positionIndex: n - 1,
    positionKey: spread.positions[n - 1].key,
    cardId,
    orientation,
  };
  return { n, interpreted: interpret(drawn, card, spread) };
}

describe('ReadingRoom', () => {
  const markup = html(<ReadingRoom cards={cards} />);

  it('opens on the three-card spread, with one choice for each spread', () => {
    expect(markup).toContain('Sit with a question');
    expect(markup).toContain('aria-label="Spread"');
    expect(markup).toMatch(/aria-checked="false"[^>]*>One card</);
    expect(markup).toMatch(/aria-checked="true"[^>]*>Three cards</);
    expect(markup).toMatch(/aria-checked="false"[^>]*>Celtic Cross</);
  });

  it('shows the ritual on the table, at rest, with three positions to fill', () => {
    expect(markup).toContain('aria-label="Reading table"');
    expect(markup).toContain('data-step="idle"');
    expect((markup.match(/data-state="empty"/g) ?? []).length).toBe(3);
    expect(markup).toContain('Shuffle the deck');
  });

  it('shows no meanings and no draw notice before anything is turned over', () => {
    expect(markup).not.toContain('What the cards say');
    expect(markup).not.toContain('cards drawn');
    expect(markup).toContain('Readings are private to you.');
  });

  it('does not offer to save: the journal arrives in a later phase', () => {
    expect(markup).not.toContain('Save reading');
  });
});

describe('ReadingMeanings', () => {
  it('renders nothing until a card has been turned over', () => {
    expect(html(<ReadingMeanings items={[]} locale="en" t={(key) => t('en', key)} />)).toBe('');
  });

  it('gives each turned card its position, the position question and the meaning for its side', () => {
    const items = [itemFor(1, 'the-hermit', 'upright'), itemFor(3, 'the-hermit', 'reversed')];
    const markup = html(
      <ReadingMeanings items={items} locale="en" t={(key, params) => t('en', key, params)} />,
    );
    expect(markup).toContain('What the cards say');
    expect(markup).toContain('1 · Past');
    expect(markup).toContain('What shaped this');
    expect(markup).toContain('3 · Future');
    expect(markup).toContain('Where it leans');
    expect(markup).toContain('The Hermit');
    expect(markup).toContain('Upright');
    expect(markup).toContain('Reversed');

    const hermit = byId.get('the-hermit')!;
    expect(markup).toContain(hermit.meanings.upright.summary.en);
    expect(markup).toContain(hermit.meanings.reversed.summary.en);
    // Position 2 was not turned over, so it has no entry.
    expect(markup).not.toContain('2 · Present');
    expect(markup.match(/data-position="/g)).toHaveLength(2);
  });

  it('keeps the entries in the order it is given', () => {
    const items = [
      itemFor(1, 'the-fool', 'upright'),
      itemFor(2, 'the-magician', 'upright'),
      itemFor(3, 'the-sun', 'reversed'),
    ];
    const markup = html(
      <ReadingMeanings items={items} locale="en" t={(key, params) => t('en', key, params)} />,
    );
    expect(markup.indexOf('The Fool')).toBeLessThan(markup.indexOf('The Magician'));
    expect(markup.indexOf('The Magician')).toBeLessThan(markup.indexOf('The Sun'));
  });

  it('speaks Vietnamese: position, card name and meaning', () => {
    const markup = html(
      <ReadingMeanings
        items={[itemFor(2, 'the-hermit', 'reversed')]}
        locale="vi"
        t={(key, params) => t('vi', key, params)}
      />,
    );
    expect(markup).toContain('2 · Hiện tại');
    expect(markup).toContain('Bạn đang đứng ở đâu');
    expect(markup).toContain(byId.get('the-hermit')!.name.vi);
    expect(markup).toContain('Ngược');
    expect(markup).toContain(byId.get('the-hermit')!.meanings.reversed.summary.vi);
  });

  it('lists the keywords of the side that was drawn', () => {
    const hermit = byId.get('the-hermit')!;
    const markup = html(
      <ReadingMeanings
        items={[itemFor(1, 'the-hermit', 'reversed')]}
        locale="en"
        t={(key, params) => t('en', key, params)}
      />,
    );
    for (const keyword of hermit.meanings.reversed.keywords.en) expect(markup).toContain(keyword);
    for (const keyword of hermit.meanings.upright.keywords.en) {
      if (!hermit.meanings.reversed.keywords.en.includes(keyword)) {
        expect(markup).not.toContain(`>${keyword}<`);
      }
    }
  });
});
