import 'server-only';
import { cache } from 'react';
import { getSettings } from '@/application/settings/settings';
import type { UserSettings } from '@/domain/records';
import { getDb } from '@/server/db/client';

/**
 * The reader's settings for this request. The root layout and the page both ask; `cache` makes it
 * one read. Callers must have called `await connection()` first so the page is never prerendered.
 */
export const loadSettings: () => UserSettings = cache(() => getSettings(getDb()));
