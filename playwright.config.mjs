import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4321', browserName: 'chromium' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4321', reuseExistingServer: false },
  reporter: [['list'], ['html', { open: 'never' }]],
});
