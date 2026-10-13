import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Settings' };

export default function Page() {
  return <PagePlaceholder title="Settings" phase={3} />;
}
