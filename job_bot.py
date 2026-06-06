"""
Bot de Vagas — Coleta automatizada de vagas de emprego em tecnologia.

Fontes suportadas (sem chave de API):
  - RemoteOK  → https://remoteok.com/api
  - Jobicy    → https://jobicy.com/api/v2/remote-jobs
  - Arbeitnow → https://www.arbeitnow.com/api/job-board-api

Uso rápido:
    from job_bot import fetch_jobs, clean_jobs, filter_jobs, save_jobs, display_jobs

    df = fetch_jobs(["python", "react"], sources=["remoteok", "jobicy"])
    df = clean_jobs(df)
    display_jobs(df, top_n=10)
    save_jobs(df)
"""

from __future__ import annotations

import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

import html
import json
import os
import re
import time
from datetime import datetime
from typing import Optional
from urllib.parse import quote, urlparse

import pandas as pd
import requests

# ─── Constantes internas ──────────────────────────────────────────────────────

_REQUEST_TIMEOUT       = 30
_DELAY_BETWEEN         = 1.5
_OUTPUT_DIR            = "data"

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


# ─── Helpers privados ─────────────────────────────────────────────────────────

def _limpar_html(texto: str) -> str:
    """Remove tags HTML e entidades do texto."""
    if not texto:
        return ""
    texto = html.unescape(texto)
    texto = re.sub(r"<[^>]+>", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def _validar_url(url) -> bool:
    """Retorna True se a URL tem esquema http/https e host válido."""
    if not url or not isinstance(url, str):
        return False
    try:
        p = urlparse(url)
        return p.scheme in ("http", "https") and bool(p.netloc)
    except Exception:
        return False


def _normalizar_localizacao(loc) -> str:
    """Converte variantes de 'remote/remoto/worldwide' para 'Remoto'."""
    if not loc or str(loc).strip() in ("", "nan", "None"):
        return "Remoto"
    loc_str = str(loc).strip()
    termos = ("remote", "remoto", "anywhere", "worldwide", "work from home", "wfh", "global")
    if any(t in loc_str.lower() for t in termos):
        return "Remoto"
    return loc_str


def _parse_epoch(epoch) -> str:
    """Converte Unix timestamp para string 'YYYY-MM-DD'."""
    if not epoch:
        return ""
    try:
        return datetime.fromtimestamp(int(epoch)).strftime("%Y-%m-%d")
    except Exception:
        return ""


def _to_float(val) -> Optional[float]:
    """Converte valor para float positivo ou None."""
    if val is None:
        return None
    try:
        f = float(val)
        return f if f > 0 else None
    except (ValueError, TypeError):
        return None


def _get(url: str, params: dict = None) -> Optional[dict | list]:
    """GET com tratamento de erros padronizado. Retorna None em falha."""
    try:
        r = requests.get(url, params=params, headers=_HEADERS, timeout=_REQUEST_TIMEOUT)
        r.raise_for_status()
        # Força UTF-8 — evita misdetecção de encoding (comum em APIs com acentos)
        return json.loads(r.content.decode("utf-8"))
    except requests.exceptions.Timeout:
        print(f"    [timeout] {url}")
    except requests.exceptions.ConnectionError:
        print(f"    [sem conexão] Verifique sua internet ou a API pode estar fora do ar.")
    except requests.exceptions.HTTPError as e:
        code = e.response.status_code
        print(f"    [HTTP {code}] {url}")
        if code == 429:
            print("    ⚠  Rate limit atingido! Aguarde alguns minutos antes de tentar novamente.")
    except ValueError:
        print(f"    [resposta inválida — não é JSON] {url}")
    except Exception as e:
        print(f"    [erro inesperado] {e}")
    return None


# ─── Coletores por fonte ──────────────────────────────────────────────────────

def fetch_jobs_remoteok(technology: str, max_jobs: int = 50) -> list[dict]:
    """
    Busca vagas no RemoteOK filtrando por tag/tecnologia.

    Args:
        technology: Tag para filtrar (ex: 'python', 'react', 'data-science')
        max_jobs:   Máximo de vagas a retornar

    Returns:
        Lista de vagas no esquema padrão do bot
    """
    data = _get(f"https://remoteok.com/api?tag={quote(technology)}")
    if not data:
        return []

    # Primeiro elemento é aviso legal — filtrar pelo campo 'position'
    jobs_raw = [j for j in data if isinstance(j, dict) and j.get("position")]

    vagas = []
    for job in jobs_raw[:max_jobs]:
        tags = job.get("tags") or []
        if isinstance(tags, str):
            tags = [tags]

        vagas.append({
            "id":               f"remoteok_{job.get('id', '')}",
            "titulo":           html.unescape(job.get("position", "")).strip(),
            "empresa":          html.unescape(job.get("company", "")).strip(),
            "localizacao":      _normalizar_localizacao(job.get("location", "")),
            "descricao":        _limpar_html(job.get("description", ""))[:400],
            "link":             job.get("url", ""),
            "tags":             ", ".join(str(t) for t in tags),
            "salario_min":      _to_float(job.get("salary_min")),
            "salario_max":      _to_float(job.get("salary_max")),
            "moeda":            job.get("salary_currency") or "USD",
            "remoto":           True,
            "tipo":             "Full-Time",
            "tecnologia_busca": technology,
            "data_publicacao":  _parse_epoch(job.get("epoch")),
            "data_coleta":      datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "fonte":            "RemoteOK",
        })

    return vagas


def fetch_jobs_jobicy(technology: str, max_jobs: int = 50) -> list[dict]:
    """
    Busca vagas no Jobicy filtrando por tag/tecnologia.

    Args:
        technology: Tag para filtrar (ex: 'python', 'react', 'devops')
        max_jobs:   Máximo de vagas a retornar

    Returns:
        Lista de vagas no esquema padrão do bot
    """
    count = min(max_jobs, 50)
    data = _get(
        "https://jobicy.com/api/v2/remote-jobs",
        params={"count": count, "tag": technology},
    )
    if not data or data.get("status") != "ok":
        return []

    vagas = []
    for job in data.get("jobs", [])[:max_jobs]:
        industry = job.get("jobIndustry") or []
        if isinstance(industry, str):
            industry = [industry]
        job_types = job.get("jobType") or ["Full-Time"]
        if isinstance(job_types, str):
            job_types = [job_types]

        vagas.append({
            "id":               f"jobicy_{job.get('jobId', '')}",
            "titulo":           html.unescape(job.get("jobTitle", "")).strip(),
            "empresa":          html.unescape(job.get("companyName", "")).strip(),
            "localizacao":      _normalizar_localizacao(job.get("jobGeo", "")),
            "descricao":        _limpar_html(job.get("jobExcerpt", ""))[:400],
            "link":             job.get("jobURL", ""),
            "tags":             ", ".join(str(i) for i in industry),
            "salario_min":      _to_float(job.get("jobSalaryMin")),
            "salario_max":      _to_float(job.get("jobSalaryMax")),
            "moeda":            job.get("jobSalaryCurrency") or "USD",
            "remoto":           True,
            "tipo":             ", ".join(job_types),
            "tecnologia_busca": technology,
            "data_publicacao":  str(job.get("pubDate", ""))[:10],
            "data_coleta":      datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "fonte":            "Jobicy",
        })

    return vagas


def fetch_jobs_arbeitnow(technology: str, max_jobs: int = 50) -> list[dict]:
    """
    Busca vagas no Arbeitnow (vagas europeias + remotas).
    Filtra localmente por tecnologia, pois a API não suporta filtro por tag via URL.

    Args:
        technology: Tecnologia a filtrar no título/tags localmente
        max_jobs:   Máximo de vagas a retornar

    Returns:
        Lista de vagas no esquema padrão do bot
    """
    vagas: list[dict] = []
    tech_lower = technology.lower()

    for page in range(1, 4):  # máximo 3 páginas (~75 jobs brutos)
        data = _get(
            "https://www.arbeitnow.com/api/job-board-api",
            params={"page": page},
        )
        if not data:
            break

        jobs_pag = data.get("data", [])
        if not jobs_pag:
            break

        for job in jobs_pag:
            tags_job   = [t.lower() for t in (job.get("tags") or [])]
            titulo_l   = job.get("title", "").lower()
            desc_trecho = _limpar_html(job.get("description", ""))[:300].lower()

            relevante = (
                tech_lower in tags_job
                or tech_lower in titulo_l
                or tech_lower in desc_trecho
            )
            if not relevante:
                continue

            pub_date = ""
            created = job.get("created_at", 0)
            if created:
                try:
                    pub_date = datetime.fromtimestamp(int(created)).strftime("%Y-%m-%d")
                except Exception:
                    pass

            job_types = job.get("job_types") or ["Full-Time"]

            vagas.append({
                "id":               f"arbeitnow_{job.get('slug', '')}",
                "titulo":           html.unescape(job.get("title", "")).strip(),
                "empresa":          html.unescape(job.get("company_name", "")).strip(),
                "localizacao":      _normalizar_localizacao(job.get("location", "")),
                "descricao":        _limpar_html(job.get("description", ""))[:400],
                "link":             job.get("url", ""),
                "tags":             ", ".join(job.get("tags") or []),
                "salario_min":      None,
                "salario_max":      None,
                "moeda":            "EUR",
                "remoto":           bool(job.get("remote", False)),
                "tipo":             ", ".join(job_types),
                "tecnologia_busca": technology,
                "data_publicacao":  pub_date,
                "data_coleta":      datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "fonte":            "Arbeitnow",
            })

            if len(vagas) >= max_jobs:
                break

        if len(vagas) >= max_jobs:
            break

        time.sleep(_DELAY_BETWEEN)

    return vagas


# ─── Orquestrador principal ───────────────────────────────────────────────────

def fetch_jobs(
    technologies: list[str],
    sources: Optional[list[str]] = None,
    max_jobs_per_source: int = 30,
) -> pd.DataFrame:
    """
    Busca vagas em múltiplas fontes e tecnologias, combinando tudo num DataFrame.

    Args:
        technologies:        Lista de tecnologias (ex: ['python', 'react', 'devops'])
        sources:             Fontes a usar. None = todas as três disponíveis.
                             Opções: 'remoteok', 'jobicy', 'arbeitnow'
        max_jobs_per_source: Máximo de vagas por combinação (fonte × tecnologia)

    Returns:
        DataFrame com todas as vagas, já sem duplicatas por ID

    Example:
        >>> df = fetch_jobs(['python', 'javascript'], sources=['remoteok', 'jobicy'])
        >>> print(f'{len(df)} vagas encontradas')
    """
    if sources is None:
        sources = ["remoteok", "jobicy", "arbeitnow"]

    _source_funcs = {
        "remoteok":  fetch_jobs_remoteok,
        "jobicy":    fetch_jobs_jobicy,
        "arbeitnow": fetch_jobs_arbeitnow,
    }

    fontes_validas = [s for s in sources if s in _source_funcs]
    total_buscas   = len(technologies) * len(fontes_validas)
    todas: list[dict] = []
    n = 0

    for tech in technologies:
        for source in fontes_validas:
            n += 1
            print(f"  [{n:02d}/{total_buscas}] {source.capitalize():<12} <- '{tech}'...")
            vagas = _source_funcs[source](tech, max_jobs=max_jobs_per_source)
            print(f"              → {len(vagas)} vagas")
            todas.extend(vagas)
            time.sleep(_DELAY_BETWEEN)

    for s in sources:
        if s not in _source_funcs:
            print(f"  [AVISO] Fonte '{s}' não reconhecida — ignorada.")

    if not todas:
        print("  Nenhuma vaga encontrada.")
        return pd.DataFrame()

    df = pd.DataFrame(todas)

    antes    = len(df)
    df       = df.drop_duplicates(subset=["id"])
    removidas = antes - len(df)
    if removidas:
        print(f"  {removidas} duplicatas (mesmo ID) removidas.")

    return df.reset_index(drop=True)


# ─── Limpeza e normalização ───────────────────────────────────────────────────

def clean_jobs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpa e normaliza o DataFrame de vagas.

    Operações realizadas:
    - Remove linhas sem título ou empresa
    - Valida e remove URLs inválidas
    - Normaliza campos de texto (strip, html entities)
    - Padroniza localização (variantes de 'remote' → 'Remoto')
    - Deduplicação cruzada: mesmo título+empresa em fontes diferentes

    Args:
        df: DataFrame bruto retornado por fetch_jobs()

    Returns:
        DataFrame limpo, pronto para filtros e análise
    """
    if df.empty:
        return df

    df = df.copy()

    # Remover linhas sem dados essenciais
    df = df.dropna(subset=["titulo", "empresa"])
    df = df[df["titulo"].str.strip() != ""]
    df = df[df["empresa"].str.strip() != ""]

    # Normalizar texto
    df["titulo"]      = df["titulo"].str.strip()
    df["empresa"]     = df["empresa"].str.strip()
    df["localizacao"] = df["localizacao"].apply(_normalizar_localizacao)
    df["descricao"]   = df["descricao"].fillna("").str.strip()
    df["tags"]        = df["tags"].fillna("")

    # Validar URLs
    mask_url   = df["link"].apply(_validar_url)
    n_invalidas = (~mask_url).sum()
    if n_invalidas:
        print(f"  {n_invalidas} vagas com URL inválida removidas.")
    df = df[mask_url]

    # Deduplicação cruzada: mesmo título + empresa (catch de cross-source dups)
    chave  = df["titulo"].str.lower().str.strip() + "§" + df["empresa"].str.lower().str.strip()
    antes  = len(df)
    df     = df[~chave.duplicated(keep="first")]
    cross  = antes - len(df)
    if cross:
        print(f"  {cross} duplicatas cruzadas (título+empresa) removidas.")

    return df.reset_index(drop=True)


# ─── Filtragem customizada ────────────────────────────────────────────────────

def filter_jobs(
    df: pd.DataFrame,
    keywords: Optional[list[str]] = None,
    location: Optional[str] = None,
    remote_only: bool = False,
    job_type: Optional[str] = None,
    exclude_keywords: Optional[list[str]] = None,
    min_salary: Optional[float] = None,
    max_salary: Optional[float] = None,
) -> pd.DataFrame:
    """
    Filtra vagas por critérios customizados.

    Args:
        df:               DataFrame de vagas
        keywords:         Palavras que devem aparecer no título/descrição/tags (OR lógico)
        location:         Substring da localização (ex: 'brazil', 'remote', 'berlin')
        remote_only:      Se True, mantém apenas vagas remotas
        job_type:         Tipo de contrato (ex: 'full-time', 'contract', 'part-time')
        exclude_keywords: Palavras que NÃO devem aparecer no título/descrição
        min_salary:       Salário mínimo em USD/ano (requer campo salario_min preenchido)
        max_salary:       Salário máximo em USD/ano

    Returns:
        DataFrame filtrado com índice resetado

    Example:
        >>> df_senior = filter_jobs(
        ...     df,
        ...     keywords=['senior', 'lead'],
        ...     remote_only=True,
        ...     min_salary=80_000,
        ... )
    """
    if df.empty:
        return df

    r = df.copy()

    # Palavras-chave inclusivas (título OU descrição OU tags)
    if keywords:
        mask = pd.Series(False, index=r.index)
        for kw in keywords:
            kw_l = kw.lower()
            mask |= (
                r["titulo"].str.lower().str.contains(kw_l, na=False, regex=False)
                | r["descricao"].str.lower().str.contains(kw_l, na=False, regex=False)
                | r["tags"].str.lower().str.contains(kw_l, na=False, regex=False)
            )
        r = r[mask]

    # Palavras-chave exclusivas
    if exclude_keywords:
        for kw in exclude_keywords:
            kw_l = kw.lower()
            bad = (
                r["titulo"].str.lower().str.contains(kw_l, na=False, regex=False)
                | r["descricao"].str.lower().str.contains(kw_l, na=False, regex=False)
            )
            r = r[~bad]

    # Localização
    if location:
        loc_l = location.lower()
        r = r[r["localizacao"].str.lower().str.contains(loc_l, na=False, regex=False)]

    # Apenas remotas
    if remote_only:
        is_remote = r["remoto"].astype(bool) | r["localizacao"].str.lower().str.contains(
            "remot", na=False, regex=False
        )
        r = r[is_remote]

    # Tipo de contrato
    if job_type:
        r = r[r["tipo"].str.lower().str.contains(job_type.lower(), na=False, regex=False)]

    # Faixa salarial
    if min_salary is not None:
        r = r[r["salario_min"].notna() & (r["salario_min"] >= min_salary)]

    if max_salary is not None:
        r = r[r["salario_max"].notna() & (r["salario_max"] <= max_salary)]

    return r.reset_index(drop=True)


# ─── Exibição no console ──────────────────────────────────────────────────────

def display_jobs(df: pd.DataFrame, top_n: int = 10) -> None:
    """
    Exibe vagas formatadas no console.

    Args:
        df:    DataFrame de vagas
        top_n: Quantidade de vagas a exibir
    """
    if df.empty:
        print("  Nenhuma vaga para exibir.")
        return

    n_exibir = min(top_n, len(df))
    print(f"\n{'─'*68}")
    print(f"  TOP {n_exibir} VAGAS   (total no DataFrame: {len(df)})")
    print(f"{'─'*68}")

    for i, (_, v) in enumerate(df.head(top_n).iterrows(), 1):
        titulo = str(v["titulo"])[:56]
        print(f"\n  #{i:02d}  {titulo}")
        print(f"       Empresa:   {v['empresa']}")
        print(f"       Local:     {v['localizacao']}")
        print(f"       Fonte:     {v['fonte']}")

        sal_min = v.get("salario_min")
        sal_max = v.get("salario_max")
        if pd.notna(sal_min) and sal_min:
            moeda   = v.get("moeda", "USD")
            sal_str = f"{moeda} {int(sal_min):,}"
            if pd.notna(sal_max) and sal_max:
                sal_str += f" – {int(sal_max):,}"
            print(f"       Salário:   {sal_str}/ano")

        if v.get("tags"):
            tags_str = str(v["tags"])
            if len(tags_str) > 62:
                tags_str = tags_str[:59] + "..."
            print(f"       Tags:      {tags_str}")

        print(f"       Link:      {v['link']}")

    print(f"\n{'─'*68}")


# ─── Relatório estatístico ────────────────────────────────────────────────────

def generate_report(df: pd.DataFrame) -> dict:
    """
    Gera dicionário com estatísticas das vagas coletadas.

    Args:
        df: DataFrame de vagas

    Returns:
        Dict com chaves: total, por_tecnologia, por_fonte, por_localizacao,
        remotas, com_salario, salario_medio_min, salario_medio_max, data_coleta
    """
    if df.empty:
        return {"total": 0}

    report: dict = {
        "total":           len(df),
        "por_tecnologia":  df["tecnologia_busca"].value_counts().to_dict(),
        "por_fonte":       df["fonte"].value_counts().to_dict(),
        "por_localizacao": df["localizacao"].value_counts().head(10).to_dict(),
        "remotas":         int(df["remoto"].astype(bool).sum()),
        "com_salario":     int(df["salario_min"].notna().sum()),
        "data_coleta":     datetime.now().strftime("%Y-%m-%d %H:%M"),
    }

    vagas_sal = df.dropna(subset=["salario_min"])
    if not vagas_sal.empty:
        report["salario_medio_min"] = round(float(vagas_sal["salario_min"].mean()), 2)
        report["salario_medio_max"] = round(
            float(vagas_sal["salario_max"].fillna(0).mean()), 2
        )
        sal_max_series = vagas_sal["salario_max"].dropna()
        if not sal_max_series.empty:
            report["maior_salario"] = round(float(sal_max_series.max()), 2)

    return report


def print_report(report: dict) -> None:
    """Imprime o relatório de estatísticas de forma formatada."""
    print(f"\n{'='*52}")
    print("  RELATÓRIO DE VAGAS COLETADAS")
    print(f"{'='*52}")
    print(f"  Total de vagas:    {report['total']}")
    print(f"  Vagas remotas:     {report.get('remotas', 0)}")
    print(f"  Com salário info:  {report.get('com_salario', 0)}")
    print(f"  Coletado em:       {report.get('data_coleta', 'N/A')}")

    if report.get("por_tecnologia"):
        print("\n  Vagas por tecnologia:")
        for tech, n in sorted(report["por_tecnologia"].items(), key=lambda x: -x[1]):
            bar = "█" * min(n, 25)
            print(f"    {tech:<18} {n:>3}  {bar}")

    if report.get("por_fonte"):
        print("\n  Vagas por fonte:")
        for fonte, n in sorted(report["por_fonte"].items(), key=lambda x: -x[1]):
            print(f"    {fonte:<18} {n:>3}")

    if report.get("por_localizacao"):
        print("\n  Top localizações:")
        for loc, n in list(report["por_localizacao"].items())[:5]:
            print(f"    {loc:<28} {n:>3}")

    if report.get("salario_medio_min"):
        print(f"\n  Salários (USD/ano):")
        print(f"    Mínimo médio:  ${report['salario_medio_min']:>10,.0f}")
        print(f"    Máximo médio:  ${report['salario_medio_max']:>10,.0f}")
        if report.get("maior_salario"):
            print(f"    Maior salário: ${report['maior_salario']:>10,.0f}")

    print(f"{'='*52}")


# ─── Persistência ─────────────────────────────────────────────────────────────

def save_jobs(
    df: pd.DataFrame,
    filename: Optional[str] = None,
    output_dir: str = _OUTPUT_DIR,
) -> str:
    """
    Salva o DataFrame de vagas em CSV.

    Colunas salvas: titulo, empresa, localizacao, remoto, tipo, tags,
    salario_min, salario_max, moeda, link, fonte, tecnologia_busca,
    data_publicacao, data_coleta.

    Args:
        df:         DataFrame de vagas
        filename:   Nome do arquivo sem extensão. None = timestamp automático
        output_dir: Diretório de saída (criado automaticamente se não existir)

    Returns:
        Caminho completo do CSV salvo, ou "" se DataFrame vazio
    """
    if df.empty:
        print("  DataFrame vazio — nada a salvar.")
        return ""

    os.makedirs(output_dir, exist_ok=True)

    if not filename:
        filename = f"vagas_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    colunas_desejadas = [
        "titulo", "empresa", "localizacao", "remoto", "tipo",
        "tags", "salario_min", "salario_max", "moeda",
        "link", "fonte", "tecnologia_busca",
        "data_publicacao", "data_coleta",
    ]
    colunas = [c for c in colunas_desejadas if c in df.columns]

    caminho = os.path.join(output_dir, f"{filename}.csv")
    df[colunas].to_csv(caminho, index=False, encoding="utf-8-sig")
    print(f"  Salvo → {caminho}  ({len(df)} vagas)")
    return caminho
