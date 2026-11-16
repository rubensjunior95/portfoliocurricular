// Gera public/resume-{en,pt,es}.pdf a partir do build pré-renderizado,
// imprimindo cada idioma com o Chrome/Edge instalado (headless, protocolo DevTools).
// Uso: npm run cv:pdf (faz o build antes). CHROME_PATH sobrepõe a detecção do navegador.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve('dist', 'portfolio-frontend', 'browser');
const publicDir = resolve('public');

/** Rota pré-renderizada de cada idioma → arquivo publicado e título do PDF. */
const RESUMES = [
  { path: '/', lang: 'en-US', file: 'resume-en.pdf', title: 'Rubens Florentino Freitas Junior - Resume' },
  { path: '/pt', lang: 'pt-BR', file: 'resume-pt.pdf', title: 'Rubens Florentino Freitas Junior - Currículo' },
  { path: '/es', lang: 'es-ES', file: 'resume-es.pdf', title: 'Rubens Florentino Freitas Junior - Currículum' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

if (!existsSync(join(root, 'index.html'))) {
  fail(`build não encontrado em ${root}. Rode "npm run cv:pdf" (que faz o build) ou "ng build" antes.`);
}

const server = await serve(root);
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const browser = await launchBrowser();

try {
  for (const resume of RESUMES) {
    const pdf = await printResume(browser.cdp, baseUrl + resume.path, resume);
    const target = join(publicDir, resume.file);
    writeFileSync(target, pdf);
    const pages = countPages(pdf);
    console.log(`ok   ${resume.file}  ${(pdf.length / 1024).toFixed(1)} KB  ${pages} página(s)`);
  }
} finally {
  await browser.close();
  server.close();
}

async function printResume(cdp, url, resume) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  try {
    await cdp.send('Page.enable', {}, sessionId);
    const loaded = cdp.waitFor('Page.loadEventFired', sessionId, 30_000);
    await cdp.send('Page.navigate', { url }, sessionId);
    await loaded;

    // O currículo entra por @defer (on idle); espera ele, o idioma certo e as fontes.
    const check = await evaluate(
      cdp,
      sessionId,
      `(async () => {
        const deadline = Date.now() + 20000;
        while (!document.querySelector('.cv-print.cv-ats h1') && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 100));
        }
        await document.fonts.ready;
        const cv = document.querySelector('.cv-print.cv-ats');
        document.title = ${JSON.stringify(resume.title)};
        return {
          rendered: !!cv,
          lang: cv?.getAttribute('lang') ?? null,
          font: document.fonts.check('12px "Hanken Grotesk"'),
        };
      })()`,
    );
    if (!check.rendered) throw new Error(`currículo não renderizou em ${url}`);
    if (check.lang !== resume.lang) throw new Error(`idioma ${check.lang} em ${url}, esperado ${resume.lang}`);
    if (!check.font) console.warn(`aviso: Hanken Grotesk não carregou em ${url}; o PDF usa a fonte de fallback.`);

    // Tamanho e margens vêm do @page de styles.css (A4, 10 mm), o mesmo da impressão do site.
    // Sem fundos, como o padrão do diálogo de impressão: o tema escuro do site não vaza para as margens.
    const { data } = await cdp.send(
      'Page.printToPDF',
      {
        preferCSSPageSize: true,
        printBackground: false,
        displayHeaderFooter: false,
        generateTaggedPDF: true,
        transferMode: 'ReturnAsBase64',
      },
      sessionId,
    );
    const pdf = Buffer.from(data, 'base64');
    if (pdf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new Error(`saída inválida para ${url}`);
    return pdf;
  } finally {
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
  }
}

async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
}

/** Conta os objetos /Type /Page (o Chrome não comprime a árvore de páginas). */
function countPages(pdf) {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;
}

/** Servidor estático mínimo sobre o build, com as páginas pré-renderizadas. */
function serve(dir) {
  const srv = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = resolve(dir, '.' + pathname);
    if (file !== dir && !file.startsWith(dir + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) file = join(dir, 'index.html');
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((ok, ko) => {
    srv.once('error', ko);
    srv.listen(0, '127.0.0.1', () => ok(srv));
  });
}

function findBrowser() {
  const env = process.env.CHROME_PATH;
  if (env) {
    if (!existsSync(env)) fail(`CHROME_PATH aponta para um arquivo inexistente: ${env}`);
    return env;
  }
  const programFiles = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
  const candidates = [
    ...programFiles.flatMap((base) => [
      join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ]),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ];
  const found = candidates.find((path) => existsSync(path));
  if (!found) fail('Chrome/Edge não encontrado. Instale um deles ou defina CHROME_PATH.');
  return found;
}

async function launchBrowser() {
  const executable = findBrowser();
  const profile = mkdtempSync(join(tmpdir(), 'resume-pdf-'));
  const child = spawn(
    executable,
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-gpu',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  // O navegador grava a porta escolhida em DevToolsActivePort.
  const portFile = join(profile, 'DevToolsActivePort');
  const deadline = Date.now() + 20_000;
  while (!existsSync(portFile) || readFileSync(portFile, 'utf8').split('\n').length < 2) {
    if (child.exitCode !== null) fail(`o navegador encerrou ao iniciar (${executable}).`);
    if (Date.now() > deadline) {
      child.kill();
      fail('o navegador não abriu a porta de depuração em 20 s.');
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  const [port, path] = readFileSync(portFile, 'utf8').trim().split('\n');
  const cdp = await connect(`ws://127.0.0.1:${port.trim()}${path.trim()}`);

  return {
    cdp,
    async close() {
      await cdp.send('Browser.close').catch(() => {});
      cdp.socket.close();
      await new Promise((r) => (child.exitCode !== null ? r() : child.once('exit', r)));
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    },
  };
}

/** Cliente mínimo do protocolo DevTools sobre o WebSocket nativo do Node (22+). */
function connect(url) {
  if (typeof WebSocket === 'undefined') fail('este script precisa do WebSocket nativo (Node 22 ou superior).');
  const socket = new WebSocket(url);
  const pending = new Map();
  const listeners = new Set();
  let nextId = 0;

  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id !== undefined) {
      const call = pending.get(msg.id);
      if (!call) return;
      pending.delete(msg.id);
      if (msg.error) call.reject(new Error(`${call.method}: ${msg.error.message}`));
      else call.resolve(msg.result);
      return;
    }
    for (const listener of listeners) listener(msg);
  });

  const client = {
    socket,
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      return new Promise((resolve, reject) => pending.set(id, { method, resolve, reject }));
    },
    waitFor(method, sessionId, timeout) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          listeners.delete(listener);
          reject(new Error(`tempo esgotado esperando ${method}`));
        }, timeout);
        const listener = (msg) => {
          if (msg.method !== method || msg.sessionId !== sessionId) return;
          clearTimeout(timer);
          listeners.delete(listener);
          resolve(msg.params);
        };
        listeners.add(listener);
      });
    },
  };

  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () => resolve(client), { once: true });
    socket.addEventListener('error', () => reject(new Error(`falha ao conectar em ${url}`)), { once: true });
  });
}

function fail(message) {
  console.error(`erro: ${message}`);
  process.exit(1);
}
