# Portfolio Curricular — Fullstack (Angular + Spring Boot)

Réplica do portfólio de `C:\www\Pessoal\Portfolio` em arquitetura frontend/backend separados:

```
PortfolioCurricular/
├── frontend/   Angular 18 (SPA) → Vercel (Git, 1 deploy por push)
└── backend/    Spring Boot 3 / Java 21 → Render (Git + Blueprint, 1 deploy por push)
```

Cada `git push` em `main` gera **um** deploy de cada lado:
- **Vercel** reconstrói o frontend (integração Git; Root Directory = `frontend`)
- **Render** reconstrói o backend (`render.yaml`; só se mudar algo em `backend/`)

Não use GitHub Actions para publicar na Vercel — isso duplicava o deploy.

## Rodar localmente

Requisitos: Node 18.19+ e [Docker Desktop](https://www.docker.com/products/docker-desktop/). O backend sobe no Docker com Java 21 (Maven não precisa estar instalado na máquina).

```bash
npm install
npm run dev
```

- Frontend: [http://localhost:4200](http://localhost:4200)
- Backend: [http://localhost:8080](http://localhost:8080) (`GET /api/portfolio/pt-BR`)

Na primeira vez o Maven baixa as dependências dentro do container; as seguintes ficam em cache. Para subir só um dos lados: `npm run backend` ou `npm run frontend`.

## Como funciona

1. O **backend** serve o conteúdo (3 idiomas) em JSON:
   `GET /api/portfolio/{pt-BR|en-US|es-ES}` + `GET /api/health`
2. O **frontend** busca a API conforme o idioma (PT/EN/ES) e monta as seções.
3. A URL de produção da API está em `frontend/src/environments/environment.prod.ts`.
4. O **cron-job.org** pinga `https://portfolio-curricular-api.onrender.com/api/health` a cada 10 min para a instância free da Render não dormir.

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

### 3. cron-job.org

GET a cada **10 minutos**: `https://portfolio-curricular-api.onrender.com/api/health`

A instância free dorme após 15 min sem tráfego. Cron 24h consome as 750 h/mês até o fim do mês.

## Editar conteúdo

Textos: `backend/src/main/resources/data/*.json` → push → Render faz o deploy.

URL da API: `frontend/src/environments/environment.prod.ts` → push → Vercel faz o deploy.
