import type { Localized, SpreadPosition, TarotSpread } from '@/domain/tarot/types';

// Spreads are plain data: the engine uses only the number and order of the positions, the generic
// Spread renderer uses `layout`. Adding a spread means adding an object here.
//
// `layout` cells are 1-based: { col, row } on a grid of spread.grid.cols × spread.grid.rows. A row
// may end in .5 so one column can sit half a card lower than its neighbour: the Celtic Cross
// centres its cross against the four-card staff that way.

const text = (en: string, vi: string): Localized => ({ en, vi });

function position(
  key: string,
  name: Localized,
  prompt: Localized,
  layout: SpreadPosition['layout'],
): SpreadPosition {
  return { key, name, prompt, layout };
}

const ONE_CARD: TarotSpread = {
  id: 'one-card',
  version: 1,
  name: text('One card', 'Một lá'),
  description: text(
    'A single card to sit with, for a quiet moment or a small question.',
    'Một lá bài để ngồi lại cùng, cho một khoảnh khắc yên tĩnh hay một câu hỏi nhỏ.',
  ),
  grid: { cols: 1, rows: 1 },
  positions: [
    position(
      'card',
      text('Your card', 'Lá bài của bạn'),
      text('What to notice today', 'Điều đáng để ý hôm nay'),
      { col: 1, row: 1 },
    ),
  ],
};

const THREE_CARD: TarotSpread = {
  id: 'three-card',
  version: 1,
  name: text('Three cards', 'Ba lá'),
  description: text(
    'Past, present and future side by side: a way to see how a situation has moved.',
    'Quá khứ, hiện tại và tương lai cạnh nhau: một cách nhìn xem câu chuyện đã chuyển động ra sao.',
  ),
  grid: { cols: 3, rows: 1 },
  positions: [
    position(
      'past',
      text('Past', 'Quá khứ'),
      text('What shaped this', 'Điều đã hình thành nên chuyện này'),
      { col: 1, row: 1 },
    ),
    position(
      'present',
      text('Present', 'Hiện tại'),
      text('Where you stand', 'Bạn đang đứng ở đâu'),
      { col: 2, row: 1 },
    ),
    position(
      'future',
      text('Future', 'Tương lai'),
      text('Where it leans', 'Điều đang nghiêng về hướng nào'),
      { col: 3, row: 1 },
    ),
  ],
};

// Positions 1–6 form the cross (3 columns × 3 rows, centred on the staff), 7–10 the staff in
// column 4, read from the bottom up. Position 2 lies across position 1.
const CELTIC_CROSS: TarotSpread = {
  id: 'celtic-cross',
  version: 1,
  name: text('Celtic Cross', 'Chữ thập Celtic'),
  description: text(
    'Ten cards that look at one question from every side: the heart of it, what crosses it and where it may lead.',
    'Mười lá bài nhìn một câu hỏi từ mọi phía: trọng tâm của nó, điều cản đường và nơi nó có thể dẫn tới.',
  ),
  grid: { cols: 4, rows: 4 },
  positions: [
    position(
      'present',
      text('Present', 'Hiện tại'),
      text('The heart of the matter', 'Trọng tâm của vấn đề'),
      { col: 2, row: 2.5 },
    ),
    position(
      'challenge',
      text('Challenge', 'Thách thức'),
      text('What crosses you', 'Điều cản đường bạn'),
      { col: 2, row: 2.5, rotate: 90 },
    ),
    position(
      'foundation',
      text('Foundation', 'Nền tảng'),
      text('What lies beneath', 'Điều nằm bên dưới'),
      { col: 2, row: 3.5 },
    ),
    position(
      'recent-past',
      text('Recent past', 'Quá khứ gần'),
      text('What is passing', 'Điều đang qua đi'),
      { col: 1, row: 2.5 },
    ),
    position(
      'possibility',
      text('Possibility', 'Khả năng'),
      text('What could be', 'Điều có thể xảy ra'),
      { col: 2, row: 1.5 },
    ),
    position(
      'near-future',
      text('Near future', 'Tương lai gần'),
      text('What comes next', 'Điều sắp đến'),
      { col: 3, row: 2.5 },
    ),
    position('self', text('Self', 'Bản thân'), text('How you meet it', 'Cách bạn đối diện'), {
      col: 4,
      row: 4,
    }),
    position(
      'surroundings',
      text('Surroundings', 'Môi trường xung quanh'),
      text('People and places around you', 'Con người và nơi chốn quanh bạn'),
      { col: 4, row: 3 },
    ),
    position(
      'hopes-and-fears',
      text('Hopes and fears', 'Hy vọng và nỗi sợ'),
      text('What you carry', 'Điều bạn mang theo'),
      { col: 4, row: 2 },
    ),
    position(
      'outcome',
      text('Outcome', 'Kết quả'),
      text('Where this is heading', 'Điều này đang hướng về đâu'),
      { col: 4, row: 1 },
    ),
  ],
};

/** In the order the Reading Room offers them. */
export const SPREADS: readonly TarotSpread[] = [ONE_CARD, THREE_CARD, CELTIC_CROSS];
export const SPREAD_IDS: readonly string[] = SPREADS.map((spread) => spread.id);

const BY_ID: ReadonlyMap<string, TarotSpread> = new Map(
  SPREADS.map((spread) => [spread.id, spread]),
);

export function hasSpread(id: string): boolean {
  return BY_ID.has(id);
}

/** Throws on an unknown id: ids are permanent, so a miss is a bug or corrupt data. */
export function getSpread(id: string): TarotSpread {
  const spread = BY_ID.get(id);
  if (!spread) throw new Error(`Unknown spread id "${id}"`);
  return spread;
}
