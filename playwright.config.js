import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  workers: 1,
  projects: [{ name: 'chromium', use: { browserName: 'chromium', viewport: { width: 600, height: 200 }, deviceScaleFactor: 1 } }],
});
