const fs = require('fs');
const path = require('path');

const src = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-community',
  'cli-platform-apple',
  'build',
  'commands',
  'runCommand',
  'runOnSimulator.js',
);
const dest = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-community',
  'cli-platform-ios',
  'node_modules',
  '@react-native-community',
  'cli-platform-apple',
  'build',
  'commands',
  'runCommand',
  'runOnSimulator.js',
);

if (fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log(
    '✔ Copied patched runOnSimulator.js to nested cli-platform-apple',
  );
} else {
  console.log('⚠ Nested cli-platform-apple not found — skipping');
}
