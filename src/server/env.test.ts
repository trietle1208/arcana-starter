import { describe, expect, it } from 'vitest';
import { parseEnv } from './env';

describe('parseEnv', () => {
  it('works with nothing set', () => {
    expect(parseEnv({})).toEqual({ ARCANA_DB_PATH: './data/arcana.db' });
  });

  it('reads the database path', () => {
    expect(parseEnv({ ARCANA_DB_PATH: '/tmp/test.db' }).ARCANA_DB_PATH).toBe('/tmp/test.db');
  });

  it('fails with a clear message on an empty path', () => {
    expect(() => parseEnv({ ARCANA_DB_PATH: '' })).toThrow(/Invalid environment: ARCANA_DB_PATH/);
  });
});
