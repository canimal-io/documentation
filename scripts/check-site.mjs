import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import path from 'node:path';
import { validateEntry, selectReleases, compareVersions, validDate, isFixtureManifestPath, isFixtureOutDir } from '../src/lib/firmware.mjs';
const read = p => readFileSync(p, 'utf8');
const hash = b => createHash('sha256').update(b).digest('hex');
const baseline = JSON.parse(read('review/content-baseline.json'));
for (const [name, data] of Object.entries(baseline.pages)) {
  const body = read(`src/content/docs/${name}`).split('---').slice(2).join('---');
  assert.equal(hash(body), data.bodySha256, `Prose changed: ${name}; review deliberately before updating baseline`);
}
for (const [name, digest] of Object.entries(baseline.assets)) {
  assert.equal(hash(readFileSync(`public/${name}`)), digest, `Source asset changed: ${name}`);
  assert.equal(hash(readFileSync(`dist/${name}`)), digest, `Built asset changed: ${name}`);
}
assert.equal(read('CNAME'), read('public/CNAME'));
assert.equal(read('CNAME'), read('dist/CNAME'));
assert.equal(read('dist/CNAME').trim(), 'docs.canimal.io');
const routes = ['/', '/products/can_to_usb/can_to_usb_specs/', '/products/can_to_usb/can_to_usb_guide/', '/products/can_to_usb/firmware/'];
for (const route of routes) {
  const $ = load(read(`dist${route}index.html`));
  assert.equal($('link[rel="canonical"]').attr('href'), `https://docs.canimal.io${route}`);
  assert.equal($('h1').length, 1, `One page heading: ${route}`);
  assert.equal($('main').length, 1);
  assert.ok($('meta[name="description"]').attr('content'));
  assert.ok($('html').attr('lang'));
  $('img').each((_, e) => assert.ok($(e).attr('alt') !== undefined, `Missing alt: ${route}`));
}
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
let checked = 0;
for (const file of walk('dist').filter(p => p.endsWith('.html'))) {
  const $ = load(read(file));
  const pagePath = '/' + file.slice(5).replace(/index\.html$/, '');
  for (const e of $('a[href],img[src],script[src],link[href]').toArray()) {
    const raw = $(e).attr('href') ?? $(e).attr('src');
    const url = new URL(raw, `https://docs.canimal.io${pagePath}`);
    if (url.origin !== 'https://docs.canimal.io') continue;
    let target = 'dist' + decodeURIComponent(url.pathname);
    if (target.endsWith('/')) target += 'index.html';
    assert.ok(existsSync(target), `Broken internal URL ${raw} in ${file}`);
    if (url.hash && target.endsWith('.html')) {
      const doc = load(read(target));
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(doc('[id]').toArray().some(el => doc(el).attr('id') === id), `Broken anchor ${raw} in ${file}`);
    }
    checked++;
  }
}
const guide = read('dist/products/can_to_usb/can_to_usb_guide/index.html');
assert.ok(!load(guide)('pre').text().includes('termination on'));
assert.ok(guide.includes('termination 120') && guide.includes('termination 0'));
assert.ok(guide.includes('remain unverified'));
assert.ok(existsSync('dist/404.html'));
assert.ok(existsSync('dist/pagefind/pagefind.js'));
console.log(`PASS: preserved prose/assets, 4 routes, CNAME/canonicals, landmarks, ${checked} internal links/assets/anchors, CSI-18, 404, local search`);

// Parse the workflow so accidental trigger/permission widening fails a normal PR check.
const { load: yaml } = await import('js-yaml');
const workflow = yaml(read('.github/workflows/docs.yml'));
assert.ok('pull_request' in workflow.on);
assert.ok(!('pull_request_target' in workflow.on));
assert.deepEqual(workflow.permissions, { contents: 'read' });
assert.equal(workflow.jobs.check.permissions, undefined);
assert.equal(workflow.jobs.deploy.if, "github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main' && inputs.deploy == true");
assert.equal(workflow.jobs.deploy.needs, 'check');
assert.equal(workflow.jobs.deploy.environment.name, 'github-pages');
assert.equal(workflow.on.workflow_dispatch.inputs.deploy.default, false);
for (const step of workflow.jobs.check.steps) assert.ok(!/deploy-pages|configure-pages|upload-pages-artifact/.test(step.uses ?? ''));
for (const job of Object.values(workflow.jobs)) for (const step of job.steps) if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
assert.equal(load(read('dist/404.html'))('meta[name="robots"]').attr('content'), 'noindex');
const specs = load(read('dist/products/can_to_usb/can_to_usb_specs/index.html'));
assert.ok(specs('main').text().includes('< 42 μs'));
assert.equal(specs('main a[href="https://canimal.io/products"]').text(), 'Canimal CAN-USB Transceiver');
assert.equal(specs('a[href*="/product/canimal-can-usb"]').length, 0, 'No legacy product links');
console.log('PASS: parsed workflow deployment isolation, action pins, 404 noindex and rendered specification text');

