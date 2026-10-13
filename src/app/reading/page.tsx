import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getReadingCards } from '@/application/readings/readingCards';
import { ReadingRoom } from '@/features/reading/ReadingRoom';
import { loadSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'Reading room' };

export default async function Page() {
  await connection();
  const { includeReversed, revealOneByOne, defaultSpreadId, interpretationDetail } = loadSettings();
  return (
    <ReadingRoom
      cards={getReadingCards(interpretationDetail)}
      settings={{ includeReversed, revealOneByOne, defaultSpreadId, interpretationDetail }}
    />
  );
}
