# Portfolio Curricular — Fullstack (Angular + Spring Boot)

Réplica do portfólio de `C:\www\Pessoal\Portfolio` em arquitetura frontend/backend separados:

```
PortfolioCurricular/
├── frontend/   Angular 18 (SPA) → Vercel (GitHub Actions)
└── backend/    Spring Boot 3 / Java 21 (API REST) → Render (GitHub + Blueprint)
```

Cada `git push` em `main`:
- a **Render** reconstrói o backend sozinha ([integração Git](https://render.com/docs/deploys#automatic-deploys));
- o **GitHub Actions** publica o frontend na Vercel, usando a URL da API.

## Como funciona

1. O **backend** serve todo o conteúdo do portfólio (3 idiomas) em JSON:
   `GET /api/portfolio/{pt-BR|en-US|es-ES}` + `GET /api/health`
2. O **frontend** busca o conteúdo na API conforme o idioma escolhido (seletor PT/EN/ES no header, com cache e persistência em localStorage) e renderiza as mesmas seções do site original: hero, sobre, serviços, experiência, impacto, formação e contato (com QR code do WhatsApp).
3. O **cron-job.org** pinga `https://SEU-APP.onrender.com/api/health` a cada 10 min para a instância free da Render não dormir (ela desliga após 15 min sem tráfego).

## Passo a passo — Render + Vercel

Não precisa de token da Render. O arquivo `render.yaml` na raiz já descreve o serviço.

### 1. Conta e GitHub na Render

1. Crie a conta em [render.com](https://render.com/) (Sign Up com GitHub é o caminho mais simples).
2. No [Dashboard](https://dashboard.render.com), confirme que o GitHub está conectado (**Account Settings → Git** / autorização do GitHub App).

### 2. Subir o backend (Blueprint)

1. Dashboard → **New** → **Blueprint**.
2. Selecione o repositório `rubensjunior95/portfoliocurricular` (branch `main`).
3. A Render lê o `render.yaml` e cria o Web Service `portfolio-curricular-api`:
   - Runtime: **Docker** (`backend/Dockerfile`)
   - Plano: **Free**
   - Health check: `/api/health`
   - Autodeploy a cada commit em `backend/`
4. Clique em **Apply**. Acompanhe o build (Maven + imagem Docker; na primeira vez leva alguns minutos).
5. Quando o status ficar **Live**, copie a URL pública, no formato `https://portfolio-curricular-api.onrender.com` (o sufixo pode variar se o nome estiver ocupado).

**Se o Blueprint não aparecer**, crie na mão:

1. **New** → **Web Service** → conecte o mesmo repositório.
2. Language: **Docker**.
3. Dockerfile Path: `backend/Dockerfile`.
4. Docker Build Context Directory: `backend`.
5. Instance type: **Free**.
6. Health Check Path: `/api/health`.
7. Environment: `CORS_ALLOWED_ORIGINS` = `*` (depois troque pela URL da Vercel).
8. **Create Web Service**.

Não defina `PORT` à mão. A Render injeta essa variável; o Spring já lê `${PORT:8080}`.

### 3. Variável da API no GitHub

Em **Settings → Secrets and variables → Actions → Variables**, crie:

| Variable | Valor |
|---|---|
| `API_BASE_URL` | A URL `https://….onrender.com` do passo 2, **sem** barra no final |

### 4. Secrets da Vercel no GitHub

Ainda em **Actions → Secrets**:

| Secret | Onde obter |
|---|---|
| `VERCEL_TOKEN` | [Vercel → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel → Team Settings → **Team ID** |
| `VERCEL_PROJECT_ID` | Vercel → Project Settings → **Project ID** |

### 5. Projeto na Vercel (uma vez)

1. [vercel.com/new](https://vercel.com/new) → importe este repositório.
2. **Root Directory** = `frontend`.
3. Framework: Other (o `vercel.json` já define build e output).
4. Em **Settings → Git**, Ignored Build Step = `exit 0` (quem publica é o Actions).
5. Copie o **Project ID** para o secret `VERCEL_PROJECT_ID`.

Opcional na Render: depois que o site da Vercel existir, edite `CORS_ALLOWED_ORIGINS` para `https://seu-projeto.vercel.app` e faça um **Manual Deploy**.

### 6. Push

```bash
git add .
git commit -m "CI/CD: backend na Render no lugar da Koyeb"
git push origin main
```

A Render sobe o backend; o Actions sobe o frontend apontando para `API_BASE_URL`.

### 7. cron-job.org (obrigatório no plano Free)

A instância free **dorme após 15 minutos** sem tráfego; o próximo acesso demora ~1 min. Para manter acordada:

1. Conta em https://cron-job.org
2. Job GET a cada **10 minutos** em `https://SEU-APP.onrender.com/api/health`

Há um limite de **750 horas/mês** de instância free. Com o cron ligado o tempo todo, as 750 h acabam no fim do mês (~31 × 24). Se suspender, a API volta no dia 1 do mês seguinte — ou desligue o cron e aceite o cold start.

## Editar conteúdo

O conteúdo mora em `backend/src/main/resources/data/*.json` — edite, commit e push; a Render faz o redeploy do backend.
