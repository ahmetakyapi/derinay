'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatTRY } from '@/lib/format'

const AXIS = 'rgba(148,163,184,0.7)'
const GRID = 'rgba(148,163,184,0.12)'

type Point = { label: string; income: number; expense: number }

export function AreaTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 12, right: 6, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.16} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 6" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: AXIS, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={10}
          padding={{ left: 8, right: 8 }}
        />
        <YAxis
          tick={{ fill: AXIS, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickCount={5}
          tickFormatter={(v) => formatTRY(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number, name) => [formatTRY(v), name === 'income' ? 'Gelir' : 'Gider']}
          labelStyle={{ color: 'inherit', fontWeight: 700, marginBottom: 4 }}
          cursor={{ stroke: 'rgba(148,163,184,0.4)', strokeDasharray: '4 4' }}
        />

        {/* Gider — alta, hafif */}
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#f43f5e"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#gExpense)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
        />
        {/* Gelir — üstte, belirgin */}
        <Area
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#gIncome)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
