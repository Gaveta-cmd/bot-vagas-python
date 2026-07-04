import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { Stats } from '../types'

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ec4899', '#14b8a6']

const tooltipStyle = {
  contentStyle: {
    background: '#1a1f35',
    border: '1px solid #2a3050',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '13px',
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#f1f5f9', fontWeight: 600 },
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
    .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 14) + '...' : name, value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in animate-delay-4">
      {/* Vagas por Tecnologia */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Vagas por Tecnologia</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={techData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" name="Vagas" radius={[4, 4, 0, 0]}>
              {techData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vagas por Fonte */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Vagas por Fonte</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={sourceData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              strokeWidth={0}
            >
              {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Salarios por Tecnologia */}
      {salaryData.length > 0 && (
        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Salario Medio por Tecnologia (USD k/ano)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salaryData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(val: number) => `$${val}k`} />
              <Bar dataKey="min" name="Min" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" name="Max" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Localizacoes */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Localizacoes</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={locationData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="value" name="Vagas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
