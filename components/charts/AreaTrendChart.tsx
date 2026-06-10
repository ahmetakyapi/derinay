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

type Point = { label: string; income: number; expense: number }

/** Ay üstüne gelince: gelir, gider ve FARK birlikte görünür */
function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { dataKey?: string | number; value?: number | string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const get = (key: string) => Number(payload.find((p) => p.dataKey === key)?.value ?? 0)
  const income = get('income')
  const expense = get('expense')
  const net = income - expense

  return (
    <div
      className="min-w-[170px] rounded-xl border px-3.5 py-3 text-xs shadow-xl backdrop-blur-md"
      style={{
        background: 'rgba(var(--paper), 0.97)',
        borderColor: 'rgba(var(--line), 0.16)',
        color: 'var(--ink)',
      }}
    >
      <p className="mb-2 font-bold capitalize">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Gelir
          </span>
          <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatTRY(income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Gider
          </span>
          <span className="font-mono font-semibold tabular-nums text-rose-600 dark:text-rose-400">
            {formatTRY(expense)}
          </span>
        </div>
        <div
          className="mt-1 flex items-center justify-between gap-4 border-t pt-1.5"
          style={{ borderColor: 'rgba(var(--line), 0.14)' }}
        >
          <span className="font-semibold">Fark</span>
          <span
            className={`font-mono font-bold tabular-nums ${
              net >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {net >= 0 ? '+' : '−'}{formatTRY(Math.abs(net))}
          </span>
        </div>
      </div>
    </div>
  )
}

export function AreaTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 12, right: 6, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.income} stopOpacity={0.28} />
            <stop offset="95%" stopColor={CHART.income} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.expense} stopOpacity={0.16} />
            <stop offset="95%" stopColor={CHART.expense} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 6" stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={10}
          padding={{ left: 8, right: 8 }}
        />
        <YAxis
          tick={{ fill: CHART.axis, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickCount={5}
          tickFormatter={(v) => formatTRY(v, { compact: true })}
        />
        <Tooltip
          content={<FlowTooltip />}
          cursor={{ stroke: CHART.cursor, strokeDasharray: '4 4' }}
        />

        {/* Gider — alta, hafif */}
        <Area
          type="monotone"
          dataKey="expense"
          stroke={CHART.expense}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#gExpense)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: CHART.expense }}
        />
        {/* Gelir — üstte, belirgin */}
        <Area
          type="monotone"
          dataKey="income"
          stroke={CHART.income}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#gIncome)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: CHART.income }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
