'use client'

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART } from '@/lib/palette'

type Point = { label: string; value: number }

/** Tek ölçeğin zaman içindeki puan eğrisi — ilerleme görselleştirmesi */
export function ScoreTrend({ data, max }: { data: Point[]; max?: number | null }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 6" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
          domain={[0, max || 'auto']}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(v: number) => [v, 'Puan']}
          cursor={{ stroke: CHART.cursor, strokeDasharray: '4 4' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART.primary}
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: CHART.primary, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
