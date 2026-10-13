import { defineConfig, devices } from '@playwright/test';

// Runs inside the e2e container: build once, serve the production build, test against it.
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
  },
});
