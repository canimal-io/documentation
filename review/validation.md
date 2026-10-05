# CSI-33 validation record

For Callie / founder review. Local execution: 2026-10-05, Debian 13 x86_64, Node 24.21.0, npm 11.19.0, Astro 7.3.5, Starlight 0.42.5, Playwright 1.63.0 / Chromium 153.0.8010.12, axe 4.13.0.

## Acceptance evidence

| Area | Evidence / outcome |
| --- | --- |
| Baseline inspected | Main c5f3924ac6d2333336c93e2efb822cb38df0f725; all 14 tracked files, configuration/theme, Gemfile/lock, CNAME, workflow, open PRs #2–5. No tracked AGENTS/CONTRIBUTING/CLAUDE files. Live home/datasheet/guide fetched HTTP 200 before editing. Direct Python HTTP fetch initially returned 403; web-fetch succeeded. |
| Choice | [Four-way ADR](ADR-001-framework.md), current release/license metadata and official search docs; Starlight selected independently. |
| Content | Source body comparison against pinned main for home/datasheet and PR #5 head 25a198e7ccda9ca5522b702148ec34862772bdb7 for guide: exact except first H1 → H2. Titles, navigation order, all three asset hashes preserved. Baseline hashes and original heading IDs in content-baseline.json. |
| URLs / SEO | Static output exists at `/`, `/products/can_to_usb/can_to_usb_specs/`, `/products/can_to_usb/can_to_usb_guide/`; exact HTTPS canonicals, descriptions, language, all legacy content-heading anchors. 188 internal links/assets/anchors validated. No redirects needed. Root CNAME unchanged byte-for-byte, copied unchanged to output; root asset URLs unchanged. |
| Clean builds | `npm run test:reproducibility`: two npm ci runs, deleting dist/.astro before each; both builds and static checks pass, lock unchanged and output tree byte-identical. |
| Lock SHA-256 | `f20b6fbd9cedd69fff64e97d40e71ef0206edd13976aa7ae2488d20d6934e446` on both runs. |
| Output tree digest | `60695a893936f14a7aeba1006ab927bbff022272a3ea081bafa5c12e7aaa6261` on both runs. Algorithm in scripts/check-reproducibility.mjs (sorted paths + each file SHA-256). |
| Browser / accessibility | 11 Chromium tests: all three pages at 1440×1000 in light/dark; axe WCAG 2 A/AA + 2.1 AA rule subset; skip-link keyboard activation/visible focus; Ctrl+K search, results, Escape/focus restoration and keyboard activation of result; 390×844 mobile menu/navigation/image/no page overflow; 404 recovery; persisted theme; local search with no external requests. No violations in tested axe scans. |
| Tables | No existing content tables. Synthetic Markdown table rendered by the installed Astro Sätteri renderer and placed in the real mobile theme: visible column headers/cells, no page overflow. Fixture is never published. |
| Visual review | Agent inspected screenshots of home, datasheet dark, full guide, mobile datasheet, search/focus ring: readable text/code, responsive image, distinct navigation/current page, consistent light/dark colors. Human design/screen-reader review remains outstanding. |
| Security | Final npm audit: 0 reported vulnerabilities across 397 lock-tree dependencies including optional platforms (291 dependency packages installed on this host). No credentials, analytics, hosted search, external font service or new product claims. No server deployed; preview loopback-only. |
| Licenses | [Full locked inventory](dependency-licenses.md): no missing package license fields. Frameworks/selected runtime UI MIT; other permissive licenses plus MPL-2.0 build/test tooling and LGPL-3.0-or-later libvips image-build binaries. Unmodified build/test executables are not shipped in static output. [Client/framework notices](../public/THIRD-PARTY-NOTICES.txt) shipped and checked against installed packages. Canimal content remains proprietary. |
| Deployment isolation | Parsed workflow assertions enforce PR trigger, no pull_request_target, read-only global token, immutable action pins, no Pages actions in check job; deployment requires manual dispatch AND main AND deploy=true, needs successful checks, and names github-pages environment. No workflow was manually dispatched. |
| Diff review | Exact prose comparison, asset hashes, route/anchor checks, generated HTML inspection, workflow/permission review, lock/license/audit review and git diff --check. Only documentation repository files changed; caches/dependencies/build outputs excluded. Six requested review screenshots are intentionally committed. |

