import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const out = join('dist', 'portfolio-frontend', 'browser');
const pages = [
  { file: 'index.html', lang: 'en-US', h1: 'Rubens Florentino Freitas Junior' },
  { file: 'pt/index.html', lang: 'pt-BR', h1: 'Rubens Florentino Freitas Junior' },
  { file: 'es/index.html', lang: 'es-ES', h1: 'Rubens Florentino Freitas Junior' },
  { file: 'services/index.html', lang: 'en-US' },
  { file: 'pt/services/index.html', lang: 'pt-BR' },
  { file: 'es/services/index.html', lang: 'es-ES' },
];

let failed = false;
const pick = (html, re) => html.match(re)?.[1] ?? null;

for (const page of pages) {
  const path = join(out, page.file);
  if (!existsSync(path)) {
    console.error(`missing ${page.file}`);
    failed = true;
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const result = {
    lang: pick(html, /<html[^>]*lang="([^"]+)"/),
    title: pick(html, /<title>([^<]*)/),
    canonical: pick(html, /rel="canonical" href="([^"]+)"/),
    ogImage: pick(html, /property="og:image" content="([^"]+)"/),
    hreflang: (html.match(/hreflang="/g) ?? []).length,
    h1: pick(html, /<h1[^>]*>\s*([^<]*?)\s*</),
  };
  // A imagem de compartilhamento precisa existir no build (o ?v= só invalida cache).
  const ogFile = result.ogImage ? new URL(result.ogImage, 'https://localhost/').pathname.slice(1) : null;
  const ok =
    result.lang === page.lang &&
    !!result.title &&
    !!result.canonical &&
    !!ogFile &&
    existsSync(join(out, ogFile)) &&
    result.hreflang >= 4 &&
    (!page.h1 || result.h1 === page.h1);
  if (!ok) failed = true;
  console.log(ok ? 'ok  ' : 'FAIL', page.file, JSON.stringify(result));
}

for (const file of ['robots.txt', 'sitemap.xml', 'favicon.ico', 'og-image.png', 'site.webmanifest']) {
  const present = existsSync(join(out, file));
  if (!present) failed = true;
  console.log(present ? 'ok  ' : 'FAIL', file);
}

// Currículos ATS gerados por `npm run cv:pdf` e versionados em public/.
for (const file of ['resume-en.pdf', 'resume-pt.pdf', 'resume-es.pdf']) {
  const path = join(out, file);
  const present = existsSync(path);
  const valid = present && readFileSync(path).subarray(0, 5).toString('latin1') === '%PDF-';
  if (!valid) failed = true;
  const detail = !present ? '(ausente: rode npm run cv:pdf)' : valid ? `${(statSync(path).size / 1024).toFixed(1)} KB` : '(não é PDF)';
  console.log(valid ? 'ok  ' : 'FAIL', file, detail);
}

process.exit(failed ? 1 : 0);
