import Link from 'next/link'
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PersonalCalendar } from '@/components/personal/PersonalCalendar'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { EmptyState } from '@/components/ui/EmptyState'
import { getPersonalMonth } from '@/lib/queries'
import { formatTRY, formatMonth, monthKey } from '@/lib/format'

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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-400"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-[140px] text-center text-sm font-bold capitalize text-slate-900 dark:text-white">
            {formatMonth(monthDate)}
          </span>
          <Link
            href={`/dashboard/personal?month=${next}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-400"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Bu ay toplam</p>
          <p className="text-lg font-extrabold text-rose-500">{formatTRY(data.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PersonalCalendar year={year} month={month} byDay={data.byDay} todayKey={todayKey} />
        </div>

        <section className="glass h-fit rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Kategori dağılımı</h2>
          {data.categoryBreakdown.length ? (
            <CategoryDonut data={data.categoryBreakdown} />
          ) : (
            <EmptyState icon={Wallet} title="Bu ay kişisel harcama yok" description="Takvimden bir güne dokunarak başla." />
          )}
        </section>
      </div>
    </>
  )
}
