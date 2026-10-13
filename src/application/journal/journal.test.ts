import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { openTempDb, type TempDb } from '@/server/db/testing';
import { fixedDeps, sampleReading } from '../testing';
import { saveReading } from '../readings/saveReading';
import { collectTags, filterJournal } from './filters';
import {
  createReflection,
  deleteJournalEntry,
  getJournalEntry,
  listJournalEntries,
  restoreJournalEntry,
  updateJournalEntry,
} from './journal';

let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());
beforeEach(() => {
  temp.sqlite.exec('DELETE FROM readings; DELETE FROM journal_entries;');
});

const count = (table: string) =>
  (temp.sqlite.prepare(`SELECT count(*) AS n FROM ${table}`).get() as { n: number }).n;

function save(title = 'A quiet week', extra: Record<string, unknown> = {}, seed = 7) {
  const result = saveReading(
    temp.db,
    { reading: sampleReading('three-card', seed), title, ...extra },
    fixedDeps(),
  );
  if (!result.ok) throw new Error(`save failed: ${result.error}`);
  return result.value;
}

describe('getJournalEntry', () => {
  it('returns the entry with its reading, the cards in position order', () => {
    const { entryId } = save();
    const detail = getJournalEntry(temp.db, entryId)!;
    expect(detail.entry.title).toBe('A quiet week');
    expect(detail.reading?.spreadId).toBe('three-card');
    expect(detail.reading?.cards.map((card) => card.positionIndex)).toEqual([0, 1, 2]);
    expect(detail.reading?.cards.map((card) => card.positionKey)).toEqual([
      'past',
      'present',
      'future',
    ]);
  });

  it('returns null for an id that does not exist', () => {
    expect(getJournalEntry(temp.db, 'nope')).toBeNull();
  });
});

describe('listJournalEntries', () => {
  it('lists newest first, each with its spread and cards', () => {
    const older = fixedDeps('2026-10-01T10:00:00.000Z');
    const newer = fixedDeps('2026-10-09T10:00:00.000Z');
    const first = saveReading(
      temp.db,
      { reading: sampleReading('one-card', 3), title: 'Old' },
      older,
    );
    const second = saveReading(
      temp.db,
      { reading: sampleReading('three-card', 4), title: 'New' },
      {
        ...newer,
        newId: () => '22222222-2222-4222-8222-000000000001',
      },
    );
    expect(first.ok && second.ok).toBe(true);

    const items = listJournalEntries(temp.db);
    expect(items.map((item) => item.entry.title)).toEqual(['New', 'Old']);
    expect(items[0].spreadId).toBe('three-card');
    expect(items[0].cards).toHaveLength(3);
    expect(items[1].spreadId).toBe('one-card');
    expect(items[1].cards).toHaveLength(1);
  });

  it('shows a reflection about a card as that one card', () => {
    createReflection(temp.db, { title: 'Quiet', cardId: 'the-hermit' }, fixedDeps());
    createReflection(temp.db, { title: 'Nothing in particular' }, fixedDeps());
    const items = listJournalEntries(temp.db);
    const about = items.find((item) => item.entry.title === 'Quiet')!;
    expect(about.cards).toEqual([{ cardId: 'the-hermit', orientation: 'upright' }]);
    expect(about.spreadId).toBeNull();
    expect(items.find((item) => item.entry.title === 'Nothing in particular')!.cards).toEqual([]);
  });
});

describe('updateJournalEntry', () => {
  it('changes the title, note, tags and updated_at, nothing else', () => {
    const deps = fixedDeps();
    const { entryId } = save('Before', { body: 'old note', tags: ['Work'] });
    const before = getJournalEntry(temp.db, entryId)!;

    deps.advance(60_000);
    const updated = updateJournalEntry(
      temp.db,
      { id: entryId, title: 'After', body: 'new note', tags: ['Calm', 'Work'] },
      deps,
    );
    expect(updated.ok).toBe(true);

    const after = getJournalEntry(temp.db, entryId)!;
    expect(after.entry).toMatchObject({ title: 'After', body: 'new note', tags: ['Calm', 'Work'] });
    expect(after.entry.updatedAt.getTime()).toBe(deps.now().getTime());
    expect(after.entry.updatedAt.getTime()).toBeGreaterThan(before.entry.updatedAt.getTime());
    expect(after.entry.createdAt).toEqual(before.entry.createdAt);
    expect(after.entry.readingId).toBe(before.entry.readingId);
    expect(after.reading).toEqual(before.reading);
  });

  it('rejects an empty title and an unknown entry', () => {
    const { entryId } = save();
    expect(updateJournalEntry(temp.db, { id: entryId, title: '  ', body: '', tags: [] })).toEqual({
      ok: false,
      error: 'invalid-input',
      field: 'title',
    });
    expect(
      updateJournalEntry(temp.db, {
        id: '33333333-3333-4333-8333-333333333333',
        title: 'x',
        body: '',
        tags: [],
      }),
    ).toEqual({ ok: false, error: 'not-found' });
  });
});

