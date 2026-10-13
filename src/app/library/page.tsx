import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCardSummaries } from '@/application/cards/cardSummaries';
import { CardBrowser } from '@/features/library/CardBrowser';
import { LibraryFallback } from '@/features/library/LibraryTitles';

export const metadata: Metadata = { title: 'Card library' };

export default function Page() {
  const cards = getCardSummaries();
  return (
    // useSearchParams opts the browser out of prerendering up to this boundary.
    <Suspense fallback={<LibraryFallback total={cards.length} />}>
      <CardBrowser cards={cards} />
    </Suspense>
  );
}
