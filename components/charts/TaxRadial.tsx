'use client'

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'
import { formatTRY } from '@/lib/format'
import { CHART } from '@/lib/palette'

/**
 * Ödenecek vergi içindeki KDV oranını gösteren radial gösterge.
 */
export function TaxRadial({ kdv, incomeTax }: { kdv: number; incomeTax: number }) {
  const total = kdv + incomeTax
  const pct = total > 0 ? Math.round((kdv / total) * 100) : 0
  const data = [{ name: 'KDV', value: pct, fill: CHART.gold }]

  return (
    <div className="relative h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: CHART.track }} dataKey="value" cornerRadius={999} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Ödenecek toplam</span>
        <span className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {formatTRY(total, { compact: true })}
        </span>
        <span className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">%{pct} KDV</span>
      </div>
    </div>
  )
}
