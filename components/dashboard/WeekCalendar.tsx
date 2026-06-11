import Link from 'next/link'
import { cn } from '@/lib/utils'

const DOT: Record<string, string> = {
  indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', sky: 'bg-sky-400',
  violet: 'bg-violet-400', amber: 'bg-amber-400', rose: 'bg-rose-400',
  teal: 'bg-teal-400', cyan: 'bg-cyan-400',
}

type Item = {
  id: string
  time: string
  clientName: string
  clientId: string | null
  colorTag: string
  status: string
  durationMin: number
}
type Day = { key: string; label: string; dayNum: number; items: Item[] }

export function WeekCalendar({ days, todayKey }: { days: Day[]; todayKey: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {days.map((d) => {
        const isToday = d.key === todayKey
        return (
          <div
            key={d.key}
            className={cn(
              'flex min-h-[120px] flex-col rounded-xl border p-2.5 transition-colors',
              isToday ? 'border-indigo-500/40 bg-indigo-500/[0.06] shadow-lg shadow-indigo-500/5' : 'border-slate-500/10',
            )}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <span className={cn('text-[11px] font-semibold uppercase', isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
                {d.label}
              </span>
              <span className={cn('relative text-sm font-bold', isToday ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300')}>
                {d.dayNum}
                {isToday && <span className="absolute -right-2 top-0 h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              {d.items.length ? (
                d.items.map((s) => {
                  const dim = s.status === 'cancelled' || s.status === 'no_show'
                  const chip = (
                    <div
                      className={cn(
                        'rounded-lg border border-slate-500/10 bg-white/55 px-2 py-1.5 transition-colors dark:bg-white/[0.03]',
                        !dim && 'hover:border-indigo-500/30',
                        dim && 'opacity-50',
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT[s.colorTag] ?? DOT.indigo)} />
                        <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-200">{s.time}</span>
                      </div>
                      <p className={cn('sensitive mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300', dim && 'line-through')}>
                        {s.clientName}
                      </p>
                    </div>
                  )
                  return s.clientId ? (
                    <Link key={s.id} href={`/dashboard/clients/${s.clientId}`}>{chip}</Link>
                  ) : (
                    <div key={s.id}>{chip}</div>
                  )
                })
              ) : (
                <span className="mt-auto text-center text-[11px] text-slate-300 dark:text-slate-600">—</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
