import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Search,
  Home,
  Plug,
  GraduationCap,
  BookOpen,
  MonitorSmartphone,
  Megaphone,
  Car,
  Landmark,
  HeartHandshake,
  Users,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NewTransactionDialog } from '@/components/forms/NewTransactionDialog'
import { listTransactions, clientOptions, type TxRow } from '@/lib/queries'
import { deleteTransaction } from '@/app/actions/transactions'
import { formatTRY, monthKey, formatMonth, pctChange } from '@/lib/format'
import type { TxType } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Kategori → ikon eşlemesi (anahtar kelime ile)
const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/kira/i, Home],
  [/elektrik|su|internet|fatura/i, Plug],
  [/süpervizyon/i, GraduationCap],
  [/eğitim|sertifika|atölye/i, BookOpen],
  [/yazılım|abonelik/i, MonitorSmartphone],
  [/pazarlama|reklam/i, Megaphone],
  [/ulaşım|yol|benzin/i, Car],
  [/vergi|sgk/i, Landmark],
  [/seans|terapi|danışmanlık/i, HeartHandshake],
  [/grup/i, Users],
]

function categoryIcon(category: string, type: TxType): LucideIcon {
  for (const [re, icon] of CATEGORY_ICONS) if (re.test(category)) return icon
  return type === 'income' ? Briefcase : Wallet
}

const TYPE_FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'income', label: 'Gelir' },
  { value: 'expense', label: 'Gider' },
] as const

