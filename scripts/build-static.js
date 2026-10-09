const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const outputDir = path.join(root, 'dist');
const config = readEnv(path.join(root, '.env'));

for (const name of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ADMIN_EMAIL']) {
  if (!config[name] || config[name].includes('YOUR_') || config[name] === 'admin@example.com') {
    throw new Error(`Set ${name} in the build environment or project .env file.`);
  }
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.cpSync(publicDir, outputDir, { recursive: true });
const vendorDir = path.join(outputDir, 'vendor');
fs.mkdirSync(vendorDir, { recursive: true });
fs.copyFileSync(
  path.join(root, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js'),
  path.join(vendorDir, 'supabase.js')
);
fs.copyFileSync(
  path.join(root, 'node_modules/@supabase/supabase-js/LICENSE'),
  path.join(vendorDir, 'supabase-LICENSE')
);
const publicConfig = {
  url: config.SUPABASE_URL,
  publishableKey: config.SUPABASE_PUBLISHABLE_KEY,
  adminEmail: config.SUPABASE_ADMIN_EMAIL
};
fs.writeFileSync(
  path.join(outputDir, 'supabase-config.js'),
  `window.PORTFOLIO_SUPABASE_CONFIG = ${JSON.stringify(publicConfig)};\n`
);
console.log('Static site built in dist/.');

function readEnv(file) {
  const values = { ...process.env };
  if (!fs.existsSync(file)) return values;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in values) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}
