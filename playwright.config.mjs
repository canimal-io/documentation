import { defineConfig } from '@playwright/test';
import { FIXTURE_SITES } from './scripts/serve-fixture-sites.mjs';

// The default project runs everything against the real manifest. The fixture projects rerun the
// firmware page tests and the axe matrix against builds made from fixture manifests, so the page is
// checked with releases present even while the real manifest is empty.
const firmwareTests = /firmware|fixture release rows/;
export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4321', browserName: 'chromium' },
  projects: [
    { name: 'real', metadata: { manifest: 'src/data/firmware/can-usb.json' } },
    ...FIXTURE_SITES.map(s => ({
      name: s.name,
      grep: firmwareTests,
      metadata: { manifest: s.manifest },
      use: { baseURL: `http://127.0.0.1:${s.port}` },
    })),
  ],
  webServer: [
    { command: 'npm run preview', url: 'http://127.0.0.1:4321', reuseExistingServer: false },
    // Ready once the last fixture build is being served.
    { command: 'node scripts/serve-fixture-sites.mjs', url: `http://127.0.0.1:${FIXTURE_SITES.at(-1).port}/`, reuseExistingServer: false, timeout: 180000 },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
