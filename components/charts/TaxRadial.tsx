'use client'

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'
import { formatTRY } from '@/lib/format'
import { CHART } from '@/lib/palette'
import { useMounted } from '@/hooks/useMounted'

/**
 * Bu ay ödenecek vergi göstergesi — altın halka KDV payını gösterir,
 * merkezde tam tutar (kısaltmasız) display ailesiyle.
 */
export function TaxRadial({ kdv, incomeTax }: { kdv: number; incomeTax: number }) {
  const total = kdv + incomeTax
  const pct = total > 0 ? Math.round((kdv / total) * 100) : 0
  const data = [{ name: 'KDV', value: pct, fill: CHART.gold }]
  const mounted = useMounted()

  return (
    <div className="relative h-[210px] w-full">
      {!mounted ? (
        <div className="skeleton h-full w-full rounded-2xl" aria-hidden />
      ) : (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="96%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: CHART.track }} dataKey="value" cornerRadius={999} />
        </RadialBarChart>
      </ResponsiveContainer>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Ödenecek Toplam
        </span>
        <span className="sensitive max-w-[150px] text-center font-display text-[1.45rem] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
          {formatTRY(total)}
        </span>
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          %{pct} KDV
        </span>
      </div>
    </div>
  )
}
