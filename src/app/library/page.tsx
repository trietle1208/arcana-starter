import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Card library' };

export default function Page() {
  return <PagePlaceholder title="Card library" phase={1} />;
}
