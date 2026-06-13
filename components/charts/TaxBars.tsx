'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatTRY } from '@/lib/format'
import { CHART } from '@/lib/palette'
import { useMounted } from '@/hooks/useMounted'

type Point = { label: string; kdvCollected: number; incomeTax: number }

/** Vergi yükü tooltip'i — KDV + gelir vergisi + toplam */
function TaxTooltip({
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
  const kdv = get('kdvCollected')
  const incomeTax = get('incomeTax')

  return (
    <div
      className="min-w-[160px] rounded-xl border px-3.5 py-3 text-xs shadow-xl backdrop-blur-md"
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
            <span className="h-2 w-2 rounded-full bg-amber-500" /> KDV
          </span>
          <span className="font-mono font-semibold tabular-nums">{formatTRY(kdv)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Gelir v.
          </span>
          <span className="font-mono font-semibold tabular-nums">{formatTRY(incomeTax)}</span>
        </div>
        <div
          className="mt-1 flex items-center justify-between gap-4 border-t pt-1.5"
          style={{ borderColor: 'rgba(var(--line), 0.14)' }}
        >
          <span className="font-semibold">Toplam</span>
          <span className="font-mono font-bold tabular-nums">{formatTRY(kdv + incomeTax)}</span>
        </div>
      </div>
    </div>
  )
}

/** Aylık vergi yükü — KDV (altın) + gelir vergisi (kil) yığılı çubuklar */
export function TaxBars({ data }: { data: Point[] }) {
  const mounted = useMounted()
  if (!mounted) return <div className="skeleton rounded-xl" style={{ height: 240 }} aria-hidden />
  return (
    <ResponsiveContainer width="100%" height={240}>
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
        <Tooltip content={<TaxTooltip />} cursor={{ fill: CHART.track }} />
        <Bar dataKey="kdvCollected" stackId="tax" fill={CHART.gold} maxBarSize={36} />
        <Bar dataKey="incomeTax" stackId="tax" fill={CHART.expense} radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
