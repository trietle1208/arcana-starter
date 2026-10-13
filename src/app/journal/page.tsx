import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Journal' };

export default function Page() {
  return <PagePlaceholder title="Journal" phase={3} />;
}
