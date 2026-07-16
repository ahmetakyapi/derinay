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
import { CHART } from '@/lib/palette'
import { useMounted } from '@/hooks/useMounted'

type Point = { label: string; value: number }

/** Yıl boyu kümülatif net birikim — tek çam yeşili dalga */
export function CumulativeArea({ data }: { data: Point[] }) {
  const mounted = useMounted()
  if (!mounted) return <div className="skeleton rounded-xl" style={{ height: 260 }} aria-hidden />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 12, right: 6, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="gCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => formatTRY(v, { compact: true })}
        />
        <Tooltip
          formatter={(v: number) => [formatTRY(v), 'Birikim']}
          cursor={{ stroke: CHART.cursor, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART.primary}
          strokeWidth={3}
          strokeLinecap="round"
          fill="url(#gCumulative)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: CHART.dotRing, fill: CHART.primary }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
