import { exportBackup } from '@/application/backup/backup';
import { getDb } from '@/server/db/client';

// Never cached: a download must contain what is in the journal right now.
export const dynamic = 'force-dynamic';

/** GET /api/backup — downloads the whole journal, readings, study progress and settings as JSON. */
export function GET() {
  const now = new Date();
  const file = exportBackup(getDb(), { now: () => now });
  const day = now.toISOString().slice(0, 10);
  return new Response(`${JSON.stringify(file, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="arcana-backup-${day}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
