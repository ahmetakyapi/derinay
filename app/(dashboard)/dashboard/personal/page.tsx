import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wallet, StickyNote } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PersonalCalendar } from '@/components/personal/PersonalCalendar'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { EmptyState } from '@/components/ui/EmptyState'
import { getPersonalMonth } from '@/lib/queries'
import { formatTRY, formatMonth, monthKey, formatDateShort } from '@/lib/format'

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
  const todayKey = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  return (
    <>
      <PageHeader
        title="Kişisel Harcamalar"
        subtitle="İş dışı, kişisel günlük harcamaların — takvimden bir güne dokun ve ekle"
      />

      {/* Ay navigasyonu + toplam */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/personal?month=${prev}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-[140px] text-center text-sm font-bold capitalize text-slate-900 dark:text-white">
            {formatMonth(monthDate)}
          </span>
          <Link
            href={`/dashboard/personal?month=${next}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Bu ay toplam</p>
          <p className="font-display text-xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">{formatTRY(data.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalCalendar year={year} month={month} byDay={data.byDay} todayKey={todayKey} />
        </div>

        <div className="space-y-5">
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Kategori dağılımı</h2>
            {data.categoryBreakdown.length ? (
              <CategoryDonut data={data.categoryBreakdown} />
            ) : (
              <EmptyState icon={Wallet} title="Bu ay kişisel harcama yok" description="Takvimden bir güne dokunarak başla." />
            )}
          </section>

          {data.items.length > 0 && (
            <section className="glass rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Harcama detayları</h2>
                <span className="text-xs text-slate-400">{data.items.length} harcama</span>
              </div>
              <ul className="max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                {data.items.map((it) => (
                  <li key={it.id} className="flex items-start gap-3 rounded-xl border border-slate-500/10 p-3">
                    <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <span className="text-[10px] font-bold leading-none">{formatDateShort(it.date).split(' ')[0]}</span>
                      <span className="text-[9px] uppercase leading-tight">{formatDateShort(it.date).split(' ')[1]}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{it.category}</p>
                      {it.description && (
                        <p className="flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                          <span className="truncate">{it.description}</span>
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-rose-600 dark:text-rose-400">−{formatTRY(it.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
