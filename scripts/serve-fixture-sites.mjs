// Builds the site once per fixture firmware manifest, then serves each build on its own port.
// Used only by playwright.config.mjs so the firmware page tests run against more than the real manifest.
// Builds run one after another because concurrent Astro builds share .astro and the Vite cache.
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const FIXTURE_SITES = [
  { name: 'fixture', manifest: 'tests/fixtures/firmware/can-usb.json', outDir: 'dist-fixture', port: 4322 },
  { name: 'dryrun', manifest: 'tests/fixtures/firmware/can-usb-dryrun.json', outDir: 'dist-dryrun', port: 4323 },
];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const site of FIXTURE_SITES) {
    execFileSync('npx', ['astro', 'build'], {
      stdio: 'inherit',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FIRMWARE_MANIFEST: site.manifest, ASTRO_OUT_DIR: site.outDir },
    });
  }
  for (const site of FIXTURE_SITES) {
    const root = path.resolve(site.outDir);
    createServer((req, res) => {
      let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!existsSync(file)) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
    }).listen(site.port, '127.0.0.1');
  }
}