export default async function FinancesPage({
  searchParams,
}: {
  searchParams: { month?: string; type?: string; q?: string }
}) {
  const now = new Date()
  const month = /^\d{4}-\d{2}$/.test(searchParams.month ?? '') ? searchParams.month! : monthKey(now)
  const type = searchParams.type === 'income' || searchParams.type === 'expense' ? (searchParams.type as TxType) : undefined
  const q = searchParams.q?.trim() || undefined

  const [y, m] = month.split('-').map(Number)
  const monthDate = new Date(y, m - 1, 1)
  const prevKey = monthKey(new Date(y, m - 2, 1))
  const nextKey = monthKey(new Date(y, m, 1))
  const isCurrentMonth = month === monthKey(now)

  const [txs, prevTxs, clients] = await Promise.all([
    listTransactions({ scope: 'business', month, type, q }),
    listTransactions({ scope: 'business', month: prevKey }),
    clientOptions(),
  ])

  const sum = (rows: TxRow[], t: TxType) => rows.filter((r) => r.type === t).reduce((s, r) => s + r.amount, 0)
  const income = sum(txs, 'income')
  const expense = sum(txs, 'expense')
  const prevIncome = sum(prevTxs, 'income')
  const prevExpense = sum(prevTxs, 'expense')

  // Gün bazlı gruplama (tarih azalan)
  const byDay = new Map<string, TxRow[]>()
  for (const t of txs) {
    const list = byDay.get(t.date) ?? []
    list.push(t)
    byDay.set(t.date, list)
  }
  const dayKeys = [...byDay.keys()].sort((a, b) => (a < b ? 1 : -1))
  const dayLabel = (d: string) =>
    new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date(d))

  const buildHref = (over: { month?: string; type?: string; q?: string }) => {
    const p = new URLSearchParams()
    const mm = over.month ?? month
    const tt = over.type ?? (type ?? 'all')
    const qq = over.q ?? (q ?? '')
    if (mm !== monthKey(now)) p.set('month', mm)
    if (tt !== 'all') p.set('type', tt)
    if (qq) p.set('q', qq)
    const qs = p.toString()
    return `/dashboard/finances${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <PageHeader
        title="Gelir & Gider"
        subtitle="Kliniğin finansal hareketleri — ay ay, gün gün"
        action={<NewTransactionDialog clients={clients} />}
      />

      {/* Ay navigasyonu + filtreler + arama */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={buildHref({ month: prevKey })}
            aria-label="Önceki ay"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-[120px] text-center text-sm font-bold capitalize text-slate-900 dark:text-white sm:min-w-[140px]">
            {formatMonth(monthDate)}
          </span>
          <Link
            href={buildHref({ month: nextKey })}
            aria-label="Sonraki ay"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300',
              isCurrentMonth && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-500/15 p-1">
          {TYPE_FILTERS.map((f) => {
            const active = (type ?? 'all') === f.value
            return (
              <Link
                key={f.value}
                href={buildHref({ type: f.value })}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {/* Arama — GET formu */}
        <form action="/dashboard/finances" className="relative ml-auto w-full sm:w-56">
          {month !== monthKey(now) && <input type="hidden" name="month" value={month} />}
          {type && <input type="hidden" name="type" value={type} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Kategori veya not ara…"
            className="field !py-2 !pl-9 text-sm"
          />
        </form>
      </div>

      {/* Ay özeti */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Ay geliri" value={income} change={pctChange(income, prevIncome)} tone="income" />
        <SummaryCard label="Ay gideri" value={expense} change={pctChange(expense, prevExpense)} tone="expense" />
        <SummaryCard label="Net" value={income - expense} change={pctChange(income - expense, prevIncome - prevExpense)} tone="net" />
      </div>

      {/* Gün gruplu liste */}
      {dayKeys.length ? (
        <div className="space-y-4">
          {dayKeys.map((day) => {
            const rows = byDay.get(day)!
            const dayNet = rows.reduce((s, r) => s + (r.type === 'income' ? r.amount : -r.amount), 0)
            return (
              <section key={day} className="glass overflow-hidden rounded-2xl">
                <header className="flex items-center justify-between border-b border-slate-500/10 bg-slate-500/[0.04] px-4 py-2.5 sm:px-5">
                  <span className="text-xs font-bold capitalize tracking-wide text-slate-600 dark:text-slate-300">
                    {dayLabel(day)}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold tabular-nums',
                      dayNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {dayNet >= 0 ? '+' : '−'}{formatTRY(Math.abs(dayNet), { compact: true })}
                  </span>
                </header>
                <div className="divide-y divide-slate-500/10">
                  {rows.map((t) => {
                    const inc = t.type === 'income'
                    const Icon = categoryIcon(t.category, t.type)
                    return (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                            inc
                              ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.category}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {[t.clientName, t.description].filter(Boolean).join(' · ') || (inc ? 'Gelir' : 'Gider')}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'flex shrink-0 items-center gap-1 font-mono text-[13px] font-semibold tabular-nums',
                            inc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {inc ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {formatTRY(t.amount)}
                        </span>
                        <DeleteButton action={deleteTransaction.bind(null, t.id)} />
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl">
          <EmptyState
            icon={Wallet}
            title={q ? 'Arama sonucu yok' : 'Bu ay işlem yok'}
            description={q ? 'Farklı bir kelimeyle dene.' : 'İlk gelir veya gider kaydını ekleyin.'}
          />
        </div>
      )}
    </>
  )
}

function SummaryCard({
  label,
  value,
  change,
  tone,
}: {
  label: string
  value: number
  change: number | null
  tone: 'income' | 'expense' | 'net'
}) {
  const valueCls =
    tone === 'income'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'expense'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-900 dark:text-white'
  // Gider artışı kötüdür — rozet rengi ters çalışır
  const positive = (change ?? 0) >= 0
  const goodChange = tone === 'expense' ? !positive : positive

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <span
        className={cn(
          'absolute left-5 top-0 h-[3px] w-10 rounded-b-full bg-gradient-to-r to-transparent',
          tone === 'income' && 'from-emerald-500/80 via-emerald-500/30',
          tone === 'expense' && 'from-rose-500/80 via-rose-500/30',
          tone === 'net' && 'from-indigo-500/80 via-indigo-500/30',
        )}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className={cn('font-display text-2xl font-semibold tracking-tight', valueCls)}>{formatTRY(value)}</p>
        {change !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums',
              goodChange
                ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            %{Math.abs(change).toFixed(0)}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">geçen aya göre</p>
    </div>
  )
}