## Screenshots

These are local rendered previews, not production. CI also uploads the static site and Playwright screenshots/axe reports as the 14-day `docs-review` artifact on the PR check run.

- [Home, desktop light](screenshots/home-light.png)
- [Datasheet, desktop light](screenshots/datasheet-light.png)
- [Datasheet, desktop dark](screenshots/datasheet-dark.png)
- [User guide, desktop light](screenshots/guide-light.png)
- [Local search and visible focus](screenshots/search.png)
- [Mobile datasheet](screenshots/mobile.png)

## Failures resolved / limitations

- First GitHub CI run 37256948668 caught `scrollable-region-focusable` on the long Python example with Ubuntu fonts (local fallback fonts did not overflow). Enabled Expressive Code's supported `wrap: true` presentation option without changing code bytes; added a 390/768/1440px no-horizontal-code-scroll regression. Final local suite: 11 passed; two clean builds repeated with the updated digest above. No axe rule was disabled.

- Initial static check exposed Starlight's `/404/` canonical while output is `/404.html`; explicit 404 metadata fixed it and adds noindex.
- Initial obsolete-command assertion also matched the prose “termination on an active bus”; scoped it to code blocks.
- Chromium initially lacked libraries, then fonts. Debian packages were downloaded/extracted under the task directory and supplied via LD_LIBRARY_PATH/FONTCONFIG_FILE; no host package installation or infrastructure change. CI installs browser prerequisites on its disposable runner. Local screenshots use DejaVu/system-font fallback; platform typography can differ.
- Initial search selector assumed input type=search; actual control is a labeled textbox. Semantic role selector now verifies the real interaction. The focus-restoration assertion was also corrected to compare the actual invoking element (body after a skip-link jump), not assume the Search button opened the dialog.
- Temporary js-yaml 4.1.1 test dependency raised an audit finding; upgraded to patched 4.3.2 before final validation. No audit suppression.
- Build emits framework warnings for absent optional i18n collection and 404 route precedence. English content and custom 404 output are explicitly validated; no warning is treated as a passed assertion.
- npm reports esbuild's optional install script is not allowlisted; no blanket script approval was added. Clean installs/builds succeed using the resolved native package.
- Automated contrast checks and screenshot inspection are a subset, not full accessibility compliance. No human assistive-technology test, Safari/Firefox, physical mobile-device check, or exhaustive contrast/zoom audit. No human manual keyboard sign-off is claimed; keyboard behavior is exercised through browser automation with visual inspection of its focus state.
- Existing product claims and host setup commands remain unqualified; no hardware, CAN bus, resistance or OS-command execution. CSI-18 review/merge coordination, CSI-19 external product-link repair, CSI-26 alert/old dependency PR reconciliation remain separate. The old product link is intentionally not repaired here.
- Production Pages, DNS, repository settings and environment protection rules are not modified or tested. No deployment, workflow dispatch or merge. Owner must review framework/presentation, reconcile PR #5, and verify environment protection before separately authorizing production release. Rollback is described in the ADR.

Ruleset: 7354aaaaa548098a760f517fb34a7241c84e8764; layers: AGENTS.md, README.md, index.md, org/communication.md, org/engineering.md, projects/can-usb.md, repos/documentation.md
Checks: pinned clean ruleset preflight PASS; repository/production/ticket/PR inspection PASS; two clean installs/builds with identical lock/output PASS; content/assets/routes/canonicals/anchors/internal links PASS; 11 browser tests and bounded axe/visual review PASS; dependency audit/license review and scoped diff review PASS; not run: production deployment/environment protection, hardware and platform-command qualification, human assistive-technology/full accessibility audit, Safari/Firefox/physical devices (outside this bounded local verification)
AI-assisted: Canimal Engineering (OpenClaw / Codex)
