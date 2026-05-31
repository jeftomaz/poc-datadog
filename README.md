# POC Datadog — Monitoramento de API Node.js

> Disciplina de Manutenção de Software  
> Aluno: Jeferson Tomaz | UNAERP

---

## Objetivo

Demonstrar na prática o uso do Datadog para monitoramento de uma API REST em Node.js, cobrindo APM (rastreamento distribuído), coleta de logs estruturados com correlação de traces, métricas de runtime e alertas automatizados.

---

## Tecnologias

| Componente | Tecnologia | Versão |
|------------|-----------|--------|
| Runtime | Node.js | LTS |
| Framework | Express | 5.2.1 |
| Instrumentação | dd-trace | 5.104.0 |
| Logs | Winston | 3.19.0 |
| Agente | Datadog Agent | 7 |
| Infraestrutura | Docker + Docker Compose | — |

---

## Estrutura do projeto

```
poc-datadog/
├── app/
│   ├── src/
│   │   ├── server.js      # API Express com endpoints de teste
│   │   ├── logger.js      # Winston configurado para JSON com logInjection
│   │   └── tracer.js      # dd-trace inicializado com runtimeMetrics
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml     # Orquestra app + datadog-agent
├── .env                   # Variáveis de ambiente (não versionado — ver .gitignore)
└── .gitignore
```

---

## Pré-requisitos

- Docker Desktop instalado e em execução
- Conta no Datadog (site: `us5.datadoghq.com`)
- API Key do Datadog

---

## Como executar

**1. Clone o repositório e entre na pasta:**
```bash
git clone <url-do-repositorio>
cd poc-datadog
```

**2. Crie o arquivo `.env` na raiz:**
```env
DD_API_KEY=sua_api_key_aqui
DD_SITE=us5.datadoghq.com
DD_SERVICE=poc-datadog-api
DD_ENV=development
DD_VERSION=1.0.0
DD_TAGS=team:manutencao-software,poc:datadog
```

**3. Suba os containers:**
```bash
docker compose up -d
```

**4. Verifique se tudo está rodando:**
```bash
docker compose ps
```

Ambos os serviços (`poc-datadog-app` e `datadog-agent`) devem estar com status `Up`.

**5. Confirme que o Logs Agent está ativo:**
```bash
docker exec datadog-agent agent status | grep -A 10 "Logs Agent"
```

---

## Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check da aplicação |
| GET | `/products` | Lista produtos (resposta simulada) |
| GET | `/slow` | Resposta com delay de 3 segundos (latência intencional) |
| GET | `/error` | Retorna HTTP 500 (erro controlado) |
| GET | `/throw` | Lança exceção não tratada (erro visível no APM com span marcado) |

**Exemplo de uso:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/products
curl http://localhost:3000/slow
curl http://localhost:3000/error
curl http://localhost:3000/throw
```

---

## O que foi implementado

### Etapa 1 — Planejamento
Definição do escopo da POC, escolha de tecnologias e estrutura do projeto.

### Etapa 2 — Execução local
API rodando localmente com logs JSON validados no terminal, confirmando campos `dd.trace_id` e `dd.span_id` nos logs.

### Etapa 4 — Dockerfile
Imagem construída com `node:lts-slim`, HEALTHCHECK configurado no endpoint `/health`.

### Etapa 5 — Docker Compose
Orquestração de dois serviços:
- `app` — a API Node.js
- `datadog-agent` — agente Datadog com APM, logs e DogStatsD habilitados

### Etapa 6 — Observabilidade validada no Datadog

- **APM / Distributed Tracing** — traces chegando para todos os endpoints
- **Error Tracking** — erros de `/error` e `/throw` agrupados automaticamente
- **Runtime Metrics** — heap, GC e event loop do Node coletados via `runtimeMetrics: true`
- **Version Tagging** — rastreamento por versão do serviço
- **Logs Correlation** — logs JSON do Winston correlacionados aos traces via `trace_id`
- **Infrastructure Monitoring** — métricas do container coletadas

### Etapa 7 — Dashboard e Monitor

**Dashboard** (`POC Datadog - poc-datadog-api`):
| Widget | Métrica |
|--------|---------|
| Requisições por segundo | `trace.express.request.hits` |
| Taxa de erros | `trace.express.request.errors` |
| Latência p95 | APM Metrics — p95 Latency |
| Heap Node.js | `runtime.node.heap.used` |

**Monitor** (`[POC] Alta taxa de erros - poc-datadog-api`):
- Tipo: APM Threshold Alert
- Métrica: soma de erros nos últimos 5 minutos
- Warning: > 2 erros | Alert: > 5 erros
- Notificação: email automático ao responsável

---

## Arquitetura de observabilidade

```
┌─────────────────────────────────────────────┐
│                 Docker Network               │
│                                             │
│  ┌──────────────┐       ┌────────────────┐  │
│  │  app         │──────▶│ datadog-agent  │  │
│  │  (Node.js)   │ :8126 │                │  │
│  │              │       │  APM           │  │
│  │  dd-trace    │       │  Logs          │  │
│  │  Winston     │       │  DogStatsD     │  │
│  └──────────────┘       └───────┬────────┘  │
│                                 │            │
└─────────────────────────────────┼────────────┘
                                  │ HTTPS
                                  ▼
                    ┌─────────────────────────┐
                    │  us5.datadoghq.com       │
                    │  APM · Logs · Metrics    │
                    │  Dashboard · Monitors    │
                    └─────────────────────────┘
```

---

## Variáveis de ambiente relevantes

| Variável | Descrição |
|----------|-----------|
| `DD_API_KEY` | Chave de autenticação do Datadog |
| `DD_SITE` | Região do Datadog (us5.datadoghq.com) |
| `DD_SERVICE` | Nome do serviço no Datadog |
| `DD_ENV` | Ambiente (development / production) |
| `DD_VERSION` | Versão da aplicação |
| `DD_AGENT_HOST` | Host do agente (nome do serviço no Compose) |
| `DD_TRACE_AGENT_PORT` | Porta APM do agente (8126) |
| `DD_TAGS` | Tags globais aplicadas a todos os dados |