import { useEffect, useState } from 'react'
import { Briefcase, Globe, DollarSign, TrendingUp } from 'lucide-react'
import type { Stats } from '../types'

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setDisplay(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

const cards = [
  { key: 'total', label: 'Total de Vagas', icon: Briefcase, color: 'var(--accent-blue)', gradient: 'from-blue-500/20 to-blue-600/5' },
  { key: 'remotas', label: 'Vagas Remotas', icon: Globe, color: 'var(--accent-cyan)', gradient: 'from-cyan-500/20 to-cyan-600/5' },
  { key: 'com_salario', label: 'Com Salario', icon: DollarSign, color: 'var(--accent-green)', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  { key: 'maior_salario', label: 'Maior Salario', icon: TrendingUp, color: 'var(--accent-amber)', gradient: 'from-amber-500/20 to-amber-600/5' },
] as const

export default function StatsCards({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        const value = stats ? (stats as Record<string, unknown>)[card.key] as number ?? 0 : 0
        const isCurrency = card.key === 'maior_salario'

        return (
          <div
            key={card.key}
            className={`glass rounded-xl p-5 transition-all duration-300 animate-fade-in animate-delay-${i + 1} bg-gradient-to-br ${card.gradient}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
              <div className="p-2 rounded-lg" style={{ background: `${card.color}20` }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              <AnimatedNumber
                value={Math.round(value)}
                prefix={isCurrency ? '$' : ''}
                suffix={isCurrency ? '/yr' : ''}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
