import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSdk =
  process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Android', 'sdk')
    : path.join(os.homedir(), 'Android', 'Sdk');

const sdkDir = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? defaultSdk;

if (!fs.existsSync(sdkDir)) {
  console.error(
    `Android SDK not found at ${sdkDir}.\n` +
      'Install Android Studio or set ANDROID_HOME to your SDK path.',
  );
  process.exit(1);
}

const androidDir = path.join(root, 'android');
if (!fs.existsSync(androidDir)) {
  console.error('android/ not found. Run: npx expo prebuild --platform android');
  process.exit(1);
}

const escaped = sdkDir.replace(/\\/g, '\\\\');
const localProps = path.join(androidDir, 'local.properties');
fs.writeFileSync(localProps, `sdk.dir=${escaped}\n`);
console.log(`Wrote ${localProps} (sdk.dir=${sdkDir})`);
