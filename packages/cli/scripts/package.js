#!/usr/bin/env node
// Builds standalone binaries using @vercel/pkg.
// Run: npm run package   (from packages/cli)

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const TARGETS = [
  { target: 'node20-macos-arm64', output: 'porthole-macos-arm64' },
  { target: 'node20-macos-x64',   output: 'porthole-macos-x64'   },
  { target: 'node20-linux-x64',   output: 'porthole-linux-x64'   },
  { target: 'node20-win-x64',     output: 'porthole-win-x64.exe' },
];

// Optional: PKG_TARGETS=porthole-macos-arm64,porthole-linux-x64 (for split CI runners)
const filter = process.env.PKG_TARGETS?.split(',').map((s) => s.trim()).filter(Boolean);
const selected = filter?.length
  ? TARGETS.filter((t) => filter.includes(t.output))
  : TARGETS;

if (!selected.length) {
  console.error('No pkg targets matched PKG_TARGETS=%s', process.env.PKG_TARGETS);
  process.exit(1);
}

const binDir = path.join(__dirname, '..', 'binaries');
fs.mkdirSync(binDir, { recursive: true });

for (const { target, output } of selected) {
  const outPath = path.join(binDir, output);
  console.log(`Building ${output}…`);
  execSync(
    `node_modules/.bin/pkg dist/cli.js --target ${target} --output ${outPath} --compress GZip`,
    { stdio: 'inherit', cwd: path.join(__dirname, '..') },
  );
}

console.log('\nAll binaries written to packages/cli/binaries/');
console.log('\nSHA-256 checksums:');
for (const { output } of selected) {
  const outPath = path.join(binDir, output);
  if (fs.existsSync(outPath)) {
    const hash = require('crypto')
      .createHash('sha256')
      .update(fs.readFileSync(outPath))
      .digest('hex');
    console.log(`  ${hash}  ${output}`);
  }
}
