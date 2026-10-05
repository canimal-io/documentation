import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import path from 'node:path';
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
const routes = ['/', '/products/can_to_usb/can_to_usb_specs/', '/products/can_to_usb/can_to_usb_guide/'];
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
console.log(`PASS: preserved prose/assets, 3 routes, CNAME/canonicals, landmarks, ${checked} internal links/assets/anchors, CSI-18, 404, local search`);

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
  const route = name === 'index.md' ? '' : name.replace(/\.md$/, '') + '/';
  const $ = load(read(`dist/${route}index.html`));
  const ids = new Set($('[id]').toArray().map(e => $(e).attr('id')));
  for (const id of data.legacyHeadingIds) assert.ok(ids.has(id), `Lost legacy heading anchor: ${name}#${id}`);
}
console.log('PASS: all legacy content heading anchors retained');

const { execFileSync } = await import('node:child_process');
execFileSync(process.execPath, ['scripts/license-notices.mjs', '--check']);
console.log('PASS: third-party notices match installed framework/client licenses');
