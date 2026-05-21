#!/usr/bin/env bash
# Upload CLI binaries to an existing GitHub tag as a Release.
# Requires: curl, jq, and GITHUB_TOKEN (classic PAT with repo scope, or gh auth token).
#
# Usage:
#   export GITHUB_TOKEN=ghp_...
#   ./scripts/upload-release.sh v1.0.1

set -euo pipefail

TAG="${1:?Usage: $0 v1.0.1}"
REPO="${GITHUB_REPOSITORY:-SaiBhargavRallapalli/porthole}"
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
BIN_DIR="$(cd "$(dirname "$0")/../packages/cli/binaries" && pwd)"

if [ -z "$TOKEN" ]; then
  if command -v gh >/dev/null 2>&1; then
    TOKEN="$(gh auth token 2>/dev/null || true)"
  fi
fi

if [ -z "$TOKEN" ]; then
  echo "Set GITHUB_TOKEN (repo scope) or install and authenticate gh." >&2
  exit 1
fi

API="https://api.github.com/repos/${REPO}"
AUTH=(-H "Authorization: Bearer ${TOKEN}" -H "Accept: application/vnd.github+json")

for f in porthole-macos-arm64 porthole-macos-x64 porthole-linux-x64 porthole-win-x64.exe checksums.txt; do
  if [ ! -f "${BIN_DIR}/${f}" ]; then
    echo "Missing ${BIN_DIR}/${f} — run: cd packages/cli && npm run package" >&2
    exit 1
  fi
done

echo "Preparing release for ${TAG} on ${REPO}…"
if RELEASE_JSON=$(curl -fsS "${API}/releases/tags/${TAG}" "${AUTH[@]}" 2>/dev/null); then
  echo "Release already exists."
else
  echo "Creating release…"
  RELEASE_JSON=$(curl -fsS "${API}/releases" "${AUTH[@]}" \
    -d "{\"tag_name\":\"${TAG}\",\"name\":\"${TAG}\",\"body\":\"CLI standalone binaries (Node 18).\"}")
fi

UPLOAD_URL=$(echo "$RELEASE_JSON" | jq -r '.upload_url' | sed 's/{?name,label}//')
RELEASE_ID=$(echo "$RELEASE_JSON" | jq -r '.id')

if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" = "null" ]; then
  echo "Failed to get release upload URL:" >&2
  echo "$RELEASE_JSON" | jq . >&2
  exit 1
fi

upload() {
  local file="$1"
  local name="$2"
  local mime="${3:-application/octet-stream}"
  echo "Uploading ${name}…"
  curl -fsS "${UPLOAD_URL}?name=${name}" "${AUTH[@]}" \
    -H "Content-Type: ${mime}" \
    --data-binary "@${BIN_DIR}/${file}" >/dev/null
}

# Delete existing assets with same names (re-upload)
for name in porthole-macos-arm64 porthole-macos-x64 porthole-linux-x64 porthole-win-x64.exe checksums.txt; do
  ASSET_ID=$(curl -fsS "${API}/releases/${RELEASE_ID}/assets" "${AUTH[@]}" | jq -r ".[] | select(.name==\"${name}\") | .id" | head -1)
  if [ -n "$ASSET_ID" ] && [ "$ASSET_ID" != "null" ]; then
    echo "Removing old asset ${name}…"
    curl -fsS -X DELETE "${API}/releases/assets/${ASSET_ID}" "${AUTH[@]}" >/dev/null
  fi
done

upload porthole-macos-arm64 porthole-macos-arm64
upload porthole-macos-x64 porthole-macos-x64
upload porthole-linux-x64 porthole-linux-x64
upload porthole-win-x64.exe porthole-win-x64.exe
upload checksums.txt checksums.txt text/plain

echo ""
echo "Done. Verify:"
echo "  https://github.com/${REPO}/releases/tag/${TAG}"
echo "  brew update && brew reinstall porthole"
