import { useEffect, useRef, useState } from 'react'
import { Briefcase, Globe, DollarSign, TrendingUp } from 'lucide-react'
import type { Stats } from '../types'

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === 0) { setDisplay(0); return }
    const duration = 1000
    const steps = 40
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

function FlashlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`flashlight-card ${className}`}>
      {children}
    </div>
  )
}

const cards = [
  { key: 'total', label: 'Total de Vagas', icon: Briefcase, color: 'var(--amber)', cardClass: 'card-amber', iconBg: 'var(--amber-glow)' },
  { key: 'remotas', label: 'Vagas Remotas', icon: Globe, color: 'var(--violet)', cardClass: 'card-violet', iconBg: 'var(--violet-glow)' },
  { key: 'com_salario', label: 'Com Salario', icon: DollarSign, color: 'var(--emerald)', cardClass: 'card-emerald', iconBg: 'var(--emerald-glow)' },
  { key: 'maior_salario', label: 'Maior Salario', icon: TrendingUp, color: 'var(--rose)', cardClass: 'card-rose', iconBg: 'var(--rose-glow)' },
] as const

export { FlashlightCard }

export default function StatsCards({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        const value = stats ? (stats as Record<string, unknown>)[card.key] as number ?? 0 : 0
        const isCurrency = card.key === 'maior_salario'

        return (
          <FlashlightCard key={card.key} className={`p-5 ${card.cardClass} animate-in delay-${i + 1}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {card.label}
                </span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.iconBg }}>
                  <Icon size={16} style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <AnimatedNumber
                  value={Math.round(value)}
                  prefix={isCurrency ? '$' : ''}
                  suffix={isCurrency ? '' : ''}
                />
              </div>
              {isCurrency && value > 0 && (
                <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>/ano USD</span>
              )}
            </div>
          </FlashlightCard>
        )
      })}
    </div>
  )
}
