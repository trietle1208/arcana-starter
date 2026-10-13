import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Reading room' };

export default function Page() {
  return <PagePlaceholder title="Reading room" phase={2} />;
}
