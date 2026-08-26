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

### 4. Colocar o frontend na Vercel (passo a passo)

Faça **primeiro** o projeto na Vercel. Só depois existem o **Project ID** e o **Org ID**. O token é da sua conta, não do projeto.

#### 4.1 Conta e GitHub

1. Abra [vercel.com](https://vercel.com/) → **Sign Up** com o mesmo GitHub do repositório (`rubensjunior95`).
2. Autorize a Vercel a ver o repo `portfoliocurricular`.

#### 4.2 Criar o projeto

1. Abra [vercel.com/new](https://vercel.com/new) → **Import** no repositório `portfoliocurricular`.
2. Em **Root Directory**, clique em **Edit** e escolha **`frontend`** (obrigatório: o Angular não está na raiz).
3. Confira (o `frontend/vercel.json` já define isso; se a tela pedir, use os mesmos valores):
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/portfolio-frontend/browser`
   - Install Command: `npm ci`
4. **Não** precisa de variável de ambiente na Vercel (`API_BASE_URL` fica no GitHub; o Actions grava no build).
5. Clique em **Deploy**. O primeiro deploy pode sair com API errada — isso se corrige no passo 4.5. Anote a URL `https://….vercel.app`.

#### 4.3 Evitar deploy duplicado

1. No projeto: **Settings → Git**.
2. Em **Ignored Build Step**, coloque `exit 0` e salve.  
   Assim a Vercel **não** publica no push; quem publica é o GitHub Actions.

#### 4.4 Onde copiar Token, Org ID e Project ID

Coloque os três em GitHub → o repositório → **Settings → Secrets and variables → Actions → Secrets**.

**1. `VERCEL_TOKEN`** ([documentação](https://vercel.com/docs/accounts/access-tokens))

1. Abra [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. **Create** → nome `github-actions-portfolio`.
3. **Scope: Full Account** ou o **Team** dono do projeto. **Não** escolha um único projeto — o CLI falha com token só de projeto (`Could not retrieve Project Settings`).
4. **Create** e **copie na hora** — a Vercel **não mostra de novo**.

**2. `VERCEL_ORG_ID`** — sempre o **Team ID** (`team_…`), também no plano Hobby

O Hobby tem um time pessoal. **Não use o User ID** da Account Settings (é isso que quebra o `vercel pull`).

1. No canto superior esquerdo da Vercel, clique no **nome do time** (o workspace do projeto, não “Account Settings”).
2. **Settings → General → Team ID** (começa com `team_`).
3. Ou, **dentro do projeto**, olhe a URL / o time no topo e abra as settings **desse** time.

**3. `VERCEL_PROJECT_ID`**

1. Abra o projeto que você importou.
2. **Settings → General**.
3. Role até **Project ID** (começa com `prj_`) e copie.

| Secret no GitHub | O que colar | Onde está |
|---|---|---|
| `VERCEL_TOKEN` | token (uma vez só na tela) | [vercel.com/account/tokens](https://vercel.com/account/tokens) — scope **Full Account** ou **Team** |
| `VERCEL_ORG_ID` | `team_…` | Time do projeto → **Settings → General → Team ID** |
| `VERCEL_PROJECT_ID` | `prj_…` | Projeto → **Settings → General** |

Depois de corrigir os secrets, rode de novo **Actions → Deploy frontend → Run workflow**.

#### 4.5 Ligar a API no frontend

No GitHub, **Settings → Secrets and variables → Actions → Variables**:

| Variable | Valor |
|---|---|
| `API_BASE_URL` | URL da Render, sem `/` no final (`https://….onrender.com`) |

Rode o workflow **Deploy frontend** (push em `main` ou **Actions → Run workflow**). O site na Vercel passa a chamar a API certa.

Opcional na Render: `CORS_ALLOWED_ORIGINS` = `https://seu-projeto.vercel.app` e um **Manual Deploy**.

### 5. Push

```bash
git add .
git commit -m "CI/CD: backend na Render no lugar da Koyeb"
git push origin main
```

A Render sobe o backend; o Actions sobe o frontend apontando para `API_BASE_URL`.

### 6. cron-job.org (obrigatório no plano Free)

A instância free **dorme após 15 minutos** sem tráfego; o próximo acesso demora ~1 min. Para manter acordada:

1. Conta em https://cron-job.org
2. Job GET a cada **10 minutos** em `https://SEU-APP.onrender.com/api/health`

Há um limite de **750 horas/mês** de instância free. Com o cron ligado o tempo todo, as 750 h acabam no fim do mês (~31 × 24). Se suspender, a API volta no dia 1 do mês seguinte — ou desligue o cron e aceite o cold start.

## Editar conteúdo

O conteúdo mora em `backend/src/main/resources/data/*.json` — edite, commit e push; a Render faz o redeploy do backend.
