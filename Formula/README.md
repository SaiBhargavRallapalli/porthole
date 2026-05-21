# Homebrew distribution

The CLI is published to npm as `@porthole-tunnel/cli`. Homebrew installs a **standalone binary** (no Node.js required) from GitHub Releases.

## Maintainer checklist

### 1. Build release binaries

**Option A — GitHub Actions (recommended)**

```bash
git tag v1.0.0
git push origin v1.0.0
```

The [release workflow](../.github/workflows/release.yml) builds assets and creates a GitHub Release. Requires `NPM_TOKEN` secret for npm publish steps.

**Option B — Local build**

```bash
cd packages/cli
npm install
npm run package
ls -la binaries/
cat binaries/checksums.txt   # or run shasum -a 256 binaries/*
```

Produces:

- `porthole-macos-arm64`
- `porthole-macos-x64`
- `porthole-linux-x64`
- `porthole-win-x64.exe`

Upload these to a GitHub Release tagged `v1.0.1` (version must match `Formula/porthole.rb`).

**Manual upload** (if the workflow failed but you built locally):

```bash
cd packages/cli/binaries
gh release create v1.0.1 \
  porthole-macos-arm64 porthole-macos-x64 porthole-linux-x64 porthole-win-x64.exe checksums.txt \
  --title "v1.0.1" --notes "CLI standalone binaries"
```

If the tag already exists without assets, use `gh release upload v1.0.1` with the same file list.

### 2. Update the formula

Edit `Formula/porthole.rb`:

1. Set `version "1.0.0"` to match the release tag (without `v`).
2. Replace the three `REPLACE_WITH_SHA256_*` placeholders.

Get checksums from the release `checksums.txt` or locally:

```bash
cd packages/cli/binaries
shasum -a 256 porthole-macos-arm64 porthole-macos-x64 porthole-linux-x64
```

### 3. Validate

```bash
# From the repo root (after GitHub Release assets exist and sha256 lines are filled in):
brew audit --strict Formula/porthole.rb
brew install ./Formula/porthole.rb
porthole --version
```

### 4. Commit and push

```bash
git add Formula/porthole.rb
git commit -m "Update Homebrew formula for v1.0.0"
git push
```

## User install

### From this repo (tap)

```bash
brew tap SaiBhargavRallapalli/porthole https://github.com/SaiBhargavRallapalli/porthole
brew install porthole
porthole 3000
```

### One-shot (no tap)

Requires a published GitHub Release matching `version` in the formula (binaries + real `sha256` values).

```bash
brew install https://raw.githubusercontent.com/SaiBhargavRallapalli/porthole/main/Formula/porthole.rb
```

### Local formula file (maintainers)

`brew install --formula Formula/porthole.rb` looks up a **formula name**, not a path. Use `./`:

```bash
cd /path/to/porthole
brew install ./Formula/porthole.rb
```

### Optional: dedicated tap repo

Homebrew convention is a separate repo `homebrew-porthole`:

1. Create `github.com/SaiBhargavRallapalli/homebrew-porthole`
2. Add only `Formula/porthole.rb` (copy from this repo)
3. Users run: `brew tap SaiBhargavRallapalli/porthole` (no URL needed)

## New versions

1. Bump `version` in `Formula/porthole.rb`
2. Tag `vX.Y.Z`, run release workflow (or upload binaries manually)
3. Update all three `sha256` lines
4. Users: `brew update && brew upgrade porthole`