describe('deleteJournalEntry', () => {
  it('removes the reading, its cards and the entry together', () => {
    const { entryId } = save();
    expect([count('readings'), count('reading_cards'), count('journal_entries')]).toEqual([
      1, 3, 1,
    ]);
    const result = deleteJournalEntry(temp.db, entryId);
    expect(result.ok).toBe(true);
    expect([count('readings'), count('reading_cards'), count('journal_entries')]).toEqual([
      0, 0, 0,
    ]);
  });

  it('removes only the entry of a free reflection', () => {
    save('Keep this reading');
    const reflection = createReflection(temp.db, { title: 'Free' }, fixedDeps());
    if (!reflection.ok) throw new Error('reflection failed');
    deleteJournalEntry(temp.db, reflection.value.entryId);
    expect([count('readings'), count('reading_cards'), count('journal_entries')]).toEqual([
      1, 3, 1,
    ]);
  });

  it('says not-found for an entry that is already gone', () => {
    expect(deleteJournalEntry(temp.db, 'nope')).toEqual({ ok: false, error: 'not-found' });
  });

  it('can be undone: restoring the snapshot brings back the same entry, reading and cards', () => {
    const { entryId } = save('Worth keeping', { body: 'a note', tags: ['Calm'] });
    const before = getJournalEntry(temp.db, entryId)!;
    const deleted = deleteJournalEntry(temp.db, entryId);
    if (!deleted.ok) throw new Error('delete failed');
    expect(getJournalEntry(temp.db, entryId)).toBeNull();

    const restored = restoreJournalEntry(temp.db, deleted.value);
    expect(restored).toEqual({ ok: true, value: { entryId } });
    expect(getJournalEntry(temp.db, entryId)).toEqual(before);
  });

  it('can restore a free reflection too, and refuses a snapshot that does not add up', () => {
    const made = createReflection(temp.db, { title: 'Free', cardId: 'the-sun' }, fixedDeps());
    if (!made.ok) throw new Error('reflection failed');
    const before = getJournalEntry(temp.db, made.value.entryId)!;
    const deleted = deleteJournalEntry(temp.db, made.value.entryId);
    if (!deleted.ok) throw new Error('delete failed');
    expect(restoreJournalEntry(temp.db, deleted.value).ok).toBe(true);
    expect(getJournalEntry(temp.db, made.value.entryId)).toEqual(before);

    expect(
      restoreJournalEntry(temp.db, {
        entry: { ...deleted.value.entry, readingId: '44444444-4444-4444-8444-444444444444' },
        reading: null,
      }),
    ).toEqual({ ok: false, error: 'invalid-input' });
  });
});

describe('createReflection', () => {
  it('writes an entry with no reading, about a card when one is named', () => {
    const result = createReflection(
      temp.db,
      {
        title: 'On stillness',
        body: 'text',
        prompt: 'When did time alone last give you an answer?',
        tags: ['Calm'],
        cardId: 'the-hermit',
      },
      fixedDeps(),
    );
    if (!result.ok) throw new Error('reflection failed');
    const { entry, reading } = getJournalEntry(temp.db, result.value.entryId)!;
    expect(reading).toBeNull();
    expect(entry).toMatchObject({
      readingId: null,
      cardId: 'the-hermit',
      prompt: 'When did time alone last give you an answer?',
      tags: ['Calm'],
    });
    expect([count('readings'), count('journal_entries')]).toEqual([0, 1]);
  });

  it('rejects a card that is not in the deck', () => {
    expect(createReflection(temp.db, { title: 'x', cardId: 'the-dragon' })).toEqual({
      ok: false,
      error: 'unknown-card',
    });
    expect(count('journal_entries')).toBe(0);
  });
});

describe('filters', () => {
  it('splits readings from reflections, and filters by tag ignoring case', () => {
    save('Reading one', { tags: ['Work', 'Calm'] }, 1);
    save('Reading two', { tags: ['Friends'] }, 2);
    createReflection(temp.db, { title: 'Reflection', tags: ['work'] }, fixedDeps());
    const items = listJournalEntries(temp.db);
    const titles = (list: typeof items) => list.map((item) => item.entry.title).sort();

    expect(titles(filterJournal(items, {}))).toHaveLength(3);
    expect(titles(filterJournal(items, { type: 'readings' }))).toEqual([
      'Reading one',
      'Reading two',
    ]);
    expect(titles(filterJournal(items, { type: 'reflections' }))).toEqual(['Reflection']);
    expect(titles(filterJournal(items, { tag: 'WORK' }))).toEqual(['Reading one', 'Reflection']);
    expect(titles(filterJournal(items, { type: 'readings', tag: 'work' }))).toEqual([
      'Reading one',
    ]);
    // 'Work' and 'work' are one tag; it is shown as spelled on the newest entry that has it.
    expect(collectTags(items).map(({ tag, count }) => [tag.toLowerCase(), count])).toEqual([
      ['work', 2],
      ['calm', 1],
      ['friends', 1],
    ]);
  });
});
