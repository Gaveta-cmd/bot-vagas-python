import { useState, useCallback } from 'react'
import { Download, FileSpreadsheet, RefreshCw, Radar, ArrowRight } from 'lucide-react'
import StatsCards from './components/StatsCards'
import FiltersPanel, { defaultFilters } from './components/FiltersPanel'
import JobsTable from './components/JobsTable'
import Charts from './components/Charts'
import type { Filters, Job, Stats } from './types'

const API = '/api'
type Tab = 'table' | 'charts'

export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('table')
  const [searched, setSearched] = useState(false)

  const buildParams = useCallback((f: Filters, p: number) => {
    const params = new URLSearchParams()
    if (f.technologies) params.set('technologies', f.technologies)
    if (f.keywords) params.set('keywords', f.keywords)
    if (f.location) params.set('location', f.location)
    if (f.remote_only) params.set('remote_only', 'true')
    if (f.job_type) params.set('job_type', f.job_type)
    if (f.exclude_keywords) params.set('exclude_keywords', f.exclude_keywords)
    if (f.min_salary) params.set('min_salary', f.min_salary)
    if (f.max_salary) params.set('max_salary', f.max_salary)
    params.set('page', String(p))
    params.set('per_page', '15')
    return params
  }, [])

  const fetchJobs = useCallback(async (f: Filters, p: number) => {
    setLoading(true)
    try {
      const params = buildParams(f, p)
      const [jobsRes, statsRes] = await Promise.all([
        fetch(`${API}/jobs?${params}`),
        fetch(`${API}/stats?technologies=${encodeURIComponent(f.technologies)}`),
      ])
      const jobsData = await jobsRes.json()
      const statsData = await statsRes.json()
      setJobs(jobsData.jobs)
      setTotal(jobsData.total)
      setPage(jobsData.page)
      setTotalPages(jobsData.total_pages)
      setStats(statsData)
      setSearched(true)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [buildParams])

  const handleSearch = () => { setPage(1); fetchJobs(filters, 1) }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchJobs(filters, p)
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const handleRefresh = async () => {
    await fetch(`${API}/refresh`, { method: 'POST' })
    fetchJobs(filters, 1)
  }

  const exportUrl = (format: 'csv' | 'excel') =>
    `${API}/export/${format}?technologies=${encodeURIComponent(filters.technologies)}`

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245, 158, 11, 0.06), transparent 70%)',
      }} />

      <div className="relative max-w-6xl mx-auto px-5 py-8 space-y-5">
        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-4 flex-wrap animate-in">
          <div className="flex items-center gap-4">
            {/* Orbit logo */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full" style={{ border: '1px solid var(--border)' }} />
              <div className="orbit-ring absolute inset-0">
                <div className="orbit-dot" style={{ background: 'var(--amber)', top: '0', left: '50%', transform: 'translateX(-50%)' }} />
              </div>
              <div className="orbit-ring absolute inset-1" style={{ animationDirection: 'reverse', animationDuration: '15s' }}>
                <div className="orbit-dot" style={{ background: 'var(--violet)', bottom: '0', right: '0', animationDelay: '1s' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Radar size={18} style={{ color: 'var(--amber)' }} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Bot de Vagas
              </h1>
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Radar de vagas em tech
              </p>
            </div>
          </div>

          {searched && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer hover:bg-white/5 whitespace-nowrap"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <RefreshCw size={12} />
                Atualizar
              </button>
              <a
                href={exportUrl('csv')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all no-underline hover:bg-white/5 whitespace-nowrap"
                style={{ color: 'var(--emerald)', border: '1px solid rgba(52, 211, 153, 0.2)' }}
              >
                <Download size={12} />
                CSV
              </a>
              <a
                href={exportUrl('excel')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all no-underline hover:bg-white/5 whitespace-nowrap"
                style={{ color: 'var(--violet)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
              >
                <FileSpreadsheet size={12} />
                Excel
              </a>
            </div>
          )}
        </header>

        {/* ── Stats ── */}
        {searched && <StatsCards stats={stats} />}

        {/* ── Filters ── */}
        <FiltersPanel filters={filters} onChange={setFilters} onSearch={handleSearch} loading={loading} />

        {/* ── Welcome ── */}
        {!searched && !loading && (
          <div className="flashlight-card gradient-border rounded-2xl p-16 text-center animate-in delay-6">
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'var(--amber-glow)' }}>
                  <Radar size={36} style={{ color: 'var(--amber)' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full" style={{ background: 'var(--emerald)', animation: 'pulseGlow 2s ease-in-out infinite' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Pronto para rastrear vagas
              </h2>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>
                Configure os filtros e clique em buscar para coletar vagas de 3 fontes em tempo real.
              </p>
              <div className="flex items-center justify-center gap-6 text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
                  RemoteOK
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--emerald)' }} />
                  Jobicy
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--violet)' }} />
                  Arbeitnow
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {(searched || loading) && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit animate-in delay-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setTab('table')}
                className={`px-5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${tab === 'table' ? 'tab-active' : 'tab-inactive'}`}
                style={{ border: 'none', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Vagas
              </button>
              <button
                onClick={() => setTab('charts')}
                className={`px-5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${tab === 'charts' ? 'tab-active' : 'tab-inactive'}`}
                style={{ border: 'none', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Graficos
              </button>
            </div>

            {tab === 'table' ? (
              <JobsTable jobs={jobs} total={total} page={page} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} />
            ) : (
              <Charts stats={stats} />
            )}
          </>
        )}

        {/* ── Footer ── */}
        <footer className="text-center py-6 animate-in delay-6">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)' }} />
            Bot de Vagas
            <ArrowRight size={10} />
            Dados em tempo real
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--emerald)' }} />
          </div>
        </footer>
      </div>
    </div>
  )
}
