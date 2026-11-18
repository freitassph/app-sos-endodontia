#!/usr/bin/env bash
set -euo pipefail
[[ "${1:-}" == qualify ]]
oid=${2:-}
[[ "$oid" =~ ^[0-9a-f]{40}$ && "$(git rev-parse --verify "$oid^{commit}")" == "$oid" ]]
tree=$(git rev-parse "$oid^{tree}")
receipts=$(git rev-parse --path-format=absolute --git-path local-release/v1)
stage=$(mktemp -d "${TMPDIR:-/tmp}/sos-release.XXXXXXXX")
trap 'rm -rf "$stage"' EXIT
mkdir "$stage/source"
git archive "$oid" | tar -x -C "$stage/source"
for name in $(git rev-parse --local-env-vars); do unset "$name"; done
cd "$stage/source"
version=$(cat .nvmrc)
bin="${NVM_DIR:-$HOME/.nvm}/versions/node/v$version/bin"
if [[ -x "$bin/node" ]]; then export PATH="$bin:$PATH"; fi
[[ "$(node -p 'process.versions.node')" == "$version" ]] || { echo "Node $version necessário." >&2; exit 1; }
npm ci --include=dev --no-audit --no-fund
npm run test:dependency-contracts
npm test
npm run build
npx --no-install playwright install chromium
QA_OUTPUT="$stage/browser" node scripts/qualify-browser.mjs
mkdir -p "$receipts"
file=$(mktemp "$receipts/.receipt.XXXXXXXX")
printf '%s %s\n' "$oid" "$tree" > "$file"
mv "$file" "$receipts/$oid"
echo "Qualificação local concluída para $oid."
