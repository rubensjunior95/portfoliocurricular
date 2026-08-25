# Portfolio Curricular — Fullstack (Angular + Spring Boot)

Réplica do portfólio de `C:\www\Pessoal\Portfolio` em arquitetura frontend/backend separados:

```
PortfolioCurricular/
├── frontend/   Angular 18 (SPA) → Vercel
└── backend/    Spring Boot 3 / Java 21 (API REST) → Koyeb
```

Cada `git push` em `main` dispara o GitHub Actions: o backend sobe na Koyeb e, em seguida, o frontend sobe na Vercel apontando para a URL real da API.

## Como funciona

1. O **backend** serve todo o conteúdo do portfólio (3 idiomas) em JSON:
   `GET /api/portfolio/{pt-BR|en-US|es-ES}` + `GET /api/health`
2. O **frontend** busca o conteúdo na API conforme o idioma escolhido (seletor PT/EN/ES no header, com cache e persistência em localStorage) e renderiza as mesmas seções do site original: hero, sobre, serviços, experiência, impacto, formação e contato (com QR code do WhatsApp).
3. O **cron-job.org** pinga `https://SEU-APP.koyeb.app/api/health` a cada 5–10 min para a instância free da Koyeb não dormir.

## CI/CD (push → produção)

Arquivo: `.github/workflows/deploy.yml`.

### 1. Repositório no GitHub

Na pasta do projeto:

```bash
git init -b main
git add .
git commit -m "Initial commit: portfolio fullstack com CI/CD"
```

Crie o repositório no GitHub (público, para a Koyeb clonar o Dockerfile sem GitHub App) e:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
```

Ainda **não** dê push — configure os secrets abaixo primeiro.

### 2. Secrets do GitHub

Em **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Onde obter |
|---|---|
| `KOYEB_API_TOKEN` | [Koyeb → Settings → API](https://app.koyeb.com/settings/api) |
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel → Team/Account Settings → General → **Team ID** |
| `VERCEL_PROJECT_ID` | Vercel → Project Settings → General → **Project ID** (veja o passo 3) |

Variáveis opcionais (**Settings → Secrets and variables → Actions → Variables**):

| Variable | Quando usar |
|---|---|
| `API_BASE_URL` | Se o workflow não descobrir sozinho a URL `*.koyeb.app` |
| `CORS_ALLOWED_ORIGINS` | URL da Vercel (ex. `https://seu-projeto.vercel.app`). Sem isso, o CORS fica `*` |
| `KOYEB_APP_NAME` | Padrão: `portfolio-curricular` |
| `KOYEB_SERVICE_NAME` | Padrão: `backend` |

### 3. Projeto na Vercel (uma vez)

1. [vercel.com/new](https://vercel.com/new) → importe este repositório.
2. **Root Directory** = `frontend`.
3. Framework: Other (o `vercel.json` já define build e output).
4. Em **Settings → Git**, evite deploy duplicado: use o GitHub Actions como fonte da verdade. Uma opção é **Ignored Build Step** = `exit 0` (a Vercel ignora o push; o Actions publica com `vercel deploy`).
5. Copie o **Project ID** para o secret `VERCEL_PROJECT_ID`.

Não é necessário definir `API_BASE_URL` na Vercel: o Actions injeta a URL da Koyeb no build.

### 4. Push

```bash
git push -u origin main
```

Acompanhe em **Actions**. O job do backend cria (ou atualiza) o serviço free na Koyeb; o do frontend gera o site na Vercel já apontando para essa API.

### 5. cron-job.org

Quando a Koyeb ficar healthy, crie um job GET a cada 5 ou 10 minutos para `https://SEU-APP.koyeb.app/api/health`.

## Editar conteúdo

O conteúdo (textos, experiências, serviços, traduções) mora em `backend/src/main/resources/data/*.json` — edite, faça commit e push; o Actions faz o redeploy do backend.
