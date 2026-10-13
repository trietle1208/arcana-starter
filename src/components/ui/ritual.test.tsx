import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SPREADS } from '@/content/spreads';
import { CardFan } from './CardFan/CardFan';
import { NightSky } from './NightSky/NightSky';
import { Notice } from './Notice/Notice';
import { ReadingRitual, type RitualCard } from './ReadingRitual/ReadingRitual';
import { ShuffleDeck } from './ShuffleDeck/ShuffleDeck';
import { Spread, type SpreadCardView } from './Spread/Spread';
import { fill } from './_shared/format';

// Markup only: roles, names, states and where each card is placed. The motion (the riffle, the
// flight, the turn) and the keyboard are covered by the Playwright walk in e2e/reading.spec.ts.
const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const count = (markup: string, pattern: RegExp) => markup.match(pattern)?.length ?? 0;

/** A spread in the shape the components take: names and prompts already in one language. */
const viewOf = (spread: (typeof SPREADS)[number]) => ({
  positions: spread.positions.map((position) => ({
    name: position.name.en,
    prompt: position.prompt.en,
    layout: position.layout,
  })),
  grid: spread.grid,
});

const cardsFor = (n: number): RitualCard[] =>
  Array.from({ length: n }, (_, i) => ({
    src: '/cards/09-the-hermit.webp',
    name: `Card ${i + 1}`,
    reversed: i % 2 === 1,
  }));

describe('fill', () => {
  it('replaces the placeholders it has a value for and leaves the others', () => {
    expect(fill('Pile {n} of {total}', { n: 2 })).toBe('Pile 2 of {total}');
    expect(fill('Choose card {n} of {total}', { n: 7, total: 21 })).toBe('Choose card 7 of 21');
  });
});

describe('NightSky', () => {
  it('is a labelled night surface, so focus rings turn gold inside it', () => {
    const markup = html(<NightSky label="Reading table">Hello</NightSky>);
    expect(markup).toMatch(/^<section/);
    expect(markup).toContain('aria-label="Reading table"');
    expect(markup).toContain('data-surface="night"');
    expect(markup).toContain('Hello');
  });

  it('scatters the same stars for the same seed, and as many as asked', () => {
    const a = html(<NightSky stars={20} seed={5} />);
    expect(html(<NightSky stars={20} seed={5} />)).toBe(a);
    expect(html(<NightSky stars={20} seed={6} />)).not.toBe(a);
    // Every star is a span or an svg inside the hidden sky.
    expect(count(a, /<span class="[^"]*star[^"]*"/g) + count(a, /<svg/g)).toBe(20);
  });

  it('keeps the stars out of the accessibility tree', () => {
    expect(html(<NightSky />)).toContain('aria-hidden="true"');
  });
});

describe('Notice', () => {
  it('is a status region with the title, the body and one action', () => {
    const markup = html(
      <Notice tone="info" title="3 cards drawn" action={<button type="button">Open</button>}>
        Turn them over.
      </Notice>,
    );
    expect(markup).toContain('role="status"');
    expect(markup).toContain('3 cards drawn');
    expect(markup).toContain('Turn them over.');
    expect(markup).toContain('>Open<');
  });

  it('shows a check for success and an info mark for info', () => {
    const check = 'd="M5 12.5l4.2 4L19 7"';
    expect(html(<Notice title="Saved" />)).toContain(check);
    expect(html(<Notice tone="info" title="Drawn" />)).not.toContain(check);
    expect(html(<Notice tone="info" title="Drawn" />)).toContain('M12 11v5');
  });
});

describe('ShuffleDeck', () => {
  it('names the deck at rest and while it is shuffled, with dust only then', () => {
    const resting = html(<ShuffleDeck />);
    const shuffling = html(<ShuffleDeck shuffling />);
    expect(resting).toContain('aria-label="A shuffled deck, face down"');
    expect(resting).not.toContain('<i ');
    expect(shuffling).toContain('aria-label="The deck is being shuffled"');
    expect(count(shuffling, /<i /g)).toBe(10);
  });

  it('draws the number of cards it is given, from the labels it is given', () => {
    const markup = html(<ShuffleDeck count={5} labels={{ resting: 'Bộ bài đã xáo' }} />);
    expect(count(markup, /<svg/g)).toBe(5);
    expect(markup).toContain('aria-label="Bộ bài đã xáo"');
  });
});

