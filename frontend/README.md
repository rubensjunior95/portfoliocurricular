# Portfolio Frontend — Angular

SPA em Angular 18 (standalone components + signals) que replica o portfólio curricular de Rubens Florentino. Consome o conteúdo (pt-BR / en-US / es-ES) do backend Spring Boot hospedado na Render.

## Rodar localmente

Requisitos: Node 18.19+ (ou 20 LTS).

```bash
npm install
npm start
# http://localhost:4200 (backend precisa estar rodando em :8080)
```

Em desenvolvimento a API é `http://localhost:8080` (`src/environments/environment.ts`). Em produção o build usa `src/environments/environment.prod.ts` (`https://portfolio-curricular-api.onrender.com`).

## Build de produção (local)

```bash
# usa o placeholder de environment.prod.ts — só para validar o bundle
npm run build
# saída em dist/portfolio-frontend/browser

# build igual ao CI, exigindo a URL real da Render
set API_BASE_URL=https://SEU-APP.onrender.com
npm run build:ci
```

## Deploy

O deploy de produção é **um por push** em `main`, pela integração Git da Vercel (Root Directory = `frontend`). Não use GitHub Actions para publicar — duplica o deploy. O `vercel.json` define o output SPA e o rewrite `/* → /index.html`.

## Estrutura

- `src/app/core` — modelos + `PortfolioService` (estado, idioma, cache, chamadas à API)
- `src/app/pages/home` — página principal (hero, sobre, serviços, experiência, impacto, formação, contato)
- `src/app/pages/services` — página completa de serviços
- `src/app/shared` — header (com seletor de idioma), footer, estado de loading
- `src/styles.css` — design system (tema dark esmeralda, réplica do original)
