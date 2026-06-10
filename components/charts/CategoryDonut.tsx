'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatTRY } from '@/lib/format'
import { CHART_SERIES } from '@/lib/palette'

type Slice = { category: string; amount: number }

export function CategoryDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_SERIES[i % CHART_SERIES.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, n) => [formatTRY(v), n as string]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Toplam</span>
          <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
            {formatTRY(total, { compact: true })}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {data.slice(0, 6).map((d, i) => (
          <li key={d.category} className="flex min-w-0 items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: CHART_SERIES[i % CHART_SERIES.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300" title={d.category}>
              {d.category}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
              {formatTRY(d.amount, { compact: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
