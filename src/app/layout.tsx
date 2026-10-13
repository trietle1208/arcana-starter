import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import type { ReduceMotion } from '@/domain/records';
import { AppShell } from '@/features/shell/AppShell';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { loadSettings } from '@/server/settings';
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

// DM Sans has no Vietnamese subset (accented letters fell back to the system font), so the sans
// face is Inter, which does.
const inter = Inter({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  axes: ['opsz'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Arcana', template: '%s · Arcana' },
  description: 'A quiet place to read the cards, study them and keep a journal.',
};

// The Reduce motion setting drives <html data-motion> (see globals.css): "On" always reduces,
// "Off" always plays, "System" follows the device.
const MOTION: Record<ReduceMotion, 'system' | 'reduce' | 'full'> = {
  system: 'system',
  on: 'reduce',
  off: 'full',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The language and motion settings live in SQLite and must be right on first paint, so every
  // page renders per request; nothing here may be prerendered at build time.
  await connection();
  const settings = loadSettings();
  return (
    <html
      lang={settings.locale}
      data-theme="paper"
      data-motion={MOTION[settings.reduceMotion]}
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body>
        <LocaleProvider locale={settings.locale}>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
