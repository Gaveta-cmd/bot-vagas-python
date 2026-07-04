import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { Filters } from '../types'
import { FlashlightCard } from './StatsCards'

const defaultFilters: Filters = {
  technologies: 'python,javascript,react',
  keywords: '',
  location: '',
  remote_only: false,
  job_type: '',
  exclude_keywords: '',
  min_salary: '',
  max_salary: '',
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  onSearch: () => void
  loading: boolean
}

export { defaultFilters }

export default function FiltersPanel({ filters, onChange, onSearch, loading }: Props) {
  const [expanded, setExpanded] = useState(false)

  const update = (key: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [key]: value })
  }

  const reset = () => onChange(defaultFilters)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <FlashlightCard className="p-5 animate-in delay-5">
      <div className="relative z-10">
        {/* Header + main search row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--amber-glow)' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--amber)' }} />
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-secondary)' }}>
            Filtros
          </h2>
          <div className="flex-1" />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {expanded ? 'Menos filtros' : 'Mais filtros'}
          </button>
        </div>

        {/* Primary row */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Tecnologias</label>
            <input
              type="text"
              value={filters.technologies}
              onChange={e => update('technologies', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="python, react, devops"
              className="input-warm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Palavras-chave</label>
            <input
              type="text"
              value={filters.keywords}
              onChange={e => update('keywords', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="senior, lead, backend"
              className="input-warm"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Localizacao</label>
            <input
              type="text"
              value={filters.location}
              onChange={e => update('location', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="brazil, europe"
              className="input-warm"
            />
          </div>
        </div>

        {/* Expanded filters */}
        {expanded && (
          <div className="flex gap-3 flex-wrap mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="min-w-[140px]">
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Tipo</label>
              <select value={filters.job_type} onChange={e => update('job_type', e.target.value)} className="input-warm">
                <option value="">Todos</option>
                <option value="full-time">Full-Time</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part-Time</option>
              </select>
            </div>
            <div className="min-w-[120px]">
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Salario Min</label>
              <input type="number" value={filters.min_salary} onChange={e => update('min_salary', e.target.value)} placeholder="60000" className="input-warm" />
            </div>
            <div className="min-w-[120px]">
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Salario Max</label>
              <input type="number" value={filters.max_salary} onChange={e => update('max_salary', e.target.value)} placeholder="200000" className="input-warm" />
            </div>
            <div className="min-w-[160px]">
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Excluir</label>
              <input type="text" value={filters.exclude_keywords} onChange={e => update('exclude_keywords', e.target.value)} placeholder="intern, trainee" className="input-warm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-2.5">
                <input
                  type="checkbox"
                  checked={filters.remote_only}
                  onChange={e => update('remote_only', e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Apenas Remoto</span>
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <button onClick={onSearch} disabled={loading} className="btn-shimmer flex items-center gap-2 text-sm">
            <Search size={15} />
            {loading ? 'Buscando...' : 'Buscar Vagas'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'transparent' }}
          >
            <RotateCcw size={12} />
            Limpar
          </button>
        </div>
      </div>
    </FlashlightCard>
  )
}
