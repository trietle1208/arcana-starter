import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// Locks in the layer rules from docs/TECH_DESIGN.md §8: they must fail lint, not just be documented.
const eslint = new ESLint({ cwd: process.cwd() });

async function messagesFor(filePath: string, code: string) {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-imports');
}

describe('layer boundaries', () => {
  it.each([
    ['react', "import { useState } from 'react';"],
    ['next/*', "import Link from 'next/link';"],
    ['drizzle-orm', "import { eq } from 'drizzle-orm';"],
    ['better-sqlite3', "import Database from 'better-sqlite3';"],
    ['fs', "import { readFileSync } from 'node:fs';"],
    ['@/server/*', "import { env } from '@/server/env';"],
    ['@/components/*', "import { Button } from '@/components/ui/Button/Button';"],
  ])('src/domain may not import %s', async (_name, code) => {
    const messages = await messagesFor('src/domain/example.ts', `${code}\nexport {};\n`);
    expect(messages).toHaveLength(1);
  });

  it('src/domain may import its own modules', async () => {
    expect(
      await messagesFor('src/domain/example.ts', "import { x } from './other';\nexport { x };\n"),
    ).toHaveLength(0);
  });

  it('src/application may not import React', async () => {
    expect(
      await messagesFor(
        'src/application/example.ts',
        "import { useState } from 'react';\nexport { useState };\n",
      ),
    ).toHaveLength(1);
  });

  it('src/components/ui may not import server or application code', async () => {
    expect(
      await messagesFor(
        'src/components/ui/Example/Example.tsx',
        "import { env } from '@/server/env';\nexport { env };\n",
      ),
    ).toHaveLength(1);
    expect(
      await messagesFor(
        'src/components/ui/Example/Example.tsx',
        "import { x } from '@/application/x';\nexport { x };\n",
      ),
    ).toHaveLength(1);
  });
});
