import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'backend', 'src', 'main', 'resources', 'data');
const target = join(root, 'src', 'content');
const locales = ['pt-BR', 'en-US', 'es-ES'];

if (!existsSync(source)) {
  console.log('Backend content not found; using the committed copy in src/content.');
  process.exit(0);
}

mkdirSync(target, { recursive: true });
for (const locale of locales) {
  copyFileSync(join(source, `${locale}.json`), join(target, `${locale}.json`));
}
console.log(`Synced ${locales.length} locales into src/content.`);
