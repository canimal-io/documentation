#!/bin/sh
# Build the CAN-USB datasheet PDF from the docs pages. Needs git and Docker.
# Output: public/assets/pdf/canimal-can-usb-datasheet.pdf (git-ignored).
set -eu

IMAGE=pandoc/extra:3.14.0.0-ubuntu@sha256:2a1a9aabf401f6b3a5d7463af73e22f60ef2d75fb29492b1f6a994ba3c549b75
# pgfplots is not in the image; fetch a pinned release and check its hash.
PGFPLOTS_URL=https://github.com/pgf-tikz/pgfplots/releases/download/1.18.3/pgfplots_1.18.3.tds.zip
PGFPLOTS_SHA256=f480bc3ea5dffd0d8742295cf8f45e245a79b4a9a3e7704f98b62644a3aa5ee0

SRC=src/content/docs/products/can_to_usb
B=datasheet/build
OUT=public/assets/pdf/canimal-can-usb-datasheet.pdf

cd "$(dirname "$0")/.."

if [ "${1:-}" != --inside ]; then
  # Version from the last commit, so rebuilding the same commit gives the same PDF.
  DOC_COMMIT=$(git log -1 --format=%h)
  DOC_DATE=$(git log -1 --format=%cs)
  SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)
  if [ -n "$(git status --porcelain -- "$SRC" src/data/firmware datasheet)" ]; then
    DOC_COMMIT="$DOC_COMMIT+changes"
  fi
  export DOC_COMMIT DOC_DATE SOURCE_DATE_EPOCH
  exec docker run --rm -v "$PWD":/data -w /data -u "$(id -u):$(id -g)" \
    -e DOC_COMMIT -e DOC_DATE -e SOURCE_DATE_EPOCH -e HOME=/tmp \
    --entrypoint /bin/sh "$IMAGE" datasheet/build.sh --inside
fi

mkdir -p "$B" "$(dirname "$OUT")"
export TEXMFHOME=/data/$B/texmf TEXMFVAR=/data/$B/texmf-var

if [ ! -d "$B/texmf/tex/latex/pgfplots" ]; then
  wget -q -O "$B/pgfplots.zip" "$PGFPLOTS_URL"
  echo "$PGFPLOTS_SHA256  $B/pgfplots.zip" | sha256sum -c --quiet -
  python3 -m zipfile -e "$B/pgfplots.zip" "$B/texmf"
  rm "$B/pgfplots.zip"
fi

python3 - "$B/version.tex" <<'EOF'
import json, os, sys
releases = json.load(open('src/data/firmware/can-usb.json'))['releases']
stable = [r for r in releases if r['channel'] == 'stable']
def key(r):
    v = r['version']
    return [int(x) for x in v.split('-')[0].split('.')] + ['-' not in v]
latest = max(stable, key=key) if stable else None
macros = {
    'DocCommit': os.environ['DOC_COMMIT'],
    'DocDate': os.environ['DOC_DATE'],
    'DocYear': os.environ['DOC_DATE'][:4],
    'FirmwareLatest': latest['version'] if latest else 'none published',
}
with open(sys.argv[1], 'w') as f:
    for name, value in macros.items():
        f.write('\\newcommand\\%s{%s}\n' % (name, value))
EOF

md() { # md <page> <output> [pandoc -M options]
  page=$1 out=$2; shift 2
  pandoc -f gfm+yaml_metadata_block -t latex --lua-filter datasheet/filter.lua "$@" \
    -o "$B/$out" "$SRC/$page"
}
md can_to_usb_guide.md guide-intro.tex -M idprefix=guide -M only=introduction
md can_to_usb_guide.md guide-connectors.tex -M idprefix=guide -M only=connectors-and-channels
md can_to_usb_guide.md guide-linux.tex -M idprefix=guide -M except=introduction,connectors-and-channels
md can_to_usb_specs.md specs.tex -M idprefix=specs -M spectables=true \
  -M except=canimal-can-usb-transceiver,technical-specifications

# Two runs for the contents, a third if references still moved.
rm -f "$B/datasheet.aux" "$B/datasheet.toc"
for run in 1 2 3; do
  lualatex -interaction=nonstopmode -halt-on-error -output-directory="$B" datasheet/datasheet.tex >"$B/lualatex.out" ||
    { tail -n 40 "$B/lualatex.out" >&2; exit 1; }
  [ "$run" -ge 2 ] && ! grep -q 'Rerun to get' "$B/datasheet.log" && break
done
cp "$B/datasheet.pdf" "$OUT"
echo "Built $OUT ($DOC_COMMIT, $DOC_DATE)"
