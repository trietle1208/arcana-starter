import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getCard, hasCard } from '@/content';
import { NewEntryForm } from '@/features/journal/NewEntryForm';
import { loadSettings } from '@/server/settings';

export const metadata: Metadata = { title: 'New entry' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** `?card=the-hermit&prompt=…` start a reflection about a card, with the question it answers. */
export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { locale } = loadSettings();
  const params = await searchParams;
  const cardId = one(params.card);
  const card = cardId && hasCard(cardId) ? getCard(cardId) : null;
  const prompt = one(params.prompt)?.trim().slice(0, 280) || null;
  return (
    <NewEntryForm card={card ? { id: card.id, name: card.name[locale] } : null} prompt={prompt} />
  );
}
