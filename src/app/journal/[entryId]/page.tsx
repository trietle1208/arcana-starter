import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getJournalEntry } from '@/application/journal/journal';
import { getReadingCardsFor } from '@/application/readings/readingCards';
import { EntryView } from '@/features/journal/EntryView';
import { getDb } from '@/server/db/client';
import { loadSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'Journal' };

export default async function Page({ params }: { params: Promise<{ entryId: string }> }) {
  await connection();
  const { entryId } = await params;
  const found = getJournalEntry(getDb(), entryId);
  if (!found) notFound();
  const { entry, reading } = found;
  const { interpretationDetail } = loadSettings();

  const ids = reading
    ? reading.cards.map((card) => card.cardId)
    : entry.cardId
      ? [entry.cardId]
      : [];
  return (
    <EntryView
      entry={entry}
      reading={reading}
      cards={getReadingCardsFor(ids, interpretationDetail)}
      detail={interpretationDetail}
    />
  );
}
