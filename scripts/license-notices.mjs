// Static-site runtime/framework notices; build/test-only license inventory is separate.
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
const packages = ['astro','@astrojs/starlight','pagefind','astro-expressive-code','@expressive-code/core','@expressive-code/plugin-frames','@expressive-code/plugin-shiki','@expressive-code/plugin-text-markers'];
let text = '@pagefind/default-ui is part of Pagefind and covered by the Pagefind MIT license below.\n\nCanimal documentation content and assets remain proprietary. These dependency licenses do not relicense that content.\n';
for (const name of packages) {
  const dir = `node_modules/${name}`;
  const pkg = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));
  const files = readdirSync(dir).filter(n => /^(licen[cs]e|notice|copying)/i.test(n)).flatMap(n => statSync(`${dir}/${n}`).isFile() ? [n] : readdirSync(`${dir}/${n}`).map(f => `${n}/${f}`)).sort();
  if (!files.length) throw new Error(`Missing license: ${name}`);
  for (const file of files) text += `\n${'='.repeat(72)}\n${name} ${pkg.version} / ${file}\n${'='.repeat(72)}\n${readFileSync(`${dir}/${file}`, 'utf8')}\n`;
}
text = text.trimEnd() + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync('public/THIRD-PARTY-NOTICES.txt', 'utf8') !== text) throw new Error('Stale third-party notices; regenerate and review');
} else writeFileSync('public/THIRD-PARTY-NOTICES.txt', text);
