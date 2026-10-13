import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openTempDb, type TempDb } from '@/server/db/testing';
import { createReflection, getJournalEntry, listJournalEntries } from './journal/journal';
import { saveReading } from './readings/saveReading';
import { getSettings, saveSettings } from './settings/settings';
import { fixedDeps, sampleReading } from './testing';

// "Survives a restart", as far as the database goes: write through the use cases, close the
// handle, open a new one on the same file, read the same data back.
let temp: TempDb;
beforeAll(() => {
  temp = openTempDb();
});
afterAll(() => temp.cleanup());

describe('persistence after reopening the file', () => {
  it('returns identical entries, readings, cards and settings', () => {
    const saved = saveReading(
      temp.db,
      {
        reading: sampleReading('celtic-cross', 21),
        title: 'Where is this heading?',
        body: 'Lots of pentacles.\nCalmer than expected.',
        prompt: 'What is the quiet asking of you?',
        tags: ['Work', 'Calm'],
      },
      fixedDeps(),
    );
    const reflection = createReflection(
      temp.db,
      { title: 'On stillness', cardId: 'the-hermit', tags: ['Calm'] },
      fixedDeps('2026-10-13T08:00:00.000Z'),
    );
    saveSettings(temp.db, { locale: 'vi', reduceMotion: 'on', includeReversed: false });
    if (!saved.ok || !reflection.ok) throw new Error('setup failed');

    const before = {
      detail: getJournalEntry(temp.db, saved.value.entryId),
      reflection: getJournalEntry(temp.db, reflection.value.entryId),
      list: listJournalEntries(temp.db),
      settings: getSettings(temp.db),
    };
    expect(before.detail?.reading?.cards).toHaveLength(10);

    const reopened = temp.reopen(); // the old handle is closed
    expect(temp.sqlite.open).toBe(false);
    const after = {
      detail: getJournalEntry(reopened.db, saved.value.entryId),
      reflection: getJournalEntry(reopened.db, reflection.value.entryId),
      list: listJournalEntries(reopened.db),
      settings: getSettings(reopened.db),
    };
    expect(after).toEqual(before);
    temp = reopened; // so afterAll cleans up the right handle
  });
});
