# Portfolio Frontend — Angular

Angular 18 (standalone components + signals) com páginas pré-renderizadas no build. Identidade visual da Kodeskill. O conteúdo (pt-BR / en-US / es-ES) vem embutido de `src/content/*.json`, cópia de `../backend/src/main/resources/data`.

## Rodar localmente

Requisitos: Node 18.19+ (20 ou 22 LTS recomendado).

```bash
npm install
npm start
# http://localhost:4200  →  /  (inglês), /pt, /es
```

`npm start` e `npm run build` copiam o conteúdo do backend antes (`npm run sync:content`). Se a pasta do backend não existir, o build usa a cópia versionada em `src/content`.

## Build de produção

```bash
npm run build
# saída em dist/portfolio-frontend/browser
```

O build pré-renderiza as rotas de `prerender-routes.txt` e depois roda `scripts/check-prerender.mjs`, que confere idioma, título, canonical, imagem de compartilhamento e hreflang de cada página e a presença de `robots.txt`, `sitemap.xml`, favicon, manifesto e dos três PDFs do currículo.

## Currículo em PDF

O botão de download do CV aponta para arquivos estáticos com URL fixa, para anexar no ATS ou mandar por link: `/resume-en.pdf`, `/resume-pt.pdf` e `/resume-es.pdf`. Eles ficam versionados em `public/` e são gerados a partir do layout ATS de impressão (`src/app/shared/cv-print.component.ts` + `@media print` de `src/styles.css`): A4, uma coluna, texto selecionável, links clicáveis e título nos metadados.

**Depois de mudar o conteúdo (`src/content/*.json`) ou o layout de impressão, regere e commite os PDFs:**

```bash
npm run cv:pdf
```

O script (`scripts/build-resume-pdf.mjs`) faz o build, serve o resultado localmente e imprime `/`, `/pt` e `/es` com o Chrome ou Edge instalado na máquina, em modo headless, pelo protocolo DevTools. Precisa do Node 22+ (WebSocket nativo) e de internet para a fonte do Google Fonts. Se o navegador não for encontrado, defina `CHROME_PATH`. A Vercel não tem Chrome no build, por isso o deploy usa os PDFs commitados e `npm run build` falha se algum deles faltar.

## Deploy

Um deploy por push em `main`, pela integração Git da Vercel (Root Directory = `frontend`). O `vercel.json` define o output, o cache dos arquivos com hash e o rewrite de fallback para `/index.html`. Arquivos estáticos (as páginas pré-renderizadas, `robots.txt`, `sitemap.xml`) têm precedência sobre o rewrite.

## Estrutura

- `src/content` — conteúdo nos três idiomas
- `src/app/core` — modelos, `PortfolioService` (idioma pela URL, metadados por página) e os links do CV ATS em PDF
- `src/app/pages/home` — página principal
- `src/app/pages/services` — página de serviços
- `src/app/shared` — header, footer, ícones, menu do CV, currículo para impressão e fundo animado
- `public` — favicon, ícones, imagem de compartilhamento, `robots.txt`, `sitemap.xml`, marca da Kodeskill e os PDFs do currículo
- `src/styles.css` — design system (marinho + azul elétrico da Kodeskill) e o currículo ATS para impressão
