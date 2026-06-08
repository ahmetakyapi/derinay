'use client'

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'
import { formatTRY } from '@/lib/format'

/**
 * Ödenecek vergi içindeki KDV oranını gösteren radial gösterge.
 */
export function TaxRadial({ kdv, incomeTax }: { kdv: number; incomeTax: number }) {
  const total = kdv + incomeTax
  const pct = total > 0 ? Math.round((kdv / total) * 100) : 0
  const data = [{ name: 'KDV', value: pct, fill: '#6366f1' }]

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
          <RadialBar background={{ fill: 'rgba(148,163,184,0.12)' }} dataKey="value" cornerRadius={999} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Ödenecek toplam</span>
        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {formatTRY(total, { compact: true })}
        </span>
        <span className="mt-1 text-[11px] text-indigo-400">%{pct} KDV</span>
      </div>
    </div>
  )
}
