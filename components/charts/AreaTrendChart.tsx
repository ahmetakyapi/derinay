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

const AXIS = 'rgba(148,163,184,0.75)'
const GRID = 'rgba(148,163,184,0.14)'

type Point = { label: string; income: number; expense: number }

export function AreaTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: AXIS, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => formatTRY(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number, name) => [formatTRY(v), name === 'income' ? 'Gelir' : 'Gider']}
          labelStyle={{ color: 'inherit', fontWeight: 600 }}
          cursor={{ stroke: GRID }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#gIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#f43f5e"
          strokeWidth={2.5}
          fill="url(#gExpense)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
