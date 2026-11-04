// Firmware manifest helpers shared by the page, scripts/check-site.mjs and tests.
// Binaries live in public/firmware/<product>/<file>; the manifest in src/data/firmware/.
export const fileName = p => p.slice(p.lastIndexOf('/') + 1);

const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

export function compareVersions(a, b) {
  const [, ...x] = a.match(SEMVER);
  const [, ...y] = b.match(SEMVER);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return Number(x[i]) - Number(y[i]);
  if (x[3] === y[3]) return 0;
  if (x[3] === undefined) return 1;
  if (y[3] === undefined) return -1;
  return x[3] < y[3] ? -1 : 1;
}

// `file` and `notes` are site paths under /firmware/can-usb/<version>/ (no "..", no other directories).
export function sitePathError(p, version, what) {
  const dir = `/firmware/can-usb/${version}/`;
  if (typeof p !== 'string' || !p.startsWith(dir)) return `${what} must start with ${dir}`;
  const rest = p.slice(dir.length);
  if (!/^[0-9A-Za-z._-]+$/.test(rest) || rest.startsWith('.')) return `${what} has a bad file name ${rest}`;
  return null;
}

export function validateEntry(r) {
  const errors = [];
  if (!SEMVER.test(r.version ?? '')) errors.push(`bad version ${r.version}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date ?? '')) errors.push(`bad date ${r.date}`);
  if (!['stable', 'prerelease'].includes(r.channel)) errors.push(`bad channel ${r.channel}`);
  const fileError = sitePathError(r.file, r.version, 'file');
  if (fileError) errors.push(fileError);
  else if (!/\.signed\.bin$/.test(r.file)) errors.push(`bad file ${r.file}`);
  if (!Number.isInteger(r.size) || r.size <= 0) errors.push(`bad size ${r.size}`);
  if (!/^[0-9a-f]{64}$/.test(r.sha256 ?? '')) errors.push('bad sha256');
  const notesError = sitePathError(r.notes, r.version, 'notes');
  if (notesError) errors.push(notesError);
  else if (!/\.md$/.test(r.notes)) errors.push(`notes must be a markdown file: ${r.notes}`);
  if (!Array.isArray(r.hw_revisions) || r.hw_revisions.length === 0 || !r.hw_revisions.every(x => typeof x === 'string' && x)) errors.push('hw_revisions must be a non-empty string array');
  if (!/^\d+\.\d+\.\d+$/.test(r.min_bootloader ?? '')) errors.push(`bad min_bootloader ${r.min_bootloader}`);
  return errors;
}

// Newest stable release first; everything else (older stable and prereleases) newest first below it.
export function selectReleases(manifest) {
  const sorted = [...manifest.releases].sort((a, b) => compareVersions(b.version, a.version));
  const latest = sorted.find(r => r.channel === 'stable') ?? null;
  return { latest, older: sorted.filter(r => r !== latest) };
}

export function formatSize(bytes) {
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KiB (${bytes} bytes)` : `${bytes} bytes`;
}
