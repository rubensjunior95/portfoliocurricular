import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = (
  process.env.API_BASE_URL || 'https://portfolio-curricular-api.onrender.com'
)
  .trim()
  .replace(/\/+$/, '');

if (!raw) {
  console.error('API_BASE_URL is required for the production build.');
  process.exit(1);
}

if (!/^https?:\/\//i.test(raw)) {
  console.error(`API_BASE_URL must be an http(s) URL. Received: ${raw}`);
  process.exit(1);
}

const dest = join(root, 'src', 'environments', 'environment.prod.ts');
writeFileSync(
  dest,
  [
    'export const environment = {',
    '  production: true,',
    `  apiBaseUrl: ${JSON.stringify(raw)},`,
    '};',
    '',
  ].join('\n'),
);

console.log(`Wrote production API URL: ${raw}`);
