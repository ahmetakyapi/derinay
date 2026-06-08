import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Plus,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { AreaTrendChart } from '@/components/charts/AreaTrendChart'
import { CategoryDonut } from '@/components/charts/CategoryDonut'
import { MonthlyBar } from '@/components/charts/MonthlyBar'
import { getDashboard } from '@/lib/queries'
import { formatTRY, formatDateShort, formatMonth, pctChange } from '@/lib/format'

export default async function DashboardPage() {
  const d = await getDashboard()
  const k = d.kpis

  return (
    <>
      <PageHeader
        title="Genel Bakış"
        subtitle={`${formatMonth(new Date())} · ${d.activeClientCount} aktif danışan`}
        action={
          <Link
            href="/dashboard/finances"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Yeni işlem
          </Link>
        }
      />

      {/* KPI kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aylık gelir"
          value={formatTRY(k.income)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
          change={pctChange(k.income, k.prevIncome)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Aylık gider"
          value={formatTRY(k.expense)}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
          change={pctChange(k.expense, k.prevExpense)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Net kâr"
          value={formatTRY(k.net)}
          icon={<Wallet className="h-5 w-5" />}
          accent="indigo"
          change={pctChange(k.net, k.prevNet)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Ödenecek vergi"
          value={formatTRY(k.taxDue)}
          icon={<Landmark className="h-5 w-5" />}
          accent="amber"
          hint={`KDV ${formatTRY(d.tax.kdvCollected, { compact: true })} + gelir v.`}
        />
      </div>

      {/* Grafikler */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gelir & Gider akışı</h2>
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
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Gider kategorileri</h2>
          {d.categoryBreakdown.length ? (
            <CategoryDonut data={d.categoryBreakdown} />
          ) : (
            <EmptyState icon={Wallet} title="Bu ay gider yok" />
          )}
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Aylık net</h2>
          <MonthlyBar data={d.trend} />
        </section>

        {/* Son işlemler */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Son işlemler</h2>
          {d.recent.length ? (
            <ul className="space-y-3">
              {d.recent.map((t) => {
                const income = t.type === 'income'
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        income ? 'bg-emerald-500/12 text-emerald-500' : 'bg-rose-500/12 text-rose-500'
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
                      className={`text-sm font-semibold ${
                        income ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {income ? '+' : '−'}
                      {formatTRY(t.amount, { compact: true })}
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
    </>
  )
}
