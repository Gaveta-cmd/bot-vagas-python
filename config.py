"""
Configurações do Bot de Vagas.
Edite este arquivo para customizar o comportamento sem tocar no código principal.
"""

# ─── Tecnologias padrão para busca ────────────────────────────────────────────
DEFAULT_TECHNOLOGIES = [
    "python",
    "javascript",
    "react",
    "data-science",
    "devops",
]

# ─── Fontes disponíveis ───────────────────────────────────────────────────────
# "remoteok"  → remoteok.com/api   (vagas remotas globais, sem autenticação)
# "jobicy"    → jobicy.com/api     (vagas remotas globais, sem autenticação)
# "arbeitnow" → arbeitnow.com/api  (vagas europeias + remotas, sem autenticação)
DEFAULT_SOURCES = [
    "remoteok",
    "jobicy",
]

# ─── Limites ──────────────────────────────────────────────────────────────────
MAX_JOBS_PER_SOURCE = 30   # vagas por (fonte × tecnologia)
REQUEST_TIMEOUT     = 30   # segundos antes de timeout
DELAY_REQUESTS      = 1.5  # segundos entre chamadas (previne rate limit)

# ─── Saída ────────────────────────────────────────────────────────────────────
OUTPUT_DIR       = "data"
DEFAULT_FILENAME = "vagas_coletadas"

# ─── Filtros pré-configurados ─────────────────────────────────────────────────
# Ajuste para personalizar a busca padrão
FILTROS_PADRAO = {
    "remote_only":      True,
    "exclude_keywords": ["intern", "internship", "trainee"],
    "min_salary":       None,   # ex: 60000 → filtra salário mínimo USD/ano
    "max_salary":       None,
}
