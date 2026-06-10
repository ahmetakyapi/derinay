import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  HandCoins,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Plus,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { WeekCalendar } from '@/components/dashboard/WeekCalendar'
import { AreaTrendChart } from '@/components/charts/AreaTrendChart'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { MonthlyBar } from '@/components/charts/MonthlyBar'
import { getDashboard, getWeekSessions, getOutstandingBalances, clientOptions } from '@/lib/queries'
import { formatTRY, formatDateShort, formatMonth, pctChange } from '@/lib/format'
import { USER } from '@/lib/constants'
import { greetingNow, quoteOfTheDay } from '@/lib/quotes'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const weekOffset = Number.isFinite(Number(searchParams.week)) ? Number(searchParams.week) : 0
  const [d, week, out, clients] = await Promise.all([
    getDashboard(),
    getWeekSessions(weekOffset),
    getOutstandingBalances(),
    clientOptions(),
  ])
  const k = d.kpis
  const weekTotal = week.days.reduce((s, day) => s + day.items.length, 0)
  const weekRange = `${formatDateShort(week.days[0].key)} – ${formatDateShort(week.days[6].key)}`
  const weekTitle = weekOffset === 0 ? 'Bu Haftanın Seansları' : 'Haftalık Seanslar'
  const quote = quoteOfTheDay()

  return (
    <>
      <PageHeader
        title={`${greetingNow()}, ${USER.firstName}`}
        subtitle={`${formatMonth(new Date())} · ${d.activeClientCount} aktif danışan · bu hafta ${weekTotal} seans`}
        action={
          <div className="flex items-center gap-2">
            <NewSessionDialog clients={clients} />
            <Link
              href="/dashboard/finances"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Yeni İşlem
            </Link>
          </div>
        }
      />

      {/* Günün sözü — sükûnet dokunuşu */}
      <p className="-mt-3 mb-6 font-display text-sm italic leading-relaxed text-slate-500 dark:text-slate-400">
        <span className="mr-1 font-semibold text-amber-500">“</span>
        {quote.text}
        <span className="ml-1 font-semibold text-amber-500">”</span>
        <span className="ml-2 text-xs not-italic text-slate-400">— {quote.author}</span>
      </p>

      {/* Gecikmiş fatura uyarısı */}
      {out.overdueCount > 0 && (
        <Link
          href="/dashboard/invoices"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 transition-colors hover:border-rose-500/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-bold">{out.overdueCount} gecikmiş fatura</span>
            <span className="text-slate-500 dark:text-slate-400"> · toplam </span>
            <span className="font-mono font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              {formatTRY(out.overdueTotal, { compact: true })}
            </span>
          </p>
          <span className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400">İncele →</span>
        </Link>
      )}

      {/* KPI kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aylık Gelir"
          value={formatTRY(k.income)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
          change={pctChange(k.income, k.prevIncome)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Aylık Gider"
          value={formatTRY(k.expense)}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
          change={pctChange(k.expense, k.prevExpense)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Net Kâr"
          value={formatTRY(k.net)}
          icon={<Wallet className="h-5 w-5" />}
          accent="indigo"
          change={pctChange(k.net, k.prevNet)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Ödenecek Vergi"
          value={formatTRY(k.taxDue)}
          icon={<Landmark className="h-5 w-5" />}
          accent="amber"
          hint={`KDV ${formatTRY(d.tax.kdvCollected, { compact: true })} + gelir v.`}
        />
      </div>

      {/* Haftalık seans takvimi */}
      <section className="glass mt-6 rounded-2xl p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            <CalendarDays className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> {weekTitle}
          </h2>
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">{weekRange}</span>
            <Link
              href={`/dashboard?week=${weekOffset - 1}`}
              scroll={false}
              aria-label="Önceki hafta"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {weekOffset !== 0 && (
              <Link
                href="/dashboard"
                scroll={false}
                className="rounded-lg border border-slate-500/20 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
              >
                Bugün
              </Link>
            )}
            <Link
              href={`/dashboard?week=${weekOffset + 1}`}
              scroll={false}
              aria-label="Sonraki hafta"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <WeekCalendar days={week.days} todayKey={week.todayKey} />
      </section>

      {/* Grafikler */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Gelir & Gider Akışı</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Gelir
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Gider
              </span>
            </div>
          </div>
          <AreaTrendChart data={d.trend} />
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Gider Kategorileri</h2>
          {d.categoryBreakdown.length ? (
            <CategoryDonut data={d.categoryBreakdown} />
          ) : (
            <EmptyState icon={Wallet} title="Bu ay gider yok" />
          )}
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Aylık Net</h2>
          <MonthlyBar data={d.trend} />
        </section>

        {/* Son işlemler */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Son İşlemler</h2>
          {d.recent.length ? (
            <ul className="space-y-3">
              {d.recent.map((t) => {
                const income = t.type === 'income'
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        income ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {income ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {t.category}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateShort(t.date)}</p>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[13px] font-semibold tabular-nums ${
                        income ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {income ? '+' : '−'}
                      {formatTRY(t.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState icon={Users} title="Henüz işlem yok" />
          )}
        </section>
      </div>

      {/* Bekleyen tahsilat — kim ne kadar borçlu */}
      <section className="glass mt-6 rounded-2xl p-5">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
          <HandCoins className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Bekleyen Tahsilat
        </h2>
        {out.balances.length ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {out.balances.map((b) => (
              <Link
                key={b.id}
                href={`/dashboard/clients/${b.id}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-500/10 p-3 transition-all hover:-translate-y-0.5 hover:border-amber-500/40"
              >
                <Avatar name={b.name} color={b.colorTag} src={b.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-amber-700 dark:text-slate-200 dark:group-hover:text-amber-300">
                  {b.name}
                </span>
                <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatTRY(b.outstanding, { compact: true })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center font-display text-sm italic text-slate-400">
            Tüm tahsilatlar tamamlandı — defter temiz ✨
          </p>
        )}
      </section>
    </>
  )
}
