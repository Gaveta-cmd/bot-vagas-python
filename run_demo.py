"""
Bot de Vagas — Demo completo com dados reais.

Executa 5 demonstrações:
  1. Busca Python / JavaScript / React
  2. Busca Data Science / Machine Learning
  3. Filtros customizados (senior, remoto, salário, excluir estagio)
  4. Análise estatística com Pandas
  5. Validação e remoção de duplicatas

Uso:
    python run_demo.py
"""

from __future__ import annotations

import sys
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

from datetime import datetime
from urllib.parse import urlparse

import pandas as pd

from job_bot import (
    clean_jobs,
    display_jobs,
    fetch_jobs,
    filter_jobs,
    generate_report,
    print_report,
    save_jobs,
)


# ─── Utilitários de exibição ──────────────────────────────────────────────────

def _secao(titulo: str) -> None:
    print(f"\n{'='*70}")
    print(f"  {titulo}")
    print("=" * 70)


# ─── Demo 1: Busca principal ──────────────────────────────────────────────────

def demo_python_js_react() -> pd.DataFrame:
    _secao("DEMO 1 · Python · JavaScript · React")

    print("\n  Fontes: RemoteOK + Jobicy  |  25 vagas por fonte/tecnologia\n")

    df = fetch_jobs(
        technologies=["python", "javascript", "react"],
        sources=["remoteok", "jobicy"],
        max_jobs_per_source=25,
    )
    df = clean_jobs(df)

    display_jobs(df, top_n=10)

    report = generate_report(df)
    print_report(report)

    save_jobs(df, filename="vagas_python_js_react")
    return df


# ─── Demo 2: Data Science / ML ────────────────────────────────────────────────

def demo_data_science() -> pd.DataFrame:
    _secao("DEMO 2 · Data Science · Machine Learning")

    print()
    df = fetch_jobs(
        technologies=["data-science", "machine-learning"],
        sources=["remoteok", "jobicy"],
        max_jobs_per_source=20,
    )
    df = clean_jobs(df)

    print(f"\n  Total encontrado: {len(df)} vagas de Data Science / ML")
    display_jobs(df, top_n=5)
    save_jobs(df, filename="vagas_data_science")
    return df


# ─── Demo 3: Filtros customizados ─────────────────────────────────────────────

def demo_filtros(df: pd.DataFrame) -> None:
    _secao("DEMO 3 · Filtros Customizados")

    if df.empty:
        print("  DataFrame vazio — pulando.")
        return

    print(f"\n  Base de entrada: {len(df)} vagas\n")

    # 3a. Apenas remotas
    remotas = filter_jobs(df, remote_only=True)
    print(f"  [1] remote_only=True                    → {len(remotas):>3} vagas")

    # 3b. Cargos senior / lead
    senior = filter_jobs(df, keywords=["senior", "lead", "staff", "principal"])
    print(f"  [2] keywords=['senior','lead','staff']   → {len(senior):>3} vagas")
    for _, v in senior.head(3).iterrows():
        print(f"      → {v['titulo'][:52]:52} | {v['empresa']}")

    # 3c. Vagas com algum salário informado
    com_sal = filter_jobs(df, min_salary=1)
    print(f"\n  [3] min_salary=1 (qualquer valor)       → {len(com_sal):>3} vagas com salário")
    for _, v in com_sal.head(3).iterrows():
        sal = f"${int(v['salario_min']):>8,}" if pd.notna(v["salario_min"]) else "N/A"
        print(f"      → {v['titulo'][:45]:45} | min: {sal}/ano")

    # 3d. Salário >= $80k
    alto_sal = filter_jobs(df, min_salary=80_000)
    print(f"\n  [4] min_salary=$80.000/ano              → {len(alto_sal):>3} vagas")
    for _, v in alto_sal.head(3).iterrows():
        s_min = f"${int(v['salario_min']):,}" if pd.notna(v["salario_min"]) else "?"
        s_max = f"${int(v['salario_max']):,}" if pd.notna(v["salario_max"]) else "?"
        print(f"      → {v['titulo'][:42]:42} | {s_min}–{s_max}/ano")

    # 3e. Excluir estágio / intern
    sem_intern = filter_jobs(df, exclude_keywords=["intern", "internship", "trainee"])
    removidas  = len(df) - len(sem_intern)
    print(f"\n  [5] exclude=['intern','internship']     → {len(sem_intern):>3} vagas "
          f"(removidas {removidas})")

    # 3f. Filtro combinado: senior + remoto
    senior_remoto = filter_jobs(df, keywords=["senior"], remote_only=True)
    print(f"\n  [6] keywords=['senior'] + remote_only   → {len(senior_remoto):>3} vagas")

    # Salvar resultado filtrado
    save_jobs(senior_remoto, filename="vagas_senior_remoto")


