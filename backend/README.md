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
docker run -p 8080:8080 portfolio-backend
```

## Deploy na Koyeb

O push em `main` publica este serviço automaticamente via GitHub Actions (`.github/workflows/deploy.yml` na raiz do monorepo): Dockerfile em `backend/`, instância **free**, porta `8080`, health check `/api/health`.

Configuração aplicada pelo workflow:

- `PORT=8080` (a aplicação já lê `${PORT:8080}`).
- `CORS_ALLOWED_ORIGINS` — variável de repositório no GitHub; padrão `*`.
- Work directory: `backend`.

A conta Koyeb permite **um** serviço free. Se já existir outro, pause-o ou use um nome de app/serviço diferente (`KOYEB_APP_NAME` / `KOYEB_SERVICE_NAME`).

## Keep-alive com cron-job.org

A instância free da Koyeb pode "adormecer" sem tráfego. Para evitar:

1. Crie conta em https://cron-job.org (gratuito).
2. **Create cronjob**:
   - URL: `https://SEU-APP.koyeb.app/api/health`
   - Schedule: a cada **5 ou 10 minutos** (ex.: `*/5 * * * *`).
   - Method: GET. Ative notificação de falha se quiser monitoramento.
3. Pronto — o ping periódico mantém a máquina acordada e ainda funciona como monitor de uptime.

## Editar o conteúdo do portfólio

Todo o conteúdo fica em `src/main/resources/data/{pt-BR,en-US,es-ES}.json`. Edite os JSONs e faça novo deploy — nenhuma alteração de código é necessária.
