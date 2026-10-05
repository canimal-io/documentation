import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const sha = b => createHash('sha256').update(b).digest('hex');
const lock = sha(readFileSync('package-lock.json'));
function files(dir) { return readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
const builds = [];
for (let run = 1; run <= 2; run++) {
  for (const dir of ['dist', '.astro']) rmSync(dir, { recursive: true, force: true });
  for (const args of [['ci'], ['run','build'], ['test']]) execFileSync('npm', args, { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  assert.equal(sha(readFileSync('package-lock.json')), lock, `Lock changed on run ${run}`);
  const tree = sha(files('dist').map(p => `${p}\0${sha(readFileSync(p))}`).join('\n'));
  builds.push(tree);
  console.log(`CLEAN_RUN_${run}: lock=${lock}; dist=${tree}`);
}
assert.equal(builds[0], builds[1], 'Generated output differs across clean builds');
console.log('PASS: two clean installs/builds, identical lock and byte-identical output trees');
