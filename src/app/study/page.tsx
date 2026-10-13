import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Study' };

export default function Page() {
  return <PagePlaceholder title="Study" phase={4} />;
}
