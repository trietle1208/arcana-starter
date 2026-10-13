import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Layer boundaries from docs/TECH_DESIGN.md §8. Time and randomness are injected into the domain.
const domainBans = [
  {
    group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    message: 'src/domain must not import React.',
  },
  { group: ['next', 'next/*'], message: 'src/domain must not import Next.js.' },
  {
    group: ['drizzle-orm', 'drizzle-orm/*', 'better-sqlite3'],
    message: 'src/domain must not import the database.',
  },
  {
    group: ['fs', 'node:fs', 'fs/*', 'node:fs/*'],
    message: 'src/domain must not touch the file system.',
  },
  { group: ['@/server', '@/server/*'], message: 'src/domain must not import server code.' },
  { group: ['@/components', '@/components/*'], message: 'src/domain must not import components.' },
  {
    group: ['@/application', '@/application/*', '@/features', '@/features/*', '@/app', '@/app/*'],
    message: 'src/domain is the innermost layer.',
  },
];

const applicationBans = [
  {
    group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    message: 'src/application must not import React.',
  },
  {
    group: [
      'next/link',
      'next/image',
      'next/navigation',
      'next/font',
      'next/font/*',
      'next/script',
      'next/head',
    ],
    message: 'src/application must not import Next.js UI modules.',
  },
  {
    group: ['@/components', '@/components/*', '@/features', '@/features/*', '@/app', '@/app/*'],
    message: 'src/application must not import presentation code.',
  },
];

const uiBans = [
  {
    group: ['@/server', '@/server/*', '@/application', '@/application/*'],
    message: 'src/components/ui is presentation only: no server or application imports.',
  },
];

const ban = (patterns) => ({ 'no-restricted-imports': ['error', { patterns }] });

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ['src/domain/**/*.{ts,tsx}'], rules: ban(domainBans) },
  { files: ['src/application/**/*.{ts,tsx}'], rules: ban(applicationBans) },
  { files: ['src/components/ui/**/*.{ts,tsx}'], rules: ban(uiBans) },
  globalIgnores([
    '.next/**',
    '.next-e2e/**',
    '.pnpm-store/**',
    'out/**',
    'next-env.d.ts',
    'design-system/**',
    'assets/**',
    'test-results/**',
    'playwright-report/**',
  ]),
]);