for (const [name, data] of Object.entries(baseline.pages)) {
  const route = /^index\.mdx?$/.test(name) ? '' : name.replace(/\.mdx?$/, '') + '/';
  const $ = load(read(`dist/${route}index.html`));
  const ids = new Set($('[id]').toArray().map(e => $(e).attr('id')));
  for (const id of data.legacyHeadingIds) assert.ok(ids.has(id), `Lost legacy heading anchor: ${name}#${id}`);
}
console.log('PASS: all legacy content heading anchors retained');

const { execFileSync } = await import('node:child_process');
execFileSync(process.execPath, ['scripts/license-notices.mjs', '--check']);
console.log('PASS: third-party notices match installed framework/client licenses');

// Firmware manifest: every entry's file exists and its size and SHA-256 match.
function checkManifest(manifest, publicDir) {
  assert.equal(manifest.product, 'can-usb');
  assert.ok(Array.isArray(manifest.releases));
  const seen = new Set();
  for (const r of manifest.releases) {
    assert.deepEqual(validateEntry(r), [], `Invalid manifest entry ${r.version}`);
    assert.ok(!seen.has(r.version), `Duplicate version ${r.version}`);
    seen.add(r.version);
    // validateEntry confines file and notes to /firmware/can-usb/<version>/ (no "..").
    const file = publicDir + r.file;
    assert.ok(existsSync(file), `Missing firmware file ${file}`);
    assert.ok(existsSync(publicDir + r.notes), `Missing release notes ${r.notes}`);
    const bytes = readFileSync(file);
    assert.equal(bytes.length, r.size, `Size mismatch: ${r.file}`);
    assert.equal(hash(bytes), r.sha256, `SHA-256 mismatch: ${r.file}`);
  }
}
const manifest = JSON.parse(read('src/data/firmware/can-usb.json'));
checkManifest(manifest, 'public');
const fixture = JSON.parse(read('tests/fixtures/firmware/can-usb.json'));
checkManifest(fixture, 'tests/fixtures/firmware/public');
assert.ok(fixture.releases.every(r => r.hw_revisions && r.min_bootloader));
const picked = selectReleases(fixture);
assert.equal(picked.latest.version, '9.9.9', 'Latest stable release is not the newest stable version');
assert.deepEqual(picked.older.map(r => r.version), ['10.0.0-rc1', '9.9.8']);
// A tampered fixture must fail.
assert.throws(() => checkManifest({ ...fixture, releases: [{ ...fixture.releases[0], sha256: '0'.repeat(64) }] }, 'tests/fixtures/firmware/public'));
assert.throws(() => checkManifest({ ...fixture, releases: [{ ...fixture.releases[0], size: 1 }] }, 'tests/fixtures/firmware/public'));
// Prerelease identifiers compare semver-style: numeric parts as numbers, so rc.10 > rc.9; a release beats its prerelease.
assert.ok(compareVersions('1.0.0-rc.10', '1.0.0-rc.9') > 0);
assert.ok(compareVersions('1.0.0-rc.2', '1.0.0-rc.10') < 0);
assert.ok(compareVersions('1.0.0-rc.1', '1.0.0-rc') > 0);
assert.ok(compareVersions('1.0.0-1', '1.0.0-alpha') < 0);
assert.ok(compareVersions('1.0.0', '1.0.0-rc.10') > 0);
assert.ok(compareVersions('0.1.10', '0.1.9') > 0);
assert.ok(validDate('2024-02-29') && !validDate('2023-02-29') && !validDate('2026-13-45'));
// Only prereleases: no latest stable release, all listed under other releases.
const onlyPre = selectReleases({ releases: fixture.releases.filter(r => r.channel === 'prerelease') });
assert.equal(onlyPre.latest, null);
assert.deepEqual(onlyPre.older.map(r => r.version), ['10.0.0-rc1']);
// Leak guard: published release notes and manifest text must not carry internal references.
// Same rule as the firmware release workflow. An email address is allowed.
// Public repositories that release text may name or link to, as org/repo. Everything else under
// canimal-io, and any other GitHub PR, issue, compare, blob, tree or commit link, is rejected.
const PUBLIC_REPOS = ['canimal-io/documentation'];
// Standards and units that look like ticket ids but are not.
const TICKET_PREFIX_ALLOWLIST = ['CAN', 'SHA', 'UTF', 'CRC', 'RS', 'ISO', 'IEC', 'AES', 'USB'];
const isPublicRepo = slug => PUBLIC_REPOS.includes(slug.toLowerCase().replace(/\.git$/, ''));
const leaks = text => {
  const found = [];
  if ([...text.matchAll(/\b([A-Za-z]{2,5})-[0-9]+\b/g)].some(m => !TICKET_PREFIX_ALLOWLIST.includes(m[1].toUpperCase()))) found.push('ticket id');
  if ([...text.matchAll(/canimal-io\/([A-Za-z0-9._-]+)/gi)].some(m => !isPublicRepo(`canimal-io/${m[1]}`))) found.push('private repo name');
  if ([...text.matchAll(/github\.com\/([A-Za-z0-9._-]+\/[A-Za-z0-9._-]+)\/(pull|issues|compare|blob|tree|commit)\//gi)].some(m => !isPublicRepo(m[1]))) found.push('GitHub link');
  if (/(^|[^A-Za-z0-9._%+-])@[A-Za-z][A-Za-z0-9-]*/m.test(text)) found.push('@mention');
  return found;
};
const strings = v => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
function checkLeaks(manifest, publicDir) {
  const found = [];
  for (const s of strings(manifest)) for (const what of leaks(s)) found.push(`manifest: ${what} in ${JSON.stringify(s)}`);
  const notes = dir => existsSync(dir) ? walk(dir).filter(p => p.endsWith('/RELEASE_NOTES.md')) : [];
  for (const f of notes(`${publicDir}/firmware`)) for (const what of leaks(read(f))) found.push(`${f}: ${what}`);
  return found;
}
assert.deepEqual(checkLeaks(manifest, 'public'), [], 'Internal reference in published firmware text');
assert.deepEqual(checkLeaks(fixture, 'tests/fixtures/firmware/public'), [], 'Fixture notes must pass the leak guard');
assert.deepEqual(leaks('Fixes bug. Contact support@canimal.io or a.b+c@example.com.'), [], 'Email addresses are allowed');
// Synthetic names only.
assert.deepEqual(leaks('Fixes ABC-123 in the bootloader'), ['ticket id']);
assert.deepEqual(leaks('Fixes abc-123 in the bootloader'), ['ticket id']);
assert.deepEqual(leaks('SHA-256, UTF-8, RS-485, sha-1, crc-32, ISO-8859, IEC-61000, AES-128 and USB-2 are fine'), []);
assert.deepEqual(leaks('Sampling at @500kbps works; mail a@b.example'), []);
assert.deepEqual(leaks('See https://github.com/example-org/example-repo/pull/1'), ['GitHub link']);
for (const kind of ['issues', 'compare', 'blob', 'tree', 'commit']) assert.deepEqual(leaks(`See https://github.com/example-org/example-repo/${kind}/x`), ['GitHub link'], kind);
assert.deepEqual(leaks('See https://github.com/canimal-io/documentation/pull/1 and canimal-io/documentation'), [], 'Allowlisted public repo');
assert.deepEqual(leaks('CAN-2.0B and can-2.0b are supported'), []);
assert.deepEqual(leaks('Clone https://github.com/canimal-io/documentation.git or canimal-io/documentation.git'), [], 'Allowlisted repo with .git suffix');
assert.deepEqual(leaks('See https://github.com/canimal-io/documentation.git/blob/main/x'), []);
assert.deepEqual(leaks('canimal-io/example-private.git'), ['private repo name']);
assert.deepEqual(leaks('rc-1 and fw-2'), ['ticket id'], 'Fails closed on short ticket-like words');
assert.deepEqual(leaks('canimal-io/example-private'), ['private repo name']);
assert.deepEqual(leaks('See https://github.com/canimal-io/example-private/blob/main/x'), ['private repo name', 'GitHub link']);
assert.deepEqual(leaks('Thanks @someone for the fix'), ['@mention']);
assert.deepEqual(leaks('@someone first'), ['@mention']);
assert.deepEqual(checkLeaks({ ...fixture, releases: [{ ...fixture.releases[0], notes: '/firmware/can-usb/9.9.8/RELEASE_NOTES.md (ABC-123)' }] }, 'tests/fixtures/firmware/public').length, 1);
{
  // A planted notes file with a mention and a ticket id must be caught.
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const tmp = mkdtempSync(path.join(tmpdir(), 'leak-'));
  mkdirSync(`${tmp}/firmware/can-usb/1.0.0`, { recursive: true });
  writeFileSync(`${tmp}/firmware/can-usb/1.0.0/RELEASE_NOTES.md`, 'Thanks @someone, fixes ABC-123.\n');
  assert.equal(checkLeaks({ releases: [] }, tmp).length, 2);
  rmSync(tmp, { recursive: true });
}
// Build overrides: only fixture manifests and dist-<letters> output directories are accepted.
assert.ok(isFixtureManifestPath('tests/fixtures/firmware/can-usb.json'));
for (const v of ['src/data/firmware/can-usb.json', 'tests/fixtures/../../src/data/firmware/can-usb.json', `../${path.basename(process.cwd())}/tests/fixtures/x.json`, '..\\tests\\fixtures\\x.json', 'tests\\fixtures\\..\\..\\src\\x.json',path.resolve('tests/fixtures/firmware/can-usb.json'), 'tests/fixtures', 'tests/fixtures-evil/x.json', '', undefined]) assert.ok(!isFixtureManifestPath(v), `Should reject manifest ${v}`);
assert.ok(isFixtureOutDir('dist-fixture') && isFixtureOutDir('dist-dryrun'));
for (const v of ['dist', 'dist-', 'dist-a/b', '../dist-x', 'dist-X', 'dist-a1', '/tmp/dist-x']) assert.ok(!isFixtureOutDir(v), `Should reject out dir ${v}`);
// The dry-run-shaped manifest (single prerelease, bootloader 2.1.0) is schema-valid and has no stable release.
const dryrun = JSON.parse(read('tests/fixtures/firmware/can-usb-dryrun.json'));
for (const r of dryrun.releases) assert.deepEqual(validateEntry(r), []);
assert.equal(selectReleases(dryrun).latest, null);
// Schema violations must be rejected.
const bad = patch => () => checkManifest({ ...fixture, releases: [{ ...fixture.releases[0], ...patch }] }, 'tests/fixtures/firmware/public');
const v0 = fixture.releases[0].version;
for (const patch of [
  { file: `/firmware/can-usb/${v0}/../9.9.9/canimal-can-usb-9.9.9.signed.bin` },
  { file: '/firmware/other/x.signed.bin' },
  { file: '/etc/passwd' },
  { notes: `/firmware/can-usb/${v0}/../../../x.md` },
  { notes: `/firmware/can-usb/${v0}/RELEASE_NOTES.txt` },
  { notes: `/firmware/can-usb/${v0}/notes.md` },
  { file: `/firmware/can-usb/${v0}/other.signed.bin` },
  { file: `/firmware/can-usb/${v0}/canimal-can-usb-${v0}.signed.bin.sig` },
  { date: '2026-13-45' }, { date: '2026-02-30' }, { date: '2026-1-5' },
  { hw_revisions: [] }, { hw_revisions: [1] }, { hw_revisions: undefined },
  { min_bootloader: '0.1' }, { min_bootloader: undefined },
]) assert.throws(bad(patch), undefined, `Should reject ${JSON.stringify(patch)}`);
// The built page lists every manifest entry; with none it shows the empty state.
const fw = load(read('dist/products/can_to_usb/firmware/index.html'))('main').text();
for (const r of manifest.releases) assert.ok(fw.includes(r.version) && fw.includes(r.sha256), `Page omits ${r.version}`);
if (manifest.releases.length === 0) assert.ok(fw.includes('No public release yet; contact support for firmware updates.'));
assert.ok(!/dfu-util[^\n]* -e\b[^\n]*-D/.test(fw), 'Flash command must not use -e');
console.log(`PASS: firmware manifest (${manifest.releases.length} releases) and fixture (${fixture.releases.length}) sizes/SHA-256, latest-stable ordering, page lists every entry`);
