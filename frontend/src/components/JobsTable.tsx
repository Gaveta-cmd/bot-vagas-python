import { ExternalLink, MapPin, DollarSign, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Job } from '../types'

const fonteColors: Record<string, string> = {
  RemoteOK: 'var(--accent-blue)',
  Jobicy: 'var(--accent-green)',
  Arbeitnow: 'var(--accent-amber)',
}

interface Props {
  jobs: Job[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  loading: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }} title="Copiar link">
      {copied ? <Check size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
    </button>
  )
}

export default function JobsTable({ jobs, total, page, totalPages, onPageChange, loading }: Props) {
  if (loading) {
    return (
      <div className="glass rounded-xl p-12 text-center animate-fade-in">
        <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Coletando vagas das APIs...</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center animate-fade-in">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Nenhuma vaga encontrada</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tente ajustar os filtros e buscar novamente</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in animate-delay-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Vagas <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({total} resultados)</span>
        </h2>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const fonteColor = fonteColors[job.fonte] || 'var(--text-muted)'
          const hasSalary = job.salario_min != null && job.salario_min > 0

          return (
            <div key={job.id} className="glass rounded-xl p-4 transition-all duration-200 hover:scale-[1.005]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                      {job.titulo}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: `${fonteColor}20`, color: fonteColor }}
                    >
                      {job.fonte}
                    </span>
                    {job.remoto && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ background: 'var(--accent-cyan)20', color: 'var(--accent-cyan)' }}
                      >
                        Remoto
                      </span>
                    )}
                  </div>

                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {job.empresa}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.localizacao}
                    </span>

                    {hasSalary && (
                      <span className="flex items-center gap-1" style={{ color: 'var(--accent-green)' }}>
                        <DollarSign size={12} />
                        {job.moeda} {Math.round(job.salario_min!).toLocaleString()}
                        {job.salario_max ? ` - ${Math.round(job.salario_max).toLocaleString()}` : ''}/yr
                      </span>
                    )}

                    {job.tags && (
                      <span className="flex items-center gap-1 truncate max-w-[300px]">
                        <Tag size={12} />
                        {job.tags}
                      </span>
                    )}

                    {job.data_publicacao && (
                      <span>{job.data_publicacao}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <CopyButton text={job.link} />
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--accent-blue)' }}
                    title="Abrir vaga"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Pagina {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