describe('CardFan', () => {
  it('is a labelled group of 21 buttons, each named by its place in the fan', () => {
    const markup = html(<CardFan />);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Choose from the fanned deck"');
    expect(count(markup, /<button/g)).toBe(21);
    expect(markup).toContain('aria-label="Choose card 1 of 21"');
    expect(markup).toContain('aria-label="Choose card 21 of 21"');
  });

  it('spreads the cards evenly over the arc, 80° by default', () => {
    const markup = html(<CardFan count={3} />);
    expect(markup).toContain('--a:-40deg');
    expect(markup).toContain('--a:0deg');
    expect(markup).toContain('--a:40deg');
  });

  it('disables the cards already taken, and all of them while one flies', () => {
    const taken = html(<CardFan count={5} taken={[1, 3]} />);
    expect(count(taken, /disabled=""/g)).toBe(2);
    expect(html(<CardFan count={5} disabled />).match(/disabled=""/g)).toHaveLength(5);
  });

  it('takes its words from the labels it is given', () => {
    const markup = html(
      <CardFan
        count={2}
        labels={{ group: 'Chọn từ quạt bài', card: 'Chọn lá {n} trên {total}' }}
      />,
    );
    expect(markup).toContain('aria-label="Chọn từ quạt bài"');
    expect(markup).toContain('aria-label="Chọn lá 2 trên 2"');
  });
});

describe('Spread', () => {
  describe.each(SPREADS.map((spread) => [spread.id, spread] as const))('%s', (_id, spread) => {
    const n = spread.positions.length;
    const view = viewOf(spread);

    it(`places ${n} position(s), empty until a card is dealt`, () => {
      const markup = html(<Spread {...view} />);
      expect(count(markup, /data-slot="/g)).toBe(n);
      expect(count(markup, /data-state="empty"/g)).toBe(n);
      expect(markup).not.toContain('data-state="up"');
    });

    it(`places ${n} card(s) face up, or face down with one turn button each`, () => {
      const cards: SpreadCardView[] = cardsFor(n);
      const up = html(<Spread {...view} cards={cards} />);
      expect(count(up, /data-state="up"/g)).toBe(n);
      expect(up).not.toContain('<button');

      const down = html(
        <Spread
          {...view}
          cards={cards.map((card) => ({ ...card, revealed: false }))}
          onCardClick={() => {}}
        />,
      );
      expect(count(down, /data-state="down"/g)).toBe(n);
      expect(count(down, /<button/g)).toBe(n);
    });

    it('numbers every position, in draw order', () => {
      const markup = html(<Spread {...view} />);
      for (let i = 1; i <= n; i++) expect(markup).toContain(`data-slot="${i}"`);
      expect(markup).not.toContain(`data-slot="${n + 1}"`);
    });
  });

  it('prints the position and its question under each card of a short spread', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(<Spread {...view} />);
    expect(markup).toContain('1 · What shaped this');
    expect(markup).toContain('>Past<');
    expect(markup).toContain('>Future<');
    expect(markup).not.toContain('<ol');
  });

  it('gives the Celtic Cross a numbered legend instead, with the card once it is turned', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'celtic-cross')!);
    const empty = html(<Spread {...view} />);
    expect(empty).toContain('<ol');
    expect(empty).toContain('aria-label="Positions"');
    expect(count(empty, /<li/g)).toBe(10);
    expect(empty).toContain('The heart of the matter');

    const cards = cardsFor(10);
    const turned = html(<Spread {...view} cards={cards} />);
    expect(turned).toContain('Card 2 · reversed');
    expect(turned).not.toContain('The heart of the matter');
    expect(html(<Spread {...view} cards={cards} legend={false} />)).not.toContain('<ol');
  });

  it('lays each card on the cell its position asks for, and the crossing card across', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'celtic-cross')!);
    const markup = html(<Spread {...view} />);
    // Position 1 sits in column 2, half a row below row 2: rows 4–5 of the half-row grid.
    expect(markup).toMatch(/data-slot="1"/);
    expect(markup).toMatch(/style="grid-column:2;grid-row:4 \/ span 2"[^>]*data-slot="1"/);
    // Position 2 shares the cell of position 1 and lies across it.
    expect(markup).toMatch(
      /class="[^"]*rotated[^"]*" style="grid-column:2;grid-row:4 \/ span 2"[^>]*data-slot="2"/,
    );
    // The staff is in column 4, position 10 at the top.
    expect(markup).toMatch(/style="grid-column:4;grid-row:1 \/ span 2"[^>]*data-slot="10"/);
    expect(markup).toMatch(/style="grid-column:4;grid-row:7 \/ span 2"[^>]*data-slot="7"/);
  });

  it('uses a plain row for whole-number rows', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(<Spread {...view} />);
    expect(markup).toMatch(/style="grid-column:3;grid-row:1"[^>]*data-slot="3"/);
  });

  it('names a face-down card by its position, and says how to turn it', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const cards = cardsFor(3).map((card) => ({ ...card, revealed: false }));
    const waiting = html(<Spread {...view} cards={cards} onCardClick={() => {}} />);
    expect(waiting).toContain('aria-label="Position 2, Present — select to turn over"');
    const still = html(<Spread {...view} cards={cards} />);
    expect(still).toContain('aria-label="Position 2, Present: face down"');
    expect(still).not.toContain('<button');
  });

  it('takes its words from the labels it is given', () => {
    const view = viewOf(SPREADS.find((spread) => spread.id === 'celtic-cross')!);
    const markup = html(
      <Spread
        {...view}
        cards={cardsFor(10).map((card) => ({ ...card, revealed: false }))}
        onCardClick={() => {}}
        labels={{ turnOver: 'Vị trí {n}, {name} — chọn để lật', legend: 'Các vị trí' }}
      />,
    );
    expect(markup).toContain('aria-label="Vị trí 1, Present — chọn để lật"');
    expect(markup).toContain('aria-label="Các vị trí"');
  });
});

