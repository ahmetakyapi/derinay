'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatTRY } from '@/lib/format'

const COLORS = ['#6366f1', '#10b981', '#22d3ee', '#f59e0b', '#f43f5e', '#a78bfa', '#2dd4bf', '#fb7185', '#38bdf8']

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
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, n) => [formatTRY(v), n as string]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Toplam</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {formatTRY(total, { compact: true })}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2">
        {data.slice(0, 6).map((d, i) => (
          <li key={d.category} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{d.category}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatTRY(d.amount, { compact: true })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
