import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wallet, StickyNote, CalendarDays, Crown, Hash } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PersonalCalendar } from '@/components/personal/PersonalCalendar'
import { CategoryDonut } from '@/components/charts/lazy'
import { EmptyState } from '@/components/ui/EmptyState'
import { personalCategoryIcon } from '@/components/personal/categoryIcon'
import { getPersonalMonth } from '@/lib/queries'
import { formatTRY, formatMonth, formatDayHeading, monthKey } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Kişisel Harcamalar' }

export default async function PersonalPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const data = await getPersonalMonth(searchParams.month)
  const { year, month } = data.monthDate

  const monthDate = new Date(year, month, 1)
  const prev = monthKey(new Date(year, month - 1, 1))
  const next = monthKey(new Date(year, month + 1, 1))
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const isCurrentMonth = monthKey(monthDate) === monthKey(now)

  // Özet: günlük ortalama (cari ayda geçen gün, geçmiş ayda ay uzunluğu) + zirve kategori
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth
  const dailyAvg = data.total / Math.max(elapsedDays, 1)
  const topCategory = data.categoryBreakdown[0] ?? null

  const summary = [
    {
      label: 'Bu Ay Toplam',
      value: formatTRY(data.total),
      money: true,
      icon: Wallet,
      tone: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      hint: `${data.items.length} harcama`,
    },
    {
      label: 'Günlük Ortalama',
      value: formatTRY(dailyAvg),
      money: true,
      icon: CalendarDays,
      tone: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      hint: `${elapsedDays} gün üzerinden`,
    },
    {
      label: 'En Çok Harcanan',
      value: topCategory ? topCategory.category : '—',
      money: false,
      icon: Crown,
      tone: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      hint: topCategory ? formatTRY(topCategory.amount, { compact: true }) : 'henüz veri yok',
    },
    {
      label: 'Harcama Günü',
      value: String(Object.keys(data.byDay).length),
      money: false,
      icon: Hash,
      tone: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      hint: `${daysInMonth} günün içinde`,
    },
  ]

  return (
    <>
      <PageHeader
        title="Kişisel Harcamalar"
        subtitle="İş Dışı Günlük Harcamaların — Takvimden Bir Güne Dokun ve Ekle"
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/personal?month=${prev}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
              aria-label="Önceki ay"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-[120px] text-center text-sm font-bold text-slate-900 dark:text-white sm:min-w-[140px]">
              {formatMonth(monthDate)}
            </span>
            {/* pointer-events-none klavyeyi engellemez — kapalıyken bağlantı hiç render edilmez */}
            {isCurrentMonth ? (
              <span
                aria-disabled="true"
                aria-label="Sonraki ay (bu ay son ay)"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            ) : (
              <Link
                href={`/dashboard/personal?month=${next}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
                aria-label="Sonraki ay"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        }
      />

      {/* Özet şeridi */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <span className={cn('mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg', s.bg, s.tone)}>
              <s.icon className="h-4 w-4" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
            {/* title, .sensitive filtresinden muaftır — para değerini oraya yazma */}
            <p
              className={cn('mt-0.5 truncate font-display text-lg font-semibold tracking-tight', s.money && 'sensitive', s.tone)}
              title={s.money ? undefined : s.value}
            >
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalCalendar year={year} month={month} byDay={data.byDay} todayKey={todayKey} />
        </div>

        <section className="glass flex h-full flex-col rounded-2xl p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            Kategori Dağılımı
          </h2>
          {data.categoryBreakdown.length ? (
            <CategoryDonut data={data.categoryBreakdown} />
          ) : (
            <div className="flex flex-1 items-center">
              <EmptyState icon={Wallet} title="Bu ay kişisel harcama yok" description="Takvimden bir güne dokunarak başla." />
            </div>
          )}
        </section>
      </div>

      {/* Aylık liste — gün gün, en altta ay toplamı */}
      {data.items.length > 0 && (
        <section className="glass mt-5 overflow-hidden rounded-2xl">
          <header className="flex items-center justify-between border-b border-slate-500/10 px-4 py-3.5 sm:px-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              Aylık Harcama
            </h2>
            <span className="text-xs text-slate-400">{data.items.length} harcama</span>
          </header>

          {(() => {
            // Gün bazlı grupla (tarih azalan)
            const byDate = new Map<string, typeof data.items>()
            for (const it of data.items) {
              const list = byDate.get(it.date) ?? []
              list.push(it)
              byDate.set(it.date, list)
            }
            const dayKeys = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1))
            const dayLabel = formatDayHeading

            return dayKeys.map((day) => {
              const rows = byDate.get(day)!
              const dayTotal = rows.reduce((s, r) => s + r.amount, 0)
              return (
                <div key={day}>
                  <div className="flex items-center justify-between border-b border-slate-500/10 bg-slate-500/[0.04] px-4 py-2 sm:px-5">
                    <span className="text-xs font-bold tracking-wide text-slate-600 dark:text-slate-300">
                      {dayLabel(day)}
                    </span>
                    <span className="sensitive font-mono text-xs font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      −{formatTRY(dayTotal)}
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-500/10">
                    {rows.map((it) => {
                      const Icon = personalCategoryIcon(it.category)
                      return (
                        <li key={it.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{it.category}</p>
                            {it.description && (
                              <p className="mt-0.5 flex items-start gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                                <span className="truncate">{it.description}</span>
                              </p>
                            )}
                          </div>
                          <span className="sensitive shrink-0 font-mono text-[13px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                            −{formatTRY(it.amount)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          })()}

          {/* Ay toplamı */}
          <footer className="flex items-center justify-between border-t-2 border-slate-500/15 bg-slate-500/[0.05] px-4 py-3.5 sm:px-5">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatMonth(monthDate)} Toplamı
            </span>
            <span className="sensitive font-mono text-base font-bold tabular-nums text-rose-600 dark:text-rose-400">
              −{formatTRY(data.total)}
            </span>
          </footer>
        </section>
      )}
    </>
  )
}
