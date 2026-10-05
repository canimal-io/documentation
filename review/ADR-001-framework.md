# CSI-33: static documentation framework

Decision: Astro Starlight, 2026-10-05. No paid services or external search service.

## Evidence and comparison

GitHub release/metadata API and npm stable dist-tags inspected on the decision date. All four repositories are unarchived and MIT licensed. Activity is evidence of current maintenance, not a support guarantee.

| Criterion | Starlight | Docusaurus | VitePress | Material for MkDocs |
| --- | --- | --- | --- | --- |
| Release / activity | 0.42.5, Oct 1; pushed Oct 3 | 3.10.2, Jul 10; pushed Oct 2 | Stable 1.6.4; 2.0.0-alpha.20 Sep 4; pushed Sep 26 | 9.7.7, Jul 17; pushed Oct 2 |
| License | MIT | MIT | MIT | MIT (free core sufficient) |
| Static GitHub Pages | Native static Astro output | Static build, Pages deployment documented | Static build, Pages deployment documented | Static HTML, Pages deployment documented |
| Local search | Built-in Pagefind | Community plugin; official integration favors hosted Algolia | Built-in MiniSearch option | Built-in search plugin |
| Accessibility defaults | Skip link, landmarks, keyboard search, theme control | Skip link, keyboard navigation, theme control | Skip link, keyboard search, theme control | Keyboard navigation, semantic layout, palette controls |
| Existing URLs | Explicit slugs + trailingSlash preserve directory URLs | Slugs + routeBasePath + trailingSlash | Needs rewrites/directory index layout for existing directory URLs | Directory URLs match nested Markdown |
| Authoring | Markdown + YAML; optional MDX unused | Markdown/MDX + React configuration | Markdown + Vue configuration | Markdown + YAML |
| Dependency surface | Astro + Starlight; Pagefind binaries, MDX/transitive tooling even if unused | React + Docusaurus + local-search plugin | Vue + Vite + MiniSearch, relatively lean | Python + MkDocs + theme/plugins; separate runtime/package manager |
| Migration effort here | Low: 3 pages, explicit slugs, built-in docs UI | Medium: more configuration/plugin decisions for 3 pages | Low–medium: routes and theme configuration | Low: existing hierarchy maps readily; new Python toolchain |

Choose Starlight for integrated local search, current stable activity and docs-specific UI without additional UI-framework or search-plugin configuration. VitePress is a credible lean alternative, but its stable/next split and extra directory-route mapping offer no advantage for this small migration. Docusaurus versioning/React extensibility is unnecessary here. Material is viable, but offers no compelling benefit that offsets a separate Python packaging/runtime workflow. These are qualitative dependency/migration comparisons, not benchmark results; only the chosen stack was installed/built.

Sources:

- [Starlight release](https://github.com/withastro/starlight/releases/tag/%40astrojs/starlight%400.42.5), [features](https://starlight.astro.build/), [configuration](https://starlight.astro.build/reference/configuration/)
- [Docusaurus releases](https://github.com/facebook/docusaurus/releases), [search ownership](https://docusaurus.io/docs/search), [deployment](https://docusaurus.io/docs/deployment)
- [VitePress releases](https://github.com/vuejs/vitepress/releases), [local search](https://vitepress.dev/reference/default-theme-search), [deploy](https://vitepress.dev/guide/deploy)
- [Material releases](https://github.com/squidfunk/mkdocs-material/releases), [search](https://squidfunk.github.io/mkdocs-material/setup/setting-up-site-search/), [publishing](https://squidfunk.github.io/mkdocs-material/publishing-your-site/)
- Each linked repository's LICENSE; runtime [Node release schedule](https://github.com/nodejs/Release#release-schedule). Node 24 is the current LTS line on the decision date; exact runtime 24.21.0, npm 11.19.0.

## Scope and governance

The explicit CSI-33 instruction authorizes replacing the playbook's Jekyll/theme/Ruby mechanics, not its safety, claims, domain, ownership or deployment controls. No technical prose is cosmetically rewritten. Existing H1 Markdown becomes H2 because Starlight supplies the page H1; text and links remain intact. Explicit slugs preserve underscores and public directory routes. Original front-matter title/order/layout intent maps to title, ordered sidebar and Starlight layout. No original last-modified metadata existed.

PR #5 / CSI-18 is an explicit dependency: the guide is migrated from its pinned head recorded in content-baseline.json, including the corrected section verbatim. Prefer reviewing/merging #5 first, then reconcile this PR against main; if #5 changes, port the reviewed changes and deliberately refresh the body hash. Do not resolve a move/modify conflict by restoring the old guide. This PR does not close CSI-18 or qualify hardware.

CSI-19 remains open: its known external datasheet-to-product link is preserved, not repaired here. CSI-26 remains open: removal of Ruby dependencies changes exposure but is not an alert-resolution decision; owners must reconcile alerts and existing PRs #2–4 separately. Existing OS, throughput, temperature and compatibility claims remain unqualified; this migration does not approve them.

## Deployment and rollback

PR and main-push runs build/test only, with contents:read. Only explicit workflow_dispatch + deploy=true + refs/heads/main can enter the Pages job; write/OIDC permissions are scoped to that job. No pull_request_target, secrets, remote fonts, analytics or hosted search. Actions pinned by SHA. Owner must verify github-pages environment protection/reviewers before a separately authorized release; this PR does not change settings or prove deployment behavior.

Rollback is a reviewed revert of the migration on main, followed by a separately authorized build/release. Preserve CSI-18's corrected guide at its old source path when reverting. Do not blindly restore the old branch-deployable workflow: keep the main-only manual gate and read-only PR checks. The former Ruby lock contains known advisories (CSI-26), so a framework downgrade requires dependency/security review. DNS and CNAME never need to change.