describe('ReadingRitual', () => {
  describe.each(SPREADS.map((spread) => [spread.id, spread] as const))('%s', (_id, spread) => {
    const n = spread.positions.length;
    const view = viewOf(spread);

    it(`starts with ${n} empty position(s) and a button to shuffle`, () => {
      const markup = html(<ReadingRitual {...view} cards={[]} />);
      expect(count(markup, /data-state="empty"/g)).toBe(n);
      expect(markup).toContain('data-step="idle"');
      expect(markup).toContain('Hold your question in mind, then shuffle the deck.');
      expect(markup).toContain('Shuffle the deck');
      expect(markup).toContain('aria-label="A shuffled deck, face down"');
    });

    it(`places ${n} card(s) for the ${n} position(s), face down and ready to turn`, () => {
      const markup = html(<ReadingRitual {...view} cards={cardsFor(n)} initialStep="reveal" />);
      expect(count(markup, /data-state="down"/g)).toBe(n);
      expect(count(markup, /data-state="empty"/g)).toBe(0);
      expect(count(markup, /aria-label="Position \d+, [^"]*select to turn over"/g)).toBe(n);
      expect(markup).toContain('Turn each card over when you are ready.');
      expect(markup).toContain('aria-live="polite"');
    });

    it(`shows all ${n} card(s) turned, with the actions, when it is done`, () => {
      const markup = html(
        <ReadingRitual
          {...view}
          cards={cardsFor(n)}
          initialStep="done"
          saveDisabled
          saveDescribedBy="why"
        />,
      );
      expect(count(markup, /data-state="up"/g)).toBe(n);
      expect(markup).toContain(n === 1 ? 'Your card is revealed.' : `All ${n} cards are revealed.`);
      expect(markup).toContain('Shuffle again');
      expect(markup).toMatch(
        /<button[^>]*disabled=""[^>]*aria-describedby="why"[^>]*>.*Save reading/,
      );
    });
  });

  it('asks for as many cards as the spread has positions, counting the ones chosen', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(<ReadingRitual {...three} cards={[]} initialStep="fan" />);
    expect(markup).toContain('Choose 3 cards from the fan · 0 of 3 chosen');
    expect(count(markup, /aria-label="Choose card \d+ of 21"/g)).toBe(21);

    const one = viewOf(SPREADS.find((spread) => spread.id === 'one-card')!);
    expect(html(<ReadingRitual {...one} cards={[]} initialStep="fan" />)).toContain(
      'Choose 1 card from the fan · 0 of 1 chosen',
    );
  });

  it('turns the cards by itself with revealMode="all": nothing to press, and it says so', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(
      <ReadingRitual {...three} cards={cardsFor(3)} initialStep="reveal" revealMode="all" />,
    );
    expect(count(markup, /data-state="down"/g)).toBe(3);
    expect(count(markup, /select to turn over/g)).toBe(0);
    expect(markup).toContain('The cards are turning over.');
    expect(markup).not.toContain('Turn each card over when you are ready.');
  });

  it('offers three labelled piles to cut', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(<ReadingRitual {...three} cards={[]} initialStep="cut" />);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Choose a pile"');
    for (const pile of [1, 2, 3]) expect(markup).toContain(`aria-label="Pile ${pile}"`);
    expect(markup).toContain('Cut the deck: choose one of the three piles.');
  });

  it('is a labelled night region, with no heading unless it is given a question', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const plain = html(<ReadingRitual {...three} cards={[]} />);
    expect(plain).toContain('aria-label="Reading table"');
    expect(plain).toContain('data-surface="night"');
    expect(plain).not.toContain('<h2');
    expect(html(<ReadingRitual {...three} cards={[]} question="What next?" />)).toContain('<h2');
  });

  it('names each card under its position only once it is turned', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const waiting = html(<ReadingRitual {...three} cards={cardsFor(3)} initialStep="reveal" />);
    expect(waiting).not.toContain('Card 1');
    const done = html(<ReadingRitual {...three} cards={cardsFor(3)} initialStep="done" />);
    expect(done).toContain('Card 1');
    expect(done).toContain('Card 2 · reversed');
  });

  it('takes its words from the labels it is given', () => {
    const three = viewOf(SPREADS.find((spread) => spread.id === 'three-card')!);
    const markup = html(
      <ReadingRitual
        {...three}
        cards={[]}
        labels={{
          idle: 'Hãy giữ câu hỏi trong tâm trí.',
          shuffle: 'Xáo bài',
          region: 'Bàn trải bài',
        }}
      />,
    );
    expect(markup).toContain('Hãy giữ câu hỏi trong tâm trí.');
    expect(markup).toContain('Xáo bài');
    expect(markup).toContain('aria-label="Bàn trải bài"');
  });
});
