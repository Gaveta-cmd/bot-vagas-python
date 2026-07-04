import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Stats } from '../types'
import { FlashlightCard } from './StatsCards'

const COLORS = ['#f59e0b', '#8b5cf6', '#34d399', '#fb7185', '#06b6d4', '#f472b6', '#a78bfa', '#fbbf24']

const tooltipStyle = {
  contentStyle: {
    background: '#1c1917',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fafaf9',
    fontSize: '12px',
    fontFamily: "'Space Grotesk', sans-serif",
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  itemStyle: { color: '#a8a29e' },
  labelStyle: { color: '#fafaf9', fontWeight: 600 },
}

export default function Charts({ stats }: { stats: Stats | null }) {
  if (!stats || stats.total === 0) return null

  const techData = Object.entries(stats.por_tecnologia || {}).map(([name, value]) => ({ name, value }))
  const sourceData = Object.entries(stats.por_fonte || {}).map(([name, value]) => ({ name, value }))

  const salaryData = Object.entries(stats.salary_by_tech || {}).map(([tech, data]) => ({
    name: tech,
    min: Math.round(data.avg_min / 1000),
    max: Math.round(data.avg_max / 1000),
  }))

  const locationData = Object.entries(stats.por_localizacao || {})
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 12) + '...' : name, value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Vagas por Tecnologia */}
      <FlashlightCard className="p-5 animate-in delay-1">
        <div className="relative z-10">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Vagas por Tecnologia
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={techData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#78716c', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Vagas" radius={[6, 6, 0, 0]}>
                {techData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FlashlightCard>

      {/* Vagas por Fonte */}
      <FlashlightCard className="p-5 animate-in delay-2">
        <div className="relative z-10">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Vagas por Fonte
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                strokeWidth={0}
              >
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value) => <span style={{ color: '#a8a29e', fontSize: '11px', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </FlashlightCard>

      {/* Salarios por Tecnologia */}
      {salaryData.length > 0 && (
        <FlashlightCard className="p-5 animate-in delay-3">
          <div className="relative z-10">
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
              Salario Medio (USD k/ano)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salaryData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#a8a29e', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(val: number) => `$${val}k`} />
                <Bar dataKey="min" name="Min" fill="#34d399" radius={[6, 6, 0, 0]} />
                <Bar dataKey="max" name="Max" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FlashlightCard>
      )}

      {/* Top Localizacoes */}
      <FlashlightCard className="p-5 animate-in delay-4">
        <div className="relative z-10">
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-muted)', fontFamily: "'Space Grotesk', sans-serif" }}>
            Top Localizacoes
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={locationData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#78716c', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#a8a29e', fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" name="Vagas" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FlashlightCard>
    </div>
  )
}
