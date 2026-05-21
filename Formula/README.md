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

Upload these to a GitHub Release tagged `v1.0.0` (version must match `Formula/porthole.rb`).

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
brew audit --strict Formula/porthole.rb
brew install --formula Formula/porthole.rb
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

```bash
brew install --formula https://raw.githubusercontent.com/SaiBhargavRallapalli/porthole/main/Formula/porthole.rb
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
