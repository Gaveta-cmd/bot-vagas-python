import { Search, Filter, RotateCcw } from 'lucide-react'
import type { Filters } from '../types'

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
  const update = (key: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [key]: value })
  }

  const reset = () => {
    onChange(defaultFilters)
  }

  return (
    <div className="glass rounded-xl p-5 animate-fade-in animate-delay-2">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} style={{ color: 'var(--accent-blue)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tecnologias</label>
          <input
            type="text"
            value={filters.technologies}
            onChange={e => update('technologies', e.target.value)}
            placeholder="python, react, devops"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Palavras-chave</label>
          <input
            type="text"
            value={filters.keywords}
            onChange={e => update('keywords', e.target.value)}
            placeholder="senior, lead, backend"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Localizacao</label>
          <input
            type="text"
            value={filters.location}
            onChange={e => update('location', e.target.value)}
            placeholder="brazil, europe, remote"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tipo</label>
          <select
            value={filters.job_type}
            onChange={e => update('job_type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">Todos</option>
            <option value="full-time">Full-Time</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part-Time</option>
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Salario Min (USD/ano)</label>
          <input
            type="number"
            value={filters.min_salary}
            onChange={e => update('min_salary', e.target.value)}
            placeholder="60000"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Salario Max (USD/ano)</label>
          <input
            type="number"
            value={filters.max_salary}
            onChange={e => update('max_salary', e.target.value)}
            placeholder="200000"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Excluir</label>
          <input
            type="text"
            value={filters.exclude_keywords}
            onChange={e => update('exclude_keywords', e.target.value)}
            placeholder="intern, trainee"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input
              type="checkbox"
              checked={filters.remote_only}
              onChange={e => update('remote_only', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Apenas Remoto</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button onClick={onSearch} disabled={loading} className="btn-primary flex items-center gap-2">
          <Search size={16} />
          {loading ? 'Buscando...' : 'Buscar Vagas'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'transparent' }}
        >
          <RotateCcw size={14} />
          Limpar
        </button>
      </div>
    </div>
  )
}
