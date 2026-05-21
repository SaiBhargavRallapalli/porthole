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

const binDir = path.join(__dirname, '..', 'binaries');
fs.mkdirSync(binDir, { recursive: true });

for (const { target, output } of TARGETS) {
  const outPath = path.join(binDir, output);
  console.log(`Building ${output}…`);
  execSync(
    `npx pkg dist/cli.js --target ${target} --output ${outPath} --compress GZip`,
    { stdio: 'inherit', cwd: path.join(__dirname, '..') },
  );
}

console.log('\nAll binaries written to packages/cli/binaries/');
console.log('\nSHA-256 checksums:');
for (const { output } of TARGETS) {
  const outPath = path.join(binDir, output);
  if (fs.existsSync(outPath)) {
    const hash = require('crypto')
      .createHash('sha256')
      .update(fs.readFileSync(outPath))
      .digest('hex');
    console.log(`  ${hash}  ${output}`);
  }
}
