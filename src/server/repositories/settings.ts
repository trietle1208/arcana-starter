import 'server-only';
import { eq } from 'drizzle-orm';
import type { DbOrTx } from '@/server/db/client';
import { settings } from '@/server/db/schema';

// The single settings row (id = 1) holds the whole UserSettings object as JSON. Parsing it, with
// the defaults, is the use case's job: the repository only moves the text.

/** The stored JSON, or null when nothing has been saved yet. */
export function readSettingsJson(db: DbOrTx): string | null {
  const row = db.select({ data: settings.data }).from(settings).where(eq(settings.id, 1)).get();
  return row?.data ?? null;
}

export function writeSettingsJson(db: DbOrTx, data: string, now: Date): void {
  db.insert(settings)
    .values({ id: 1, data, updatedAt: now.getTime() })
    .onConflictDoUpdate({ target: settings.id, set: { data, updatedAt: now.getTime() } })
    .run();
}
