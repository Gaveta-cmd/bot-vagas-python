"""
Bot de Vagas — Flask API
Expoe as funcoes do job_bot como endpoints REST para o dashboard web.
"""

from __future__ import annotations

import io
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from job_bot import fetch_jobs, clean_jobs, filter_jobs, generate_report

app = Flask(__name__)
CORS(app)

_cache: dict = {"df": None, "timestamp": None, "technologies": None}

CACHE_TTL_SECONDS = 300


def _get_jobs(technologies: list[str], sources: list[str] | None = None):
    now = datetime.now()
    if (
        _cache["df"] is not None
        and _cache["technologies"] == technologies
        and _cache["timestamp"]
        and (now - _cache["timestamp"]).total_seconds() < CACHE_TTL_SECONDS
    ):
        return _cache["df"]

    df = fetch_jobs(technologies, sources=sources, max_jobs_per_source=30)
    df = clean_jobs(df)
    _cache["df"] = df
    _cache["timestamp"] = now
    _cache["technologies"] = technologies
    return df


@app.route("/api/jobs", methods=["GET"])
def api_jobs():
    techs_param = request.args.get("technologies", "python,javascript,react")
    technologies = [t.strip() for t in techs_param.split(",") if t.strip()]

    sources_param = request.args.get("sources", "")
    sources = [s.strip() for s in sources_param.split(",") if s.strip()] or None

    df = _get_jobs(technologies, sources)

    keywords_param = request.args.get("keywords", "")
    keywords = [k.strip() for k in keywords_param.split(",") if k.strip()] or None

    location = request.args.get("location", "").strip() or None
    remote_only = request.args.get("remote_only", "false").lower() == "true"
    job_type = request.args.get("job_type", "").strip() or None

    exclude_param = request.args.get("exclude_keywords", "")
    exclude = [e.strip() for e in exclude_param.split(",") if e.strip()] or None

    min_salary = request.args.get("min_salary", type=float)
    max_salary = request.args.get("max_salary", type=float)

    df_filtered = filter_jobs(
        df,
        keywords=keywords,
        location=location,
        remote_only=remote_only,
        job_type=job_type,
        exclude_keywords=exclude,
        min_salary=min_salary,
        max_salary=max_salary,
    )

    sort_by = request.args.get("sort_by", "data_publicacao")
    sort_order = request.args.get("sort_order", "desc")
    if sort_by in df_filtered.columns and not df_filtered.empty:
        df_filtered = df_filtered.sort_values(
            sort_by, ascending=(sort_order == "asc"), na_position="last"
        )

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)
    total = len(df_filtered)
    start = (page - 1) * per_page
    end = start + per_page
    df_page = df_filtered.iloc[start:end]

    jobs = []
    for _, row in df_page.iterrows():
        job = {}
        for col in df_page.columns:
            val = row[col]
            if hasattr(val, "item"):
                val = val.item()
            if val != val:  # NaN check
                val = None
            job[col] = val
        jobs.append(job)

    return jsonify({
        "jobs": jobs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if total > 0 else 0,
    })


@app.route("/api/stats", methods=["GET"])
def api_stats():
    techs_param = request.args.get("technologies", "python,javascript,react")
    technologies = [t.strip() for t in techs_param.split(",") if t.strip()]

    df = _get_jobs(technologies)

    if df.empty:
        return jsonify({"total": 0})

    report = generate_report(df)

    salary_by_tech = {}
    for tech in df["tecnologia_busca"].unique():
        tech_df = df[df["tecnologia_busca"] == tech]
        sal_df = tech_df.dropna(subset=["salario_min"])
        if not sal_df.empty:
            salary_by_tech[tech] = {
                "avg_min": round(float(sal_df["salario_min"].mean()), 0),
                "avg_max": round(float(sal_df["salario_max"].fillna(0).mean()), 0),
                "count": len(sal_df),
            }

    top_companies = df["empresa"].value_counts().head(10).to_dict()

    jobs_by_type = df["tipo"].value_counts().to_dict()

    return jsonify({
        **report,
        "salary_by_tech": salary_by_tech,
        "top_companies": top_companies,
        "jobs_by_type": jobs_by_type,
    })


@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    techs_param = request.args.get("technologies", "python,javascript,react")
    technologies = [t.strip() for t in techs_param.split(",") if t.strip()]

    df = _get_jobs(technologies)
    if df.empty:
        return jsonify({"error": "No data to export"}), 404

    buf = io.StringIO()
    export_cols = [
        "titulo", "empresa", "localizacao", "remoto", "tipo",
        "tags", "salario_min", "salario_max", "moeda",
        "link", "fonte", "tecnologia_busca",
        "data_publicacao", "data_coleta",
    ]
    cols = [c for c in export_cols if c in df.columns]
    df[cols].to_csv(buf, index=False, encoding="utf-8-sig")

    buf.seek(0)
    return send_file(
        io.BytesIO(buf.getvalue().encode("utf-8-sig")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"vagas_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
    )


@app.route("/api/export/excel", methods=["GET"])
def export_excel():
    techs_param = request.args.get("technologies", "python,javascript,react")
    technologies = [t.strip() for t in techs_param.split(",") if t.strip()]

    df = _get_jobs(technologies)
    if df.empty:
        return jsonify({"error": "No data to export"}), 404

    export_cols = [
        "titulo", "empresa", "localizacao", "remoto", "tipo",
        "tags", "salario_min", "salario_max", "moeda",
        "link", "fonte", "tecnologia_busca",
        "data_publicacao", "data_coleta",
    ]
    cols = [c for c in export_cols if c in df.columns]

    buf = io.BytesIO()
    df[cols].to_excel(buf, index=False, engine="openpyxl", sheet_name="Vagas")
    buf.seek(0)

    return send_file(
        buf,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=f"vagas_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx",
    )


@app.route("/api/refresh", methods=["POST"])
def refresh():
    _cache["df"] = None
    _cache["timestamp"] = None
    _cache["technologies"] = None
    return jsonify({"status": "cache cleared"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
