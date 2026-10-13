import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { openTempDb, type TempDb } from '@/server/db/testing';
import { fixedDeps, sampleReading } from '../testing';
import { saveReading } from './saveReading';

let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());
beforeEach(() => {
  temp.sqlite.exec('DROP TRIGGER IF EXISTS fail_entry; DELETE FROM readings;');
});

const count = (table: string) =>
  (temp.sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n;
const rows = () => [count('readings'), count('reading_cards'), count('journal_entries')];

describe('saveReading', () => {
  it('creates one reading, its cards and one entry', () => {
    const reading = sampleReading('three-card');
    const result = saveReading(
      temp.db,
      { reading, title: 'The Hermit', body: 'Notes', tags: ['Work', 'Calm'] },
      fixedDeps(),
    );
    expect(result.ok).toBe(true);
    expect(rows()).toEqual([1, 3, 1]);
    const entry = temp.sqlite.prepare('SELECT * FROM journal_entries').get() as Record<
      string,
      unknown
    >;
    expect(entry).toMatchObject({
      reading_id: reading.id,
      card_id: null,
      title: 'The Hermit',
      body: 'Notes',
      tags: '["Work","Calm"]',
    });
  });

  it('saves every spread: one card, three cards, Celtic Cross', () => {
    for (const [spreadId, cards] of [
      ['one-card', 1],
      ['three-card', 3],
      ['celtic-cross', 10],
    ] as const) {
      temp.sqlite.exec('DELETE FROM readings');
      expect(saveReading(temp.db, { reading: sampleReading(spreadId), title: 't' }).ok).toBe(true);
      expect(count('reading_cards')).toBe(cards);
    }
  });

  it('rolls everything back when the last write fails: zero rows', () => {
    temp.sqlite.exec(
      "CREATE TRIGGER fail_entry BEFORE INSERT ON journal_entries BEGIN SELECT RAISE(ABORT, 'boom'); END",
    );
    expect(() => saveReading(temp.db, { reading: sampleReading(), title: 't' })).toThrow(/boom/);
    expect(rows()).toEqual([0, 0, 0]);
  });

  it('saving the same reading twice keeps the first entry and writes nothing more', () => {
    const reading = sampleReading();
    const first = saveReading(temp.db, { reading, title: 'First' }, fixedDeps());
    const second = saveReading(temp.db, { reading, title: 'Second try' }, fixedDeps());
    if (!first.ok || !second.ok) throw new Error('save failed');
    expect(first.value.created).toBe(true);
    expect(second.value).toEqual({ ...first.value, created: false });
    expect(rows()).toEqual([1, 3, 1]);
  });

  describe('rejects, writing nothing,', () => {
    const reject = (reading: unknown, error: string, title = 'x') => {
      expect(saveReading(temp.db, { reading, title })).toMatchObject({ ok: false, error });
      expect(rows()).toEqual([0, 0, 0]);
    };

    it('a card id that is not in the deck', () => {
      const reading = sampleReading();
      reading.cards[1].cardId = 'the-dragon';
      reject(reading, 'unknown-card');
    });

    it('an unknown spread', () => {
      reject({ ...sampleReading(), spreadId: 'horseshoe' }, 'unknown-spread');
    });

    it('the same card twice', () => {
      const reading = sampleReading();
      reading.cards[2].cardId = reading.cards[0].cardId;
      reject(reading, 'duplicate-card');
    });

    it('the wrong number of cards, a wrong position key or an old spread version', () => {
      const short = sampleReading();
      short.cards.pop();
      reject(short, 'spread-mismatch');
      const renamed = sampleReading();
      renamed.cards[0].positionKey = 'future';
      reject(renamed, 'spread-mismatch');
      reject({ ...sampleReading(), spreadVersion: 2 }, 'spread-mismatch');
    });

    it('a malformed reading, and an empty title', () => {
      reject({ ...sampleReading(), id: 'not-a-uuid' }, 'invalid-input');
      reject('nonsense', 'invalid-input');
      expect(saveReading(temp.db, { reading: sampleReading(), title: '   ' })).toMatchObject({
        ok: false,
        error: 'invalid-input',
        field: 'title',
      });
      expect(rows()).toEqual([0, 0, 0]);
    });

    it('more tags than allowed, or an overlong one', () => {
      const reading = sampleReading();
      const tags = Array.from({ length: 9 }, (_, i) => `tag${i}`);
      expect(saveReading(temp.db, { reading, title: 't', tags })).toMatchObject({
        ok: false,
        field: 'tags',
      });
      expect(saveReading(temp.db, { reading, title: 't', tags: ['x'.repeat(25)] }).ok).toBe(false);
      expect(rows()).toEqual([0, 0, 0]);
    });
  });
});
