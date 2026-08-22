import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  FileDown,
  CalendarCheck2,
  Banknote,
  CreditCard,
  Landmark,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { AreaTrendChart, MonthlyBar, CumulativeArea, CategoryDonut } from '@/components/charts/lazy'
import { getYearAnalytics } from '@/lib/queries'
import { formatTRY } from '@/lib/format'
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Analiz' }

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Landmark,
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200', className)}>
      {children}
    </h2>
  )
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const currentYear = new Date().getFullYear()
  const parsed = Number(searchParams.year)
  const year = Number.isInteger(parsed) && parsed >= 2000 && parsed <= currentYear + 1 ? parsed : currentYear
  const a = await getYearAnalytics(year)

  const completionPct = a.sessionStats.total
    ? Math.round((a.sessionStats.completed / a.sessionStats.total) * 100)
    : 0
  const noShowPct = a.sessionStats.total
    ? Math.round((a.sessionStats.noShow / a.sessionStats.total) * 100)
    : 0
  const maxClient = a.topClients[0]?.amount ?? 0
  // net > 0 şartı yanıltıcıydı: her ayı zararla kapatan bir yılda veri VAR ama
  // kart "henüz veri yok" diyordu. Veri varlığını kayıt varlığından türet.
  const hasYearData = a.totals.income > 0 || a.totals.expense > 0
  const methodMax = Math.max(...a.methodTotals.map((m) => m.amount), 1)

  const sessionBars = [
    { label: 'Tamamlandı', count: a.sessionStats.completed, cls: 'bg-emerald-500' },
    { label: 'Planlandı', count: a.sessionStats.scheduled, cls: 'bg-sky-500' },
    { label: 'İptal', count: a.sessionStats.cancelled, cls: 'bg-slate-400' },
    { label: 'Gelmedi', count: a.sessionStats.noShow, cls: 'bg-rose-500' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Finans"
        title="Analiz"
        subtitle={`${year} yılının finansal hikâyesi — ay ay, kalem kalem`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/analytics?year=${year - 1}`}
              aria-label="Önceki yıl"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="min-w-[64px] text-center font-display text-lg font-semibold text-slate-900 dark:text-white">
              {year}
            </span>
            <Link
              href={`/dashboard/analytics?year=${year + 1}`}
              aria-label="Sonraki yıl"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300',
                year >= currentYear && 'pointer-events-none opacity-40',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/reports/${year}/print`}
              target="_blank"
              className="ml-1 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
            >
              <FileDown className="h-4 w-4" /> PDF Rapor
            </Link>
          </div>
        }
      />

      {/* Yıllık KPI'lar — mobilde 2'li galeri rafı */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label={`${year} Geliri`}
          value={formatTRY(a.totals.income)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label={`${year} Gideri`}
          value={formatTRY(a.totals.expense)}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
        />
        <StatCard
          label="Net Kâr"
          value={formatTRY(a.totals.net)}
          icon={<Wallet className="h-5 w-5" />}
          accent="indigo"
          hint={`ort. aylık ${formatTRY(a.totals.avgMonthlyNet, { compact: true })}`}
        />
        <StatCard
          label="En İyi Ay"
          value={hasYearData ? a.bestMonth.fullLabel : '—'}
          icon={<Sparkles className="h-5 w-5" />}
          accent="amber"
          hint={hasYearData ? `${formatTRY(a.bestMonth.net, { compact: true })} net` : 'henüz veri yok'}
        />
      </div>

      {/* 12 aylık akış + seans istatistikleri */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>12 Aylık Gelir & Gider</SectionTitle>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Gelir</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Gider</span>
            </div>
          </div>
          <AreaTrendChart data={a.months} />
        </section>

        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">Seans İstatistikleri</SectionTitle>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                %{completionPct}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">tamamlanma oranı</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">
                %{noShowPct}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">gelmedi</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {sessionBars.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{b.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">{b.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/10">
                  <div
                    className={cn('h-full rounded-full', b.cls)}
                    style={{ width: `${a.sessionStats.total ? (b.count / a.sessionStats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-500/10 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck2 className="h-3.5 w-3.5" /> {a.sessionStats.total} seans
            </span>
            <span>
              ort. ücret{' '}
              <span className="sensitive font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {formatTRY(a.sessionStats.avgFee, { compact: true })}
              </span>
            </span>
          </div>
          {/* Gelir kaybı — iptal + gelmedi */}
          {a.sessionStats.lostRevenue > 0 && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <TrendingDown className="h-3.5 w-3.5" />
              </span>
              <p className="min-w-0 flex-1 text-[11px] leading-tight text-slate-600 dark:text-slate-300">
                İptal + gelmeyen seanslarda kaçan gelir
              </p>
              <span className="sensitive shrink-0 font-mono text-[13px] font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatTRY(a.sessionStats.lostRevenue, { compact: true })}
              </span>
            </div>
          )}
        </section>
      </div>

      {/* Aylık net + kümülatif birikim */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">Aylık Net</SectionTitle>
          <MonthlyBar data={a.months} />
        </section>
        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">Yıl Boyu Birikim</SectionTitle>
          <CumulativeArea data={a.cumulative} />
        </section>
      </div>

      {/* Kategoriler + danışanlar + yöntemler */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">Gider Kategorileri ({year})</SectionTitle>
          {a.expenseByCategory.length ? (
            <CategoryDonut data={a.expenseByCategory} />
          ) : (
            <EmptyState icon={Wallet} title="Gider verisi yok" />
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">En Çok Gelir Getiren Danışanlar</SectionTitle>
          {a.topClients.length ? (
            <ul className="space-y-3.5">
              {a.topClients.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/clients/${c.id}`} className="group flex items-center gap-3">
                    <Avatar name={c.name} color={c.color} src={c.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="sensitive truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-300">
                          {c.name}
                        </span>
                        <span className="sensitive shrink-0 font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                          {formatTRY(c.amount, { compact: true })}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                          style={{ width: `${maxClient ? (c.amount / maxClient) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={TrendingUp} title="Danışan geliri yok" />
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <SectionTitle className="mb-4">Tahsilat Yöntemleri</SectionTitle>
          <ul className="space-y-3.5">
            {a.methodTotals.map((m) => {
              const Icon = METHOD_ICON[m.method]
              return (
                <li key={m.method}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {PAYMENT_METHOD_LABEL[m.method]}
                      <span className="text-[11px] text-slate-400">({m.count})</span>
                    </span>
                    <span className="sensitive shrink-0 font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatTRY(m.amount, { compact: true })}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/10">
                    <div
                      className="h-full rounded-full bg-amber-500/80"
                      style={{ width: `${(m.amount / methodMax) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 border-t border-slate-500/10 pt-4">
            <SectionTitle className="mb-3">Gelir Kategorileri</SectionTitle>
            {a.incomeByCategory.length ? (
              <ul className="space-y-2">
                {a.incomeByCategory.slice(0, 4).map((c) => (
                  <li key={c.category} className="flex min-w-0 items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">{c.category}</span>
                    <span className="sensitive shrink-0 font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatTRY(c.amount, { compact: true })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Henüz gelir verisi yok.</p>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
