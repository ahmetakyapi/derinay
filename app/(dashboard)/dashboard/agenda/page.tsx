import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Wallet, CalendarCheck2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { AgendaWeek } from '@/components/agenda/AgendaWeek'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { getAgendaWeek, getAgendaMonth, clientOptions, getReminderTemplate } from '@/lib/queries'
import { formatDateShort, formatMonth, formatTRY, monthKey } from '@/lib/format'
import { cn } from '@/lib/utils'

// Ajanda özet şeridi — premium istatistik kartları
function SummaryStrip({ tiles }: { tiles: { label: string; value: string; hint?: string; icon: typeof Clock; tone: string; bg: string; sensitive?: boolean }[] }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="glass rounded-2xl p-4">
          <span className={cn('mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg', t.bg, t.tone)}>
            <t.icon className="h-4 w-4" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{t.label}</p>
          <p className={cn('mt-0.5 font-display text-lg font-semibold tracking-tight', t.sensitive && 'sensitive', t.tone)}>{t.value}</p>
          {t.hint && <p className="mt-0.5 text-[11px] text-slate-400">{t.hint}</p>}
        </div>
      ))}
    </div>
  )
}

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const DOT: Record<string, string> = {
  indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', sky: 'bg-sky-500',
  violet: 'bg-violet-500', amber: 'bg-amber-500', rose: 'bg-rose-500',
  teal: 'bg-teal-500', cyan: 'bg-cyan-500',
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { view?: string; date?: string; month?: string }
}) {
  const view = searchParams.view === 'month' ? 'month' : 'week'
  const [clients, reminderTemplate] = await Promise.all([clientOptions(), getReminderTemplate()])

  /* ───────────────────────── Aylık görünüm ───────────────────────── */
  if (view === 'month') {
    const m = await getAgendaMonth(searchParams.month)
    const monthDate = new Date(m.year, m.month, 1)
    const prev = monthKey(new Date(m.year, m.month - 1, 1))
    const next = monthKey(new Date(m.year, m.month + 1, 1))

    const pad = (n: number) => String(n).padStart(2, '0')
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate()
    const startWeekday = (new Date(m.year, m.month, 1).getDay() + 6) % 7
    const cells: (string | null)[] = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${m.year}-${pad(m.month + 1)}-${pad(d)}`)
    while (cells.length % 7 !== 0) cells.push(null)

    const filledDays = Object.keys(m.byDay).length
    const avgPerFilled = filledDays ? m.total / filledDays : 0
    const monthTiles = [
      { label: 'Toplam Seans', value: String(m.total), hint: formatMonth(monthDate), icon: CalendarDays, tone: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
      { label: 'Dolu Gün', value: String(filledDays), hint: `${daysInMonth} günde`, icon: CalendarCheck2, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
      { label: 'Günde Ortalama', value: avgPerFilled.toFixed(1).replace('.', ','), hint: 'dolu günlerde', icon: Clock, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    ]

    return (
      <>
        <PageHeader
          title="Ajanda"
          subtitle={`${m.total} seans · ${formatMonth(monthDate)}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <ViewToggle view="month" />
              <Link href={`/dashboard/agenda?view=month&month=${prev}`} aria-label="Önceki ay" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="min-w-[110px] text-center text-sm font-bold capitalize text-slate-900 dark:text-white">
                {formatMonth(monthDate)}
              </span>
              <Link href={`/dashboard/agenda?view=month&month=${next}`} aria-label="Sonraki ay" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300">
                <ChevronRight className="h-4 w-4" />
              </Link>
              <NewSessionDialog clients={clients} />
            </div>
          }
        />

        <SummaryStrip tiles={monthTiles} />

        <div className="glass rounded-2xl p-3 sm:p-4">
          <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {cells.map((key, i) => {
              if (!key) return <div key={i} className="min-h-[64px] sm:min-h-[104px]" />
              const day = Number(key.split('-')[2])
              const items = m.byDay[key] ?? []
              const isToday = key === m.todayKey
              return (
                <Link
                  key={key}
                  href={`/dashboard/agenda?view=week&date=${key}`}
                  className={cn(
                    'flex min-h-[64px] flex-col rounded-lg border p-1 transition-all sm:min-h-[104px] sm:rounded-xl sm:p-2',
                    'border-slate-500/10 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5',
                    isToday && 'border-indigo-500/50 ring-1 ring-indigo-500/40',
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn(
                      'font-bold leading-none',
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white'
                        : 'text-[11px] text-slate-500 dark:text-slate-300 sm:text-xs',
                    )}>
                      {day}
                    </span>
                    {items.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400 sm:text-[10px]">{items.length}</span>
                    )}
                  </div>
                  <div className="hidden flex-1 flex-col gap-0.5 sm:flex">
                    {items.slice(0, 3).map((it) => (
                      <span key={it.id} className="flex items-center gap-1 truncate rounded bg-slate-500/[0.06] px-1 py-0.5 text-[9px] text-slate-600 dark:text-slate-300">
                        <span className={cn('h-1 w-1 shrink-0 rounded-full', DOT[it.colorTag] ?? DOT.indigo)} />
                        <span className="font-mono font-semibold">{it.time}</span>
                        <span className="truncate">{it.clientName}</span>
                      </span>
                    ))}
                    {items.length > 3 && (
                      <span className="text-[9px] text-slate-400">+{items.length - 3} daha</span>
                    )}
                  </div>
                  {/* Mobil: nokta dizisi */}
                  {items.length > 0 && (
                    <div className="mt-auto flex gap-0.5 sm:hidden">
                      {items.slice(0, 4).map((it) => (
                        <span key={it.id} className={cn('h-1.5 w-1.5 rounded-full', DOT[it.colorTag] ?? DOT.indigo)} />
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  /* ───────────────────────── Haftalık görünüm ───────────────────────── */
  const week = await getAgendaWeek(searchParams.date)
  const weekRange = `${formatDateShort(week.days[0].key)} – ${formatDateShort(week.days[6].key)}`
  const items = week.days.flatMap((d) => d.items)
  const total = items.length
  const isCurrentWeek = week.days.some((d) => d.key === week.todayKey)

  // Özet: tamamlanan + planlanan üzerinden saat & beklenen gelir
  const active = items.filter((i) => i.status === 'scheduled' || i.status === 'completed')
  const completed = items.filter((i) => i.status === 'completed').length
  const totalHours = active.reduce((s, i) => s + i.durationMin, 0) / 60
  const expectedIncome = active.reduce((s, i) => s + i.fee, 0)
  const weekTiles = [
    { label: 'Toplam Seans', value: String(total), hint: weekRange, icon: CalendarDays, tone: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Planlanan Saat', value: `${totalHours.toFixed(1).replace('.', ',')} sa`, hint: 'tamamlanan + planlanan', icon: Clock, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Beklenen Gelir', value: formatTRY(expectedIncome, { compact: true }), hint: 'bu hafta', icon: Wallet, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', sensitive: true },
    { label: 'Tamamlanan', value: `${completed}`, hint: `${total} seansın`, icon: CalendarCheck2, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  ]

  return (
    <>
      <PageHeader
        title="Ajanda"
        subtitle={`${total} seans · ${weekRange}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle view="week" />
            <Link href={`/dashboard/agenda?view=week&date=${week.prevAnchor}`} aria-label="Önceki hafta" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {!isCurrentWeek && (
              <Link href="/dashboard/agenda" className="rounded-xl border border-slate-500/20 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300">
                Bugün
              </Link>
            )}
            <Link href={`/dashboard/agenda?view=week&date=${week.nextAnchor}`} aria-label="Sonraki hafta" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300">
              <ChevronRight className="h-4 w-4" />
            </Link>
            <NewSessionDialog clients={clients} />
          </div>
        }
      />

      <SummaryStrip tiles={weekTiles} />
      <AgendaWeek days={week.days} todayKey={week.todayKey} reminderTemplate={reminderTemplate} />
    </>
  )
}

function ViewToggle({ view }: { view: 'week' | 'month' }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-500/15 p-1">
      <Link
        href="/dashboard/agenda?view=week"
        className={cn(
          'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
          view === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
        )}
      >
        Hafta
      </Link>
      <Link
        href="/dashboard/agenda?view=month"
        className={cn(
          'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
          view === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
        )}
      >
        Ay
      </Link>
    </div>
  )
}
