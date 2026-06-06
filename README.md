# Bot de Vagas 🔍

Cansado de ficar abrindo 10 sites diferentes pra procurar vaga? Esse script resolve isso. Ele bate em algumas APIs públicas, puxa as vagas, filtra o que não interessa e salva tudo num CSV organizado.

Feito pra uso pessoal mas funciona bem como base pra quem quiser expandir.

---

## O que faz

- Busca vagas por tecnologia (python, react, javascript, data science, etc)
- Puxa de várias fontes ao mesmo tempo: RemoteOK, Jobicy, Arbeitnow
- Remove vagas duplicadas automaticamente
- Filtra por localização, remoto, senioridade, salário
- Salva tudo em CSV pra você abrir no Excel/Sheets se quiser
- Mostra um resumo no terminal com estatísticas

## Instalação

Precisa de Python 3.10+ e basicamente só duas libs:

```bash
pip install -r requirements.txt
```

## Como usar

Jeito mais rápido, só rodar o demo que já testa tudo:

```bash
python run_demo.py
```

Ou importar no seu próprio script:

```python
from job_bot import fetch_jobs, clean_jobs, filter_jobs, save_jobs, display_jobs

# buscar vagas de python e react
df = fetch_jobs(["python", "react"], sources=["remoteok", "jobicy"])
df = clean_jobs(df)

# filtrar só as remotas com salário acima de 80k
df = filter_jobs(df, remote_only=True, min_salary=80_000)

display_jobs(df, top_n=10)
save_jobs(df, filename="minhas_vagas")
```

Os CSVs ficam salvos na pasta `data/`.

## Filtros disponíveis

```python
filter_jobs(
    df,
    keywords=["senior", "backend"],   # palavras no título/descrição
    exclude_keywords=["intern"],       # excluir essas palavras
    remote_only=True,                  # só remoto
    location="brazil",                 # filtrar por localização
    job_type="full-time",
    min_salary=60_000,                 # salário mínimo (USD/ano)
    max_salary=150_000,
)
```

## Configuração

Edita o `config.py` pra mudar as tecnologias padrão, fontes, limite de vagas e filtros.

```python
DEFAULT_TECHNOLOGIES = ["python", "javascript", "react", "data-science"]
DEFAULT_SOURCES = ["remoteok", "jobicy"]
MAX_JOBS_PER_SOURCE = 30
```

## Fontes

| Fonte | Tipo | API Key? |
|-------|------|----------|
| RemoteOK | Vagas remotas globais | Não |
| Jobicy | Vagas remotas globais | Não |
| Arbeitnow | Europa + remoto | Não |

Todas públicas, sem precisar cadastrar nada.

## Estrutura

```
├── job_bot.py       # funções principais
├── config.py        # configurações
├── run_demo.py      # script de exemplo
├── requirements.txt
└── data/            # CSVs gerados (ignorado pelo git)
```

## Observações

- A API do RemoteOK tem rate limit, então o script já tem um delay entre as requisições. Se aparecer erro 429 é só esperar alguns minutos.
- O campo de salário nem sempre vem preenchido, depende da vaga. Quando vem, está em USD/ano.
- A Jobicy às vezes fica instável, o script trata isso graciosamente e segue.

---

Aberto a PRs se quiser adicionar mais fontes ou funcionalidades.
