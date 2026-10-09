'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useMounted } from '@/hooks/useMounted'
import { formatTRY } from '@/lib/format'
import { CHART_SERIES } from '@/lib/palette'

type Slice = { category: string; amount: number }

const MAX_ROWS = 6

/** Kâğıt stilinde özel tooltip — kategori + tam tutar + pay */
function DonutTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: { fill?: string } }[]
  total: number
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const value = Number(item.value ?? 0)
  const pct = total ? Math.round((value / total) * 100) : 0

  return (
    <div
      className="max-w-[220px] rounded-xl border px-3 py-2.5 text-xs shadow-xl backdrop-blur-md"
      style={{
        background: 'rgba(var(--paper), 0.97)',
        borderColor: 'rgba(var(--line), 0.16)',
        color: 'var(--ink)',
      }}
    >
      <p className="mb-1 flex items-center gap-1.5 font-semibold">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.payload?.fill }} />
        <span className="min-w-0 truncate">{item.name}</span>
      </p>
      <p className="flex items-baseline justify-between gap-3">
        <span className="font-mono font-bold tabular-nums">{formatTRY(value)}</span>
        <span className="text-slate-400">%{pct}</span>
      </p>
    </div>
  )
}

/**
 * Kategori donut'u — dar kartlarda da okunur: halka üstte,
 * lejant altta tam genişlik satırlar (isim + % + tutar).
 */
export function CategoryDonut({ data }: { data: Slice[] }) {
  const mounted = useMounted()
  const total = data.reduce((s, d) => s + d.amount, 0)
  const rows = data.slice(0, MAX_ROWS)
  const rest = data.slice(MAX_ROWS)
  const restTotal = rest.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[168px] w-[168px] shrink-0">
        {!mounted ? (
          <div className="skeleton h-full w-full rounded-full" aria-hidden />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_SERIES[i % CHART_SERIES.length]} />
              ))}
            </Pie>
            <Tooltip
              content={<DonutTooltip total={total} />}
              wrapperStyle={{ zIndex: 20, outline: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Toplam</span>
          <span className="sensitive font-display text-base font-semibold text-slate-900 dark:text-white">
            {formatTRY(total, { compact: true })}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {rows.map((d, i) => {
          const pct = total ? Math.round((d.amount / total) * 100) : 0
          return (
            <li key={d.category} className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: CHART_SERIES[i % CHART_SERIES.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300" title={d.category}>
                  {d.category}
                </span>
                <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
                  %{pct}
                </span>
                <span className="sensitive shrink-0 whitespace-nowrap font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatTRY(d.amount, { compact: true })}
                </span>
              </div>
              {/* Oran çubuğu */}
              <div className="ml-5 mt-1.5 h-1 overflow-hidden rounded-full bg-slate-500/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: CHART_SERIES[i % CHART_SERIES.length],
                    opacity: 0.75,
                  }}
                />
              </div>
            </li>
          )
        })}
        {rest.length > 0 && (
          <li className="flex items-center gap-2.5 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400/40" />
            <span className="flex-1">+{rest.length} diğer kategori</span>
            <span className="sensitive shrink-0 font-mono font-semibold tabular-nums">
              {formatTRY(restTotal, { compact: true })}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}
