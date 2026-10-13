import type { Metadata } from 'next';
import { getReadingCards } from '@/application/readings/readingCards';
import { ReadingRoom } from '@/features/reading/ReadingRoom';

export const metadata: Metadata = { title: 'Reading room' };

export default function Page() {
  return <ReadingRoom cards={getReadingCards()} />;
}
