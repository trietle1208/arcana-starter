import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getCard } from '@/content';
import { PLACEHOLDER } from '@/domain/tarot/placeholder';
import type { TarotCard } from '@/domain/tarot/types';
import { CardDetail } from './CardDetail';

const html = (card: TarotCard) => renderToStaticMarkup(<CardDetail card={card} />);

// Every card is written now, so a card that is still being written is made up here: the page must
// show a quiet note where its text would be, never the word "TODO".
function unfinished(): TarotCard {
  const card = structuredClone(getCard('cups-03'));
  const todo = { en: PLACEHOLDER, vi: PLACEHOLDER };
  card.intro = todo;
  card.symbolism = todo;
  card.keywords = { en: [PLACEHOLDER], vi: [PLACEHOLDER] };
  card.reflectionQuestions = { en: [PLACEHOLDER], vi: [PLACEHOLDER] };
  card.meanings.upright = { summary: todo, keywords: { en: [PLACEHOLDER], vi: [PLACEHOLDER] } };
  card.meanings.reversed = { summary: todo, keywords: { en: [PLACEHOLDER], vi: [PLACEHOLDER] } };
  return card;
}

describe('CardDetail', () => {
  it('shows a finished card with its name, meanings and a reflection to save', () => {
    const markup = html(getCard('the-hermit'));
    expect(markup).toContain('The Hermit');
    expect(markup).toContain('Reflect');
    expect(markup).toContain('Save to journal');
    expect(markup).not.toContain('still being written');
  });

  it('shows a quiet note, not "TODO", for a card that is still being written', () => {
    const markup = html(unfinished());
    expect(markup).toContain('Three of Cups');
    expect(markup).toContain('This part of the card is still being written.');
    expect(markup).not.toContain('TODO');
  });
});
