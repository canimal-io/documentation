# CSI-19: datasheet-to-product journey

For Callie / founder review. [Issue](https://linear.app/canimalsys/issue/CSI-19/cu-15-repair-the-datasheet-to-product-link).
No merge, deployment, manual workflow dispatch, domain/settings change or external message performed.

## Verified baseline (2026-10-05 UTC)

- Documentation main: `e77e657519b0354304c32ed614ac2a9db55786f4` (merged Starlight).
- Website main: `8e3c0e9cf673d93cf4edd65883b02d68f92d20fc`.
- Live datasheet: HTTP 200, unchanged docs canonical, still links to the legacy URL.
- Live `https://canimal.io/products`: HTTP 200, H1 `Canimal CAN-USB`.
- Live `/product/canimal-can-usb/`: normalization to the unslashed path, then HTTP 404.
- Website source confirms `/products` is the CAN-USB page; live/source had no product canonical tag.

Only the datasheet href changes. Label, heading ID, prose, product claims, assets,
Starlight slugs/navigation and docs canonicals stay unchanged. The one reviewed
body hash is updated with an explicit provenance note. The old test that asserted
the broken link is replaced, not bypassed.

## Dependency / release order

Companion website change: exact legacy route permanent redirect to `/products`,
server-only product canonical metadata, real HTTP regression in existing CI.
No global trailing-slash change or catch-all redirect. Next normalizes the slash
first: unslashed legacy = one 308; slashed legacy = two 308s. Query and browser
fragment survive; canonical omits tracking parameters.

| Released combination | Datasheet journey |
| --- | --- |
| New docs + current website | Direct existing `/products` → 200 |
| Current docs + new website | Legacy route → permanent redirect(s) → `/products` → 200 |
| Both changes | Direct product link plus working old bookmarks |

Neither PR requires the other to merge first. Website-first is preferred to repair
existing bookmarks immediately, but docs-first creates no new dead link. The
existing legacy failure persists only until the website compatibility release.
Full production acceptance requires both separately authorized releases. Do not
mark a local Worker check as production success.

## Checks / evidence

Node 24.21.0 / npm 11.19.0. `npm ci`; `ASTRO_TELEMETRY_DISABLED=1 npm run build`;
`npm test`: PASS (188 internal links/assets/anchors, CNAME/canonicals, legacy
anchors, preservation baseline, workflow isolation, notices). `npm run
test:reproducibility`: PASS, two clean installs/builds/static suites, unchanged
lock SHA-256 `f20b6fbd9cedd69fff64e97d40e71ef0206edd13976aa7ae2488d20d6934e446`,
identical dist digest `75bae802017ae26e4e1a59e737fcc2188dd31c26eea14791dff7ecfde37abd19`.
`npm audit --audit-level=low`: zero reported vulnerabilities.

`npm run test:browser`: 12 Chromium tests PASS, including bounded axe checks,
light/dark/mobile, focus and Enter activation of the named product link. That
single external browser destination is intercepted with a synthetic page; actual
cross-site identity/redirects are separately checked below. Local browser runtime
used extracted shared libraries via `LD_LIBRARY_PATH` and font configuration via
`FONTCONFIG_FILE`; no host packages changed. Initial missing-library/font launch
failures and an ambiguous TOC/content locator were corrected before the final pass.
Existing optional i18n/404-precedence build warnings remain; output checks pass.

`npm run test:links -- --canonical-only`: PASS against live `/products` (explicitly
skips not-yet-released redirect/canonical metadata checks).
`WEBSITE_ORIGIN=http://127.0.0.1:8787 npm run test:links`: full PASS against the
locally built OpenNext Worker, including both old path forms and query retention.
Website Next build, 6 Node tests and OpenNext bundle build also pass. Product
browser navigation preserves query/fragment and product identity at 390/1440px;
no horizontal overflow, images have alt text, purchase link focus visible. No
purchase or contact submission performed. Website axe finds 7 contrast nodes at
each width in unchanged page elements; no full-site accessibility pass claimed.

## Production verification (read-only; after authorized releases)

From this reviewed docs checkout after `npm ci && npm run build && npm test`:

```sh
DOCS_ORIGIN=https://docs.canimal.io npm run test:links
```

Require direct canonical product HTTP 200 and correct H1; permanent same-origin
redirects for both legacy forms; no loops, lost query strings, or soft 404; one
product canonical pointing to `https://canimal.io/products`. Open the live
datasheet with keyboard, activate the named link, verify correct page and visible
focus at desktop/mobile. Check an old bookmarked URL with query and fragment.
Check docs canonical/legacy heading anchor remain unchanged. No workflow dispatch
is part of verification. CDN/production behavior remains unverified until release.

## Rollback

Use reviewed revert commits and separately authorized releases, never force-push
or change DNS. Reverting only website compatibility leaves the new docs link
working, but reintroduces the known old-bookmark 404; prefer retaining the narrow
redirect if reverting unrelated metadata. Reverting the docs href before website
compatibility is live recreates the original defect: retain the corrected href
(or release compatibility first). A full rollback intentionally restores that
known defect and is not a successful journey repair. Re-run the read-only checks
after any rollback and record the expected legacy failure if redirect removed.

Ruleset: 7354aaaaa548098a760f517fb34a7241c84e8764; layers: AGENTS.md, README.md, index.md, org/communication.md, org/engineering.md, projects/can-usb.md, repos/documentation.md, repos/canimal-website.md; current repository instructions/config/workflows inspected
Checks: clean pinned preflight, source/live revalidation, docs build/static/reproducibility/audit, 12 browser tests, local full cross-site journey, website builds/6 Node tests, scoped diff/lock integrity PASS; website contrast findings retained as limitation; not run: full live post-release journey (not deployed), human screen-reader/full accessibility audit, hardware/product qualification (outside routing scope)
AI-assisted: Canimal Engineering (OpenClaw / Codex)
