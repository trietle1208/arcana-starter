import { DEFAULT_DB_PATH } from '../../src/server/db/sqlite.ts';

/** The database file the db:* scripts work on: ARCANA_DB_PATH, like the app. */
export const dbPath: string = process.env.ARCANA_DB_PATH || DEFAULT_DB_PATH;
