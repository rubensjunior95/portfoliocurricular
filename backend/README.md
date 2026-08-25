# Portfolio Backend — Spring Boot

API REST que serve o conteúdo do portfólio curricular de Rubens Florentino em três idiomas (pt-BR, en-US, es-ES), consumida pelo frontend Angular hospedado na Vercel.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Health check (mesma resposta de `/api/health`) |
| GET | `/api/health` | Status do serviço — **use esta URL no cron-job.org** |
| GET | `/api/portfolio/locales` | Idiomas disponíveis |
| GET | `/api/portfolio/{locale}` | Conteúdo completo (`pt-BR`, `en-US`, `es-ES`; aceita também `pt`, `en`, `es`) |

## Rodar localmente

Requisitos: Java 21 + Maven.

```bash
mvn spring-boot:run
# http://localhost:8080/api/portfolio/pt-BR
```

Ou via Docker:

```bash
docker build -t portfolio-backend .
docker run -p 8080:8080 -e PORT=8080 portfolio-backend
```

## Deploy na Render

O `render.yaml` na raiz do monorepo define o Web Service Docker. Passo a passo completo no README da raiz.

Resumo:

1. [Dashboard Render](https://dashboard.render.com) → **New** → **Blueprint** → este repositório.
2. Plano **Free**, Dockerfile `backend/Dockerfile`, health `/api/health`.
3. A Render injeta `PORT`. Opcional: `CORS_ALLOWED_ORIGINS` = URL da Vercel (padrão no Blueprint: `*`).

## Keep-alive com cron-job.org

A instância free da Render dorme após **15 minutos** sem tráfego ([docs](https://render.com/docs/free#spinning-down-on-idle)). Para evitar:

1. Conta em https://cron-job.org (gratuito).
2. **Create cronjob**:
   - URL: `https://SEU-APP.onrender.com/api/health`
   - Schedule: a cada **10 minutos**.
   - Method: GET.
3. Lembrete: 750 horas free/mês. Cron 24h esgota o quota no fim do mês.

## Editar o conteúdo do portfólio

Todo o conteúdo fica em `src/main/resources/data/{pt-BR,en-US,es-ES}.json`. Edite os JSONs e faça novo deploy — nenhuma alteração de código é necessária.
