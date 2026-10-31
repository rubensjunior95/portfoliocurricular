# Portfolio Curricular — Fullstack (Angular + Spring Boot)

Réplica do portfólio de `C:\www\Pessoal\Portfolio` em arquitetura frontend/backend separados:

```
PortfolioCurricular/
├── frontend/   Angular 18, páginas pré-renderizadas → Vercel (Git, 1 deploy por push)
└── backend/    Spring Boot 3 / Java 21 → Render (Git + Blueprint, 1 deploy por push)
```

Cada `git push` em `main` gera **um** deploy de cada lado:
- **Vercel** reconstrói o frontend (integração Git; Root Directory = `frontend`)
- **Render** reconstrói o backend (`render.yaml`; só se mudar algo em `backend/`)

Não use GitHub Actions para publicar na Vercel — isso duplicava o deploy.

## Rodar localmente

Requisitos: Node 18.19+ (20 ou 22 LTS recomendado).

```bash
npm install
npm run dev
```

- Frontend: [http://localhost:4200](http://localhost:4200) (`/` inglês, `/pt`, `/es`)

O site não depende do backend para rodar. Para subir também a API (precisa do [Docker Desktop](https://www.docker.com/products/docker-desktop/) aberto): `npm run dev:full` — Backend em [http://localhost:8080](http://localhost:8080) (`GET /api/portfolio/pt-BR`).

## Como funciona

1. O conteúdo (3 idiomas) fica em `backend/src/main/resources/data/*.json`. A API do **backend** continua servindo esses JSON em `GET /api/portfolio/{pt-BR|en-US|es-ES}`.
2. O **frontend** copia esses JSON para `frontend/src/content/` antes de cada `start` e `build` (`npm run sync:content`) e embute o conteúdo no build. O site abre direto, sem esperar a Render acordar.
3. O build pré-renderiza `/`, `/pt`, `/es`, `/services`, `/pt/services` e `/es/services` (`frontend/prerender-routes.txt`). Cada página sai com o texto, o título, o Open Graph e o hreflang do idioma. `npm run build` termina com `scripts/check-prerender.mjs`, que falha se alguma página sair errada.
4. O workflow **Keep Render awake** (`.github/workflows/keep-alive.yml`) só é necessário se você ainda usar a API publicamente; o site não chama mais a Render.

## Passo a passo

### 1. Backend na Render

1. Conta em [render.com](https://render.com/) com GitHub.
2. Dashboard → **New** → **Blueprint** → repo `portfoliocurricular`, branch `main` → **Apply**.
3. Serviço `portfolio-curricular-api`: Docker em `backend/`, plano Free, health `/api/health`.
4. URL: `https://portfolio-curricular-api.onrender.com`

Não defina `PORT`. Autodeploy já vem ligado.

### 2. Frontend na Vercel

1. [vercel.com/new](https://vercel.com/new) → Import do mesmo repositório.
2. **Root Directory** = `frontend`.
3. Framework **Other**; o `vercel.json` já define build, output e rewrite SPA.
4. **Deploy**.

Em **Settings → Git**:
- Autodeploy em `main` **ligado**
- **Ignored Build Step** deve estar **vazio** (não use `exit 0`)

Não precisa de `VERCEL_TOKEN` / Org ID / Project ID no GitHub.

### 3. Keep-alive (Render Free)

A instância free dorme após **15 min** sem tráfego. O GitHub Actions `Keep Render awake` faz GET em `/api/health` a cada **5 min**, com timeout de 90s — o bastante para o cold start (~1 min).

O **cron-job.org** sozinho não serve: o timeout gratuito é 30s, o wake da Render passa disso, e após ~15 falhas seguidas o job é desativado.

Keep-alive 24h consome as 750 h/mês até o fim do mês. Workflows agendados do GitHub param após 60 dias sem atividade no repositório — um push ou **Run workflow** reativa.

## Editar conteúdo

Textos: edite `backend/src/main/resources/data/*.json`, rode `npm --prefix frontend run sync:content` e faça push com as duas cópias (`backend/.../data` e `frontend/src/content`). A Vercel reconstrói o site; a Render reconstrói a API.
