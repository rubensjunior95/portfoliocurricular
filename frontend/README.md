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

O build pré-renderiza as rotas de `prerender-routes.txt` e depois roda `scripts/check-prerender.mjs`, que confere idioma, título, canonical, imagem de compartilhamento e hreflang de cada página e a presença de `robots.txt`, `sitemap.xml`, favicon e manifesto.

## Deploy

Um deploy por push em `main`, pela integração Git da Vercel (Root Directory = `frontend`). O `vercel.json` define o output, o cache dos arquivos com hash e o rewrite de fallback para `/index.html`. Arquivos estáticos (as páginas pré-renderizadas, `robots.txt`, `sitemap.xml`) têm precedência sobre o rewrite.

## Estrutura

- `src/content` — conteúdo nos três idiomas
- `src/app/core` — modelos, `PortfolioService` (idioma pela URL, metadados por página) e o download do CV ATS
- `src/app/pages/home` — página principal
- `src/app/pages/services` — página de serviços
- `src/app/shared` — header, footer, ícones, menu do CV, currículo para impressão e fundo animado
- `public` — favicon, ícones, imagem de compartilhamento, `robots.txt`, `sitemap.xml`, marca da Kodeskill
- `src/styles.css` — design system (marinho + azul elétrico da Kodeskill) e o currículo ATS para impressão
