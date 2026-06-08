'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatTRY } from '@/lib/format'

const AXIS = 'rgba(148,163,184,0.75)'
const GRID = 'rgba(148,163,184,0.14)'

type Point = { label: string; net: number }

export function MonthlyBar({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
          formatter={(v: number) => [formatTRY(v), 'Net']}
          cursor={{ fill: 'rgba(148,163,184,0.08)' }}
        />
        <Bar dataKey="net" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.net >= 0 ? '#6366f1' : '#f43f5e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
