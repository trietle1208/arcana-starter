import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_CARD_IDS, getCard, hasCard } from '@/content';
import { CardDetail } from '@/features/library/CardDetail';

// All 78 detail pages are generated at build time; any other id is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_CARD_IDS.map((cardId) => ({ cardId }));
}

type Props = { params: Promise<{ cardId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cardId } = await params;
  return hasCard(cardId) ? { title: getCard(cardId).name.en } : {};
}

export default async function Page({ params }: Props) {
  const { cardId } = await params;
  if (!hasCard(cardId)) notFound();
  return <CardDetail card={getCard(cardId)} />;
}
