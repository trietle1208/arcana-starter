import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';
import { e2eDataDir } from './e2e/support/paths';

// Runs inside the e2e container: build once, serve the production build, test against it.
//
// The tests never touch the real journal. Every run gets its own folder of throw-away databases:
// one for the shared server below, one for each server a test starts itself (e2e/stateful.spec.ts,
// which has to change settings and restart the server, so it cannot share).
const e2eData = e2eDataDir();

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    timeout: 240_000,
    reuseExistingServer: false,
    env: { ARCANA_DB_PATH: join(e2eData, 'shared', 'arcana.db') },
  },
});
