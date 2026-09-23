import { defineConfig } from '@playwright/test';

const port = 4410;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: { command: `npx astro preview --host 127.0.0.1 --port ${port}`, url: `http://127.0.0.1:${port}/en/`, reuseExistingServer: false },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
