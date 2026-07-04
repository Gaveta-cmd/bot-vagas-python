import { useState, useCallback } from 'react'
import { Download, FileSpreadsheet, RefreshCw, Zap } from 'lucide-react'
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

  const handleSearch = () => {
    setPage(1)
    fetchJobs(filters, 1)
  }

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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(var(--accent-blue) 1px, transparent 1px), linear-gradient(90deg, var(--accent-blue) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))' }}>
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Bot de Vagas
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Dashboard de vagas em tecnologia
              </p>
            </div>
          </div>

          {searched && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'transparent' }}
                title="Limpar cache e buscar novamente"
              >
                <RefreshCw size={14} />
                Atualizar
              </button>
              <a
                href={exportUrl('csv')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors no-underline"
                style={{ color: 'var(--accent-green)', border: '1px solid var(--accent-green)40', background: 'transparent' }}
              >
                <Download size={14} />
                CSV
              </a>
              <a
                href={exportUrl('excel')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors no-underline"
                style={{ color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)40', background: 'transparent' }}
              >
                <FileSpreadsheet size={14} />
                Excel
              </a>
            </div>
          )}
        </header>

        {/* Stats */}
        {searched && <StatsCards stats={stats} />}

        {/* Filters */}
        <FiltersPanel filters={filters} onChange={setFilters} onSearch={handleSearch} loading={loading} />

        {/* Welcome state */}
        {!searched && !loading && (
          <div className="glass rounded-xl p-16 text-center animate-fade-in animate-delay-3">
            <div className="inline-block p-4 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, var(--accent-blue)20, var(--accent-cyan)20)' }}>
              <Zap size={40} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Pronto para buscar vagas
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Configure os filtros acima e clique em "Buscar Vagas" para coletar vagas de RemoteOK, Jobicy e Arbeitnow em tempo real.
            </p>
          </div>
        )}

        {/* Results */}
        {(searched || loading) && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setTab('table')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer`}
                style={{
                  background: tab === 'table' ? 'var(--accent-blue)' : 'transparent',
                  color: tab === 'table' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                }}
              >
                Vagas
              </button>
              <button
                onClick={() => setTab('charts')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer`}
                style={{
                  background: tab === 'charts' ? 'var(--accent-blue)' : 'transparent',
                  color: tab === 'charts' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                }}
              >
                Graficos
              </button>
            </div>

            {tab === 'table' ? (
              <JobsTable
                jobs={jobs}
                total={total}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            ) : (
              <Charts stats={stats} />
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Bot de Vagas &middot; Fontes: RemoteOK, Jobicy, Arbeitnow &middot; Dados coletados em tempo real
        </footer>
      </div>
    </div>
  )
}
