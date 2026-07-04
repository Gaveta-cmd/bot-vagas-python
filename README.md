# Bot de Vagas 🔍

![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

Coleta automatizada de vagas de emprego em tecnologia com dashboard web interativo. Busca em múltiplas APIs públicas, filtra por critérios customizados e exibe tudo num dashboard com gráficos e exportação.

---

## Screenshots

### Dashboard — Lista de Vagas
![Vault Dashboard](docs/screenshots/dashboard-vagas.png)

### Gráficos e Métricas
![Audit Log](docs/screenshots/dashboard-graficos.png)

---

## Funcionalidades

| Feature | Descrição |
|---------|-----------|
| Busca multi-fonte | RemoteOK, Jobicy, Arbeitnow em paralelo |
| Filtros avançados | Tecnologia, senioridade, localização, salário, tipo |
| Dashboard web | Interface dark com stats cards, tabela e gráficos |
| Gráficos interativos | Por tecnologia, fonte, salário médio, localização |
| Exportação CSV/Excel | Download direto pelo dashboard |
| Deduplicação inteligente | Por ID e por título+empresa (cross-source) |
| Cache de resultados | 5 min de cache para evitar chamadas repetidas |
| Paginação | Navegação por páginas na tabela de vagas |
| CLI completo | Script de demo com 5 demonstrações |

## Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| Scraping | Python + requests |
| Dados | pandas + DataFrame |
| Backend API | Flask + Flask-CORS |
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Export | openpyxl (Excel) + CSV nativo |

## Instalação

### Backend

```bash
# Python 3.10+
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Como usar

### Dashboard Web (recomendado)

```bash
# Terminal 1 — Backend
python backend/app.py

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Acesse `http://localhost:5175` no navegador.

### CLI (modo terminal)

```bash
python run_demo.py
```

Ou importar no seu próprio script:

```python
from job_bot import fetch_jobs, clean_jobs, filter_jobs, save_jobs, display_jobs

df = fetch_jobs(["python", "react"], sources=["remoteok", "jobicy"])
df = clean_jobs(df)
df = filter_jobs(df, remote_only=True, min_salary=80_000)

display_jobs(df, top_n=10)
save_jobs(df, filename="minhas_vagas")
```

## API REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/jobs` | Busca vagas com filtros e paginação |
| GET | `/api/stats` | Estatísticas e métricas agregadas |
| GET | `/api/export/csv` | Download CSV das vagas |
| GET | `/api/export/excel` | Download Excel das vagas |
| POST | `/api/refresh` | Limpa cache e força nova coleta |

### Parâmetros de `/api/jobs`

| Parâmetro | Tipo | Exemplo |
|-----------|------|---------|
| `technologies` | string | `python,react,devops` |
| `keywords` | string | `senior,lead` |
| `location` | string | `brazil` |
| `remote_only` | bool | `true` |
| `job_type` | string | `full-time` |
| `exclude_keywords` | string | `intern,trainee` |
| `min_salary` | float | `60000` |
| `max_salary` | float | `200000` |
| `page` | int | `1` |
| `per_page` | int | `15` |

## Estrutura

```
bot-vagas-python/
├── job_bot.py            # Core: scraping, limpeza, filtros, relatórios
├── config.py             # Configurações customizáveis
├── run_demo.py           # Demo CLI com 5 demonstrações
├── requirements.txt      # Dependências Python
├── backend/
│   └── app.py            # Flask API (5 endpoints)
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── App.tsx           # Dashboard principal
│       ├── index.css         # Tema dark + glass morphism
│       ├── types.ts          # Tipos TypeScript
│       └── components/
│           ├── StatsCards.tsx     # Cards animados
│           ├── FiltersPanel.tsx   # Painel de filtros
│           ├── JobsTable.tsx      # Tabela paginada
│           └── Charts.tsx        # Gráficos Recharts
└── data/                 # CSVs gerados (git ignored)
```

## Fontes de Dados

| Fonte | Tipo | API Key? |
|-------|------|----------|
| RemoteOK | Vagas remotas globais | Não |
| Jobicy | Vagas remotas globais | Não |
| Arbeitnow | Europa + remoto | Não |

Todas públicas, sem precisar cadastrar nada.

## Observações

- A API do RemoteOK tem rate limit, o script já tem delay entre requisições. Erro 429 = esperar alguns minutos.
- O campo de salário nem sempre vem preenchido. Quando vem, está em USD/ano.
- A primeira busca demora ~15-20s (6 chamadas de API com delay). Buscas seguintes usam cache de 5 min.
- A Jobicy às vezes fica instável, o script trata isso graciosamente.

---

Aberto a PRs se quiser adicionar mais fontes ou funcionalidades.
