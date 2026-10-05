// Read-only cross-site smoke check. Full mode is a post-release gate, not a deploy command.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const canonical = 'https://canimal.io/products';
const origin = new URL(process.env.WEBSITE_ORIGIN ?? 'https://canimal.io').origin;
const html = process.env.DOCS_ORIGIN
  ? await (async () => {
      const response = await fetch(new URL('/products/can_to_usb/can_to_usb_specs/', process.env.DOCS_ORIGIN), { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, 'Live datasheet');
      return response.text();
    })()
  : readFileSync('dist/products/can_to_usb/can_to_usb_specs/index.html', 'utf8');
const $ = load(html);
assert.equal($('main a').filter((_, e) => $(e).text() === 'Canimal CAN-USB Transceiver').attr('href'), canonical);
assert.equal($('a[href*="/product/canimal-can-usb"]').length, 0);

async function check(route, legacy = false) {
  let url = new URL(route, origin);
  let hops = 0;
  while (true) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if ([301, 308].includes(response.status)) {
      assert.ok(++hops <= 2, 'No redirect loop or excessive chain');
      const location = response.headers.get('location');
      assert.ok(location, 'Redirect needs Location');
      const next = new URL(location, url);
      assert.equal(next.origin, origin, 'No off-site redirect');
      assert.equal(next.search, url.search, 'Preserve query parameters');
      url = next;
      continue;
    }
    assert.equal(response.status, 200, `${url}: product response`);
    assert.equal(url.pathname, '/products', 'Resolve to intended product route');
    if (legacy) assert.ok(hops > 0, 'Legacy route must permanently redirect');
    else assert.equal(hops, 0, 'Canonical link should resolve directly');
    const product = load(await response.text());
    assert.equal(product('h1').text().trim(), 'Canimal CAN-USB', 'Reject soft 404 or homepage');
    // Before the compatibility PR is released, current production has no canonical tag.
    if (!process.argv.includes('--canonical-only')) {
      assert.equal(product('link[rel="canonical"]').attr('href'), canonical);
    }
    console.log(`PASS ${route} -> ${url.pathname} (${hops} permanent redirects)`);
    return;
  }
}
await check('/products');
if (!process.argv.includes('--canonical-only')) {
  for (const route of ['/product/canimal-can-usb', '/product/canimal-can-usb/', '/product/canimal-can-usb/?utm_source=datasheet']) await check(route, true);
} else console.log('SKIPPED legacy redirects and new canonical metadata: pre-release canonical-only mode');
