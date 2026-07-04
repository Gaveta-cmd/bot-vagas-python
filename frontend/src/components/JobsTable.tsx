import { ExternalLink, MapPin, DollarSign, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import { useState, useRef } from 'react'
import type { Job } from '../types'

const fonteClasses: Record<string, string> = {
  RemoteOK: 'badge-remoteok',
  Jobicy: 'badge-jobicy',
  Arbeitnow: 'badge-arbeitnow',
}

interface Props {
  jobs: Job[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  loading: boolean
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg transition-all cursor-pointer hover:bg-white/5" title="Copiar link">
      {copied ? <Check size={13} style={{ color: 'var(--emerald)' }} /> : <Copy size={13} style={{ color: 'var(--text-muted)' }} />}
    </button>
  )
}

function JobRow({ job, index }: { job: Job; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const hasSalary = job.salario_min != null && job.salario_min > 0

  return (
    <div
      ref={ref}
      className="job-row rounded-2xl p-4 animate-in"
      style={{ animationDelay: `${0.04 * index}s`, borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {job.titulo}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${fonteClasses[job.fonte] || ''}`}>
              {job.fonte}
            </span>
            {job.remoto && (
              <span className="badge-remote text-[10px] px-2 py-0.5 rounded-full font-medium">
                Remoto
              </span>
            )}
          </div>

          {/* Company */}
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            {job.empresa}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {job.localizacao}
            </span>

            {hasSalary && (
              <span className="flex items-center gap-1" style={{ color: 'var(--emerald)' }}>
                <DollarSign size={11} />
                {job.moeda} {Math.round(job.salario_min!).toLocaleString()}
                {job.salario_max ? ` – ${Math.round(job.salario_max).toLocaleString()}` : ''}/yr
              </span>
            )}

            {job.tags && (
              <span className="flex items-center gap-1 truncate max-w-[280px]">
                <Tag size={11} />
                {job.tags}
              </span>
            )}

            {job.data_publicacao && (
              <span style={{ color: 'var(--text-muted)' }}>{job.data_publicacao}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <CopyBtn text={job.link} />
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--amber)' }}
            title="Abrir vaga"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function JobsTable({ jobs, total, page, totalPages, onPageChange, loading }: Props) {
  if (loading) {
    return (
      <div className="flashlight-card rounded-2xl p-16 text-center animate-in">
        <div className="relative z-10">
          <div className="inline-block w-10 h-10 rounded-full animate-spin mb-4"
            style={{ border: '2px solid var(--border)', borderTopColor: 'var(--amber)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Coletando vagas das APIs...
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>RemoteOK, Jobicy, Arbeitnow</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flashlight-card rounded-2xl p-16 text-center animate-in">
        <div className="relative z-10">
          <p className="text-lg" style={{ color: 'var(--text-secondary)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Nenhuma vaga encontrada
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tente ajustar os filtros</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in delay-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Vagas
          <span className="text-xs font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
            {total} resultados
          </span>
        </h2>
      </div>

      <div className="flashlight-card rounded-2xl overflow-hidden">
        <div className="relative z-10 divide-y" style={{ borderColor: 'var(--border)' }}>
          {jobs.map((job, i) => (
            <JobRow key={job.id} job={job} index={i} />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-20"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-xl transition-all cursor-pointer disabled:opacity-20"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