# ─── Demo 4: Análise estatística com Pandas ───────────────────────────────────

def demo_estatisticas(df: pd.DataFrame) -> None:
    _secao("DEMO 4 · Análise Estatística com Pandas")

    if df.empty:
        print("  DataFrame vazio.")
        return

    print(f"\n  df.shape  = {df.shape}")
    print(f"  Colunas   = {list(df.columns)}\n")

    print("  ── Por tecnologia ──────────────────────────────────")
    print(df["tecnologia_busca"].value_counts().to_string())

    print("\n  ── Por fonte ───────────────────────────────────────")
    print(df["fonte"].value_counts().to_string())

    print("\n  ── Top 10 empresas com mais vagas ──────────────────")
    print(df["empresa"].value_counts().head(10).to_string())

    print("\n  ── Distribuição por localização (top 8) ────────────")
    print(df["localizacao"].value_counts().head(8).to_string())

    # Análise salarial
    vagas_sal = df.dropna(subset=["salario_min"])
    if not vagas_sal.empty:
        print(f"\n  ── Salários (USD/ano) | {len(vagas_sal)} vagas com dados ──────")
        print(f"  Mínimo médio declarado:  ${vagas_sal['salario_min'].mean():>10,.0f}")
        sal_max_vals = vagas_sal['salario_max'].dropna()
        if not sal_max_vals.empty:
            print(f"  Máximo médio declarado:  ${sal_max_vals.mean():>10,.0f}")
            print(f"  Maior salário anunciado: ${sal_max_vals.max():>10,.0f}")

        print(f"\n  ── Top 5 vagas mais bem pagas ──────────────────────")
        top_sal = vagas_sal.sort_values("salario_max", ascending=False).head(5)
        for _, v in top_sal.iterrows():
            sal = f"${int(v['salario_max'] or 0):,}" if pd.notna(v.get("salario_max")) else "N/A"
            print(f"  {v['titulo'][:50]:50} | max: {sal}/ano")
    else:
        print("\n  (nenhuma vaga com salário nessa amostra)")

    # Top 10 mais recentes
    print("\n  ── Top 10 vagas mais recentes ──────────────────────")
    recent = (
        df[df["data_publicacao"].str.len() == 10]
        .sort_values("data_publicacao", ascending=False)
        .head(10)
    )
    if recent.empty:
        print("  (datas de publicação não disponíveis nessa amostra)")
    else:
        for i, (_, v) in enumerate(recent.iterrows(), 1):
            print(
                f"  {i:02d}. [{v['data_publicacao']}] "
                f"{v['titulo'][:48]:48} @ {v['empresa']}"
            )


# ─── Demo 5: Deduplicação ─────────────────────────────────────────────────────

