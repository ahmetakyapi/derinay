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
  CalendarDays,
  CalendarClock,
  Cake,
  StickyNote,
  Package,
  Activity,
  ShieldAlert,
  DatabaseBackup,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { QuickAddMenu } from '@/components/forms/QuickAddMenu'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { WeekCalendar } from '@/components/dashboard/WeekCalendar'
import { AreaTrendChart, CategoryDonut, MonthlyBar } from '@/components/charts/lazy'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ReminderButton } from '@/components/clients/ReminderButton'
import { getDashboard, getWeekSessions, getOutstandingBalances, getUpcomingBirthdays, getDashboardReminders, getReminderConfig, getIncomeGoal, getOwnerIdentity, clientOptions } from '@/lib/queries'
import { formatTRY, formatDateShort, formatWeekdayLong, pctChange } from '@/lib/format'
import { SESSION_STATUS_LABEL, STATUS_TONE } from '@/lib/constants'
import { greetingNow, quoteOfTheDay } from '@/lib/quotes'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Genel Bakış' }

/** Doğum günü bandında gösterilen en fazla danışan — üstü sayılır */
const BIRTHDAY_PREVIEW = 4

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const weekOffset = Number.isFinite(Number(searchParams.week)) ? Number(searchParams.week) : 0
  const [d, week, out, birthdays, rem, reminder, incomeGoal, owner, clients] = await Promise.all([
    getDashboard(),
    getWeekSessions(weekOffset),
    getOutstandingBalances(),
    getUpcomingBirthdays(),
    getDashboardReminders(),
    getReminderConfig(),
    getIncomeGoal(),
    getOwnerIdentity(),
    clientOptions(),
  ])
  const goalPct = incomeGoal > 0 ? Math.min(Math.round((d.kpis.income / incomeGoal) * 100), 100) : 0
  const reminderCount =
    rem.missingNotes.length +
    rem.endingPackages.length +
    rem.staleScores.length +
    rem.missingConsent.length +
    (rem.backupStale ? 1 : 0)
  const k = d.kpis
  const weekTotal = week.days.reduce((s, day) => s + day.items.length, 0)
  const weekRange = `${formatDateShort(week.days[0].key)} – ${formatDateShort(week.days[6].key)}`
  const weekTitle = weekOffset === 0 ? 'Bu Haftanın Seansları' : 'Haftalık Seanslar'
  const quote = quoteOfTheDay()

  return (
    <>
      <PageHeader
        title={
          owner.firstName ? (
            <>
              {greetingNow()},{' '}
              <span className="text-indigo-700 dark:text-indigo-300">{owner.firstName}</span>
            </>
          ) : (
            greetingNow()
          )
        }
        subtitle={`${formatWeekdayLong(new Date())} · ${d.activeClientCount} aktif danışan · bu hafta ${weekTotal} seans`}
        action={<QuickAddMenu clients={clients} />}
      />

      {/* Günün Sözü — üstte, vurgulu bant */}
      <QuoteCard quote={quote} />

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
            <span className="font-bold">{out.overdueCount} gecikmiş makbuz</span>
            <span className="text-slate-500 dark:text-slate-400"> · toplam </span>
            <span className="sensitive font-mono font-semibold tabular-nums text-rose-600 dark:text-rose-400">
              {formatTRY(out.overdueTotal, { compact: true })}
            </span>
          </p>
          <span className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400">İncele →</span>
        </Link>
      )}

      {/* Yaklaşan doğum günleri — sıcak hatırlatma */}
      {birthdays.length > 0 && (
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.09] via-amber-500/[0.05] to-transparent px-4 py-3.5 sm:px-5">
          <span aria-hidden className="pointer-events-none absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shadow-sm shadow-amber-500/10 dark:text-amber-400">
                <Cake className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Yaklaşan Doğum Günü</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Küçük bir mesaj sevindirir 🌿</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {birthdays.slice(0, BIRTHDAY_PREVIEW).map((b) => (
                <Link
                  key={b.id}
                  href={`/dashboard/clients/${b.id}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-[rgba(var(--paper),0.7)] py-1 pl-1 pr-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-md"
                >
                  <Avatar name={b.name} color={b.colorTag} src={b.avatarUrl} size="sm" />
                  <span className="sensitive text-xs font-semibold text-slate-700 dark:text-slate-200">{b.name.split(' ')[0]}</span>
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                    b.daysUntil === 0
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                  )}>
                    {b.daysUntil === 0 ? 'bugün 🎂' : b.daysUntil === 1 ? 'yarın' : `${b.daysUntil} gün`}
                  </span>
                </Link>
              ))}
              {birthdays.length > BIRTHDAY_PREVIEW && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  +{birthdays.length - BIRTHDAY_PREVIEW} daha
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI kartları — mobilde 2'li galeri rafı */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Aylık Gelir"
          value={formatTRY(k.income)}
          animateTo={k.income}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
          change={pctChange(k.income, k.prevIncome)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Aylık Gider"
          value={formatTRY(k.expense)}
          animateTo={k.expense}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="rose"
          change={pctChange(k.expense, k.prevExpense)}
          goodDirection="down"
          hint="geçen aya göre"
        />
        <StatCard
          label="Net Kâr"
          value={formatTRY(k.net)}
          animateTo={k.net}
          icon={<Wallet className="h-5 w-5" />}
          accent="indigo"
          change={pctChange(k.net, k.prevNet)}
          hint="geçen aya göre"
        />
        <StatCard
          label="Ödenecek Vergi"
          value={formatTRY(k.taxDue)}
          animateTo={k.taxDue}
          icon={<Landmark className="h-5 w-5" />}
          accent="amber"
          hint={`KDV ${formatTRY(d.tax.kdvPayable, { compact: true })} + gelir v.`}
        />
      </div>

      {/* Aylık gelir hedefi — ilerleme bandı */}
      {incomeGoal > 0 && (
        <div className="glass mt-4 rounded-2xl px-5 py-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Aylık Hedef
            </span>
            <span className="sensitive font-mono tabular-nums text-slate-600 dark:text-slate-300">
              <span className={goalPct >= 100 ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-bold text-slate-900 dark:text-white'}>
                {formatTRY(k.income, { compact: true })}
              </span>
              {' / '}{formatTRY(incomeGoal, { compact: true })}
              <span className={`ml-2 font-bold ${goalPct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>%{goalPct}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-500/10">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ${
                goalPct >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-amber-400'
              }`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
          {goalPct >= 100 && (
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Hedef tamamlandı — harika bir ay ✨
            </p>
          )}
        </div>
      )}

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

      {/* Bugün + Hatırlatmalar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bugünkü program */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            <CalendarClock className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Bugün
          </h2>
          {rem.todaySessions.length ? (
            <ul className="space-y-2">
              {rem.todaySessions.map((s) => (
                <li key={s.id} className="group flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-indigo-500/40">
                  <span className="w-10 shrink-0 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{s.time}</span>
                  <Avatar name={s.clientName} color={s.colorTag} src={s.avatarUrl} size="sm" />
                  {s.clientId ? (
                    <Link
                      href={`/dashboard/clients/${s.clientId}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                    >
                      <span className="sensitive">{s.clientName}</span>
                    </Link>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      <span className="sensitive">{s.clientName}</span>
                    </span>
                  )}
                  {s.status === 'scheduled' && (
                    <ReminderButton clientName={s.clientName} phone={s.clientPhone} date={s.dateIso} template={reminder.template} therapist={reminder.therapist} />
                  )}
                  <StatusBadge label={SESSION_STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Bugün planlı seans yok — sakin bir gün ✨</p>
          )}

          {/* Yarın — tek tık WhatsApp hatırlatması (no-show kıran ritüel) */}
          {rem.tomorrowSessions.length > 0 && (
            <div className="mt-4 border-t border-slate-500/10 pt-3.5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Yarın · hatırlatma gönder
              </p>
              <ul className="space-y-1.5">
                {rem.tomorrowSessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
                    <span className="w-10 shrink-0 font-mono text-[11px] font-bold text-slate-400">{s.time}</span>
                    <span className="sensitive min-w-0 flex-1 truncate text-[13px] text-slate-600 dark:text-slate-300">{s.clientName}</span>
                    <ReminderButton clientName={s.clientName} phone={s.clientPhone} date={s.dateIso} template={reminder.template} therapist={reminder.therapist} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Hatırlatmalar */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Hatırlatmalar</span>
            {reminderCount > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">{reminderCount}</span>
            )}
          </h2>
          {reminderCount ? (
            <ul className="space-y-2">
              {rem.missingNotes.length > 0 && (
                <li>
                  <Link href={`/dashboard/clients/${rem.missingNotes[0].clientId}`} className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-amber-500/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"><StickyNote className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rem.missingNotes.length} seansın notu eksik</p>
                      <p className="sensitive truncate text-xs text-slate-400">{[...new Set(rem.missingNotes.map((m) => m.clientName))].slice(0, 3).join(', ')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400">→</span>
                  </Link>
                </li>
              )}
              {rem.endingPackages.length > 0 && (
                <li>
                  <Link href={`/dashboard/clients/${rem.endingPackages[0].clientId}`} className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-rose-500/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400"><Package className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rem.endingPackages.length} danışanın paketi bitiyor</p>
                      <p className="sensitive truncate text-xs text-slate-400">{rem.endingPackages.slice(0, 3).map((p) => `${p.clientName} (${p.remaining})`).join(', ')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-rose-600 dark:text-rose-400">→</span>
                  </Link>
                </li>
              )}
              {rem.staleScores.length > 0 && (
                <li>
                  <Link href={`/dashboard/clients/${rem.staleScores[0].clientId}`} className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-emerald-500/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Activity className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rem.staleScores.length} danışanda ölçüm zamanı</p>
                      <p className="sensitive truncate text-xs text-slate-400">{rem.staleScores.slice(0, 3).map((s) => `${s.clientName} (${s.daysSince}g)`).join(', ')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">→</span>
                  </Link>
                </li>
              )}
              {rem.missingConsent.length > 0 && (
                <li>
                  <Link href={`/dashboard/clients/${rem.missingConsent[0].clientId}`} className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-sky-500/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400"><ShieldAlert className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rem.missingConsent.length} danışanda onam eksik</p>
                      <p className="sensitive truncate text-xs text-slate-400">{rem.missingConsent.slice(0, 3).map((c) => c.clientName).join(', ')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-sky-600 dark:text-sky-400">→</span>
                  </Link>
                </li>
              )}
              {rem.backupStale && (
                <li>
                  <Link href="/dashboard/backup" className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5 transition-all hover:border-violet-500/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400"><DatabaseBackup className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Yedek alma zamanı</p>
                      <p className="truncate text-xs text-slate-400">
                        {rem.backupStale.daysAgo === null ? 'henüz hiç tam yedek alınmadı' : `son yedek ${rem.backupStale.daysAgo} gün önce`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-violet-600 dark:text-violet-400">→</span>
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">Her şey güncel — defter temiz ✨</p>
          )}
        </section>
      </div>

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
                      className={`sensitive shrink-0 font-mono text-[13px] font-semibold tabular-nums ${
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

      {/* Bekleyen tahsilat — tam genişlik */}
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
                <span className="sensitive min-w-0 flex-1 truncate text-sm font-medium text-slate-700 transition-colors group-hover:text-amber-700 dark:text-slate-200 dark:group-hover:text-amber-300">
                  {b.name}
                </span>
                <span className="sensitive shrink-0 font-mono text-[13px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  {formatTRY(b.outstanding, { compact: true })}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">
            Tüm tahsilatlar tamamlandı — defter temiz ✨
          </p>
        )}
      </section>
    </>
  )
}
