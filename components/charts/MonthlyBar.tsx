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
import { CHART } from '@/lib/palette'
import { useMounted } from '@/hooks/useMounted'

type Point = { label: string; net: number }

export function MonthlyBar({ data }: { data: Point[] }) {
  const mounted = useMounted()
  if (!mounted) return <div className="skeleton rounded-xl" style={{ height: 280 }} aria-hidden />
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => formatTRY(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number) => [formatTRY(v), 'Net']}
          cursor={{ fill: CHART.track }}
        />
        <Bar dataKey="net" radius={[6, 6, 0, 0]} maxBarSize={42}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.net >= 0 ? CHART.primary : CHART.expense} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