def demo_deduplicacao() -> None:
    _secao("DEMO 5 · Remoção de Duplicatas")

    print("\n  Busca 'python' separada em RemoteOK e Jobicy (sobreposição intencional)...")

    df_a = fetch_jobs(["python"], sources=["remoteok"], max_jobs_per_source=15)
    df_b = fetch_jobs(["python"], sources=["jobicy"],   max_jobs_per_source=15)

    df_bruto = pd.concat([df_a, df_b], ignore_index=True)
    print(f"\n  Bruto (concat simples):          {len(df_bruto):>3} linhas")

    # Dedup por ID
    df_dedup_id = df_bruto.drop_duplicates(subset=["id"])
    print(f"  Após drop_duplicates(['id']):    {len(df_dedup_id):>3} linhas")

    # Dedup completo via clean_jobs
    df_limpo = clean_jobs(df_bruto)
    print(f"  Após clean_jobs() (id+título):  {len(df_limpo):>3} linhas")
    print(f"  Total removido:                 {len(df_bruto) - len(df_limpo):>3} duplicatas")


# ─── Validação de estrutura ───────────────────────────────────────────────────

def validate_dataframe(df: pd.DataFrame, label: str = "") -> bool:
    """Valida que o DataFrame tem colunas obrigatórias e links válidos."""
    obrigatorias = ["titulo", "empresa", "localizacao", "link", "fonte", "data_coleta"]
    faltando     = [c for c in obrigatorias if c not in df.columns]

    prefixo = f"[{label}] " if label else ""

    if faltando:
        print(f"  {prefixo}[ERRO] Colunas faltando: {faltando}")
        return False

    links_invalidos = df["link"].apply(
        lambda u: not (_validar_url_local(u))
    ).sum()

    if links_invalidos:
        print(f"  {prefixo}[AVISO] {links_invalidos} links inválidos no DataFrame")

    print(f"  {prefixo}[OK] Estrutura válida — {len(df)} vagas, {len(df.columns)} colunas")
    return True


def _validar_url_local(url) -> bool:
    if not url or not isinstance(url, str):
        return False
    try:
        p = urlparse(url)
        return p.scheme in ("http", "https") and bool(p.netloc)
    except Exception:
        return False


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    _secao("BOT DE VAGAS — DEMONSTRAÇÃO COMPLETA")
    print(f"  Data/hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("  Fontes:    RemoteOK, Jobicy (sem chave de API necessária)")
    print("  Saída:     pasta data/")

    # ── Demo 1: Python, JS, React ─────────────────────────────────────────────
    df_principal = demo_python_js_react()

    # ── Demo 2: Data Science ──────────────────────────────────────────────────
    df_ds = demo_data_science()

    # ── Demo 3: Filtros (sobre df_principal) ──────────────────────────────────
    demo_filtros(df_principal)

    # ── Demo 4: Estatísticas (DataFrame combinado) ────────────────────────────
    df_completo = (
        pd.concat([df_principal, df_ds], ignore_index=True)
        .drop_duplicates(subset=["id"])
        .reset_index(drop=True)
    )
    demo_estatisticas(df_completo)

    # ── Demo 5: Deduplicação ──────────────────────────────────────────────────
    demo_deduplicacao()

    # ── Validação final ───────────────────────────────────────────────────────
    _secao("VALIDAÇÃO DOS DADOS")
    validate_dataframe(df_principal, "Python/JS/React")
    validate_dataframe(df_ds,        "Data Science")
    validate_dataframe(df_completo,  "Completo")

    # ── Salvar relatório final ────────────────────────────────────────────────
    _secao("SALVANDO RELATÓRIO FINAL")
    save_jobs(df_completo, filename="vagas_completo")

    # ── Resumo final ──────────────────────────────────────────────────────────
    _secao("DEMO CONCLUÍDA")
    print(f"\n  Total de vagas coletadas: {len(df_completo)}")
    print("\n  Arquivos gerados em: data/")
    print("  ├─ vagas_python_js_react.csv")
    print("  ├─ vagas_data_science.csv")
    print("  ├─ vagas_senior_remoto.csv")
    print("  └─ vagas_completo.csv")
    print()


if __name__ == "__main__":
    main()
