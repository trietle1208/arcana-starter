import type { Metadata } from 'next';
import { PagePlaceholder } from '@/features/shell/PagePlaceholder';

export const metadata: Metadata = { title: 'Home' };

export default function Page() {
  return <PagePlaceholder title="Home" phase={4} />;
}
