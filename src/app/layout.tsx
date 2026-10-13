import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppShell } from '@/features/shell/AppShell';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import '@/styles/tokens.css';
import '@/styles/globals.css';

// Self-hosted at build time. tokens.css maps these to --font-display / --font-sans.
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Arcana', template: '%s · Arcana' },
  description: 'A quiet place to read the cards, study them and keep a journal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="paper"
      data-motion="system"
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      <body>
        <LocaleProvider>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
