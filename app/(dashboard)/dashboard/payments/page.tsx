import Link from 'next/link'
import { CreditCard, Banknote, Landmark, StickyNote, Wallet, Search, X } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { BloomArt } from '@/components/art/BloomArt'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { listPayments, clientOptions } from '@/lib/queries'
import { deletePayment } from '@/app/actions/payments'
import { PAYMENT_METHOD_LABEL, PAYMENT_METHODS, type PaymentMethod } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Ödemeler' }

const METHOD_META: Record<PaymentMethod, { icon: typeof Banknote; tone: string; bg: string; bar: string; seg: string }> = {
  cash:     { icon: Banknote,   tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/12', bar: 'bg-emerald-500/70', seg: 'bg-emerald-500' },
  card:     { icon: CreditCard, tone: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-500/12',  bar: 'bg-violet-500/70',  seg: 'bg-violet-500' },
  transfer: { icon: Landmark,   tone: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-500/12',     bar: 'bg-sky-500/70',     seg: 'bg-sky-500' },
}

const trLower = (v: string) => v.toLocaleLowerCase('tr')

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { method?: string; q?: string }
}) {
  const [payments, clients] = await Promise.all([listPayments(), clientOptions()])
  const total = payments.reduce((s, p) => s + p.amount, 0)

  const byMethod = (m: PaymentMethod) => payments.filter((p) => p.method === m)
  const methods = (Object.keys(METHOD_META) as PaymentMethod[]).map((m) => ({
    method: m,
    label: PAYMENT_METHOD_LABEL[m],
    amount: byMethod(m).reduce((s, p) => s + p.amount, 0),
    count: byMethod(m).length,
    ...METHOD_META[m],
  }))

  // Filtreler yalnızca listeyi daraltır — üstteki tahsilat şeridi hep tüm geçmişi anlatır
  const method = (PAYMENT_METHODS as readonly string[]).includes(searchParams.method ?? '')
    ? (searchParams.method as PaymentMethod)
    : undefined
  const q = searchParams.q?.trim() || undefined
  const needle = q ? trLower(q) : null
  const visible = payments.filter(
    (p) =>
      (!method || p.method === method) &&
      (!needle || trLower(`${p.clientName ?? ''} ${p.note ?? ''}`).includes(needle)),
  )
  const filtered = Boolean(method || q)
  const visibleTotal = visible.reduce((s, p) => s + p.amount, 0)

  const filterHref = (over: { method?: PaymentMethod | 'all'; q?: string }) => {
    const sp = new URLSearchParams()
    const mm = over.method ?? method ?? 'all'
    const qq = over.q ?? q ?? ''
    if (mm !== 'all') sp.set('method', mm)
    if (qq) sp.set('q', qq)
    const qs = sp.toString()
    return `/dashboard/payments${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <PageHeader
        eyebrow="Finans"
        title="Ödemeler"
        subtitle={
          <>
            {payments.length} tahsilat · <span className="sensitive">{formatTRY(total, { compact: true })}</span> toplam
          </>
        }
        action={<NewPaymentDialog clients={clients} />}
      />

      {/* Tahsilat şeridi — toplam + yöntem dağılımı */}
      <div className="glass relative mb-6 overflow-hidden rounded-2xl p-5 sm:p-6">
        <BloomArt className="pointer-events-none absolute -right-4 -top-6 hidden h-44 w-32 opacity-40 sm:block" delay={0.4} />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Toplam Tahsilat
          </p>
          <p className="sensitive mt-1.5 font-display text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-4xl">
            {formatTRY(total)}
          </p>

          {/* Yöntem segment çubuğu */}
          <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-500/10">
            {methods.map((m) =>
              m.amount > 0 ? (
                <div
                  key={m.method}
                  className={cn('h-full transition-[width] duration-700', m.seg)}
                  style={{ width: `${total > 0 ? (m.amount / total) * 100 : 0}%` }}
                  title={`${m.label} · ${formatTRY(m.amount)}`}
                />
              ) : null,
            )}
          </div>

          {/* Yöntem lejantı */}
          {/* Yöntem lejantı — aynı zamanda filtre (tıkla → o yöntemi listele) */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {methods.map((m) => {
              const active = method === m.method
              return (
                <Link
                  key={m.method}
                  href={filterHref({ method: active ? 'all' : m.method })}
                  aria-pressed={active}
                  title={active ? 'Filtreyi kaldır' : `${m.label} tahsilatlarını göster`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-slate-500/10 p-3 transition-all hover:-translate-y-0.5 hover:border-slate-500/25',
                    active && 'border-indigo-500/40 bg-indigo-500/[0.05] ring-1 ring-indigo-500/30',
                  )}
                >
                  <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.bg, m.tone)}>
                    <m.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                      {m.label} · {m.count}
                    </p>
                    <p className="sensitive font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatTRY(m.amount, { compact: true })}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Arama + aktif filtre göstergesi */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {filtered && (
          <Link
            href="/dashboard/payments"
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.07] px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-500/60 dark:text-indigo-300"
          >
            <X className="h-3.5 w-3.5" />
            {method ? PAYMENT_METHOD_LABEL[method] : 'Arama'} filtresini kaldır
          </Link>
        )}
        <form action="/dashboard/payments" className="relative ml-auto w-full sm:w-64">
          {method && <input type="hidden" name="method" value={method} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Danışan veya not ara…"
            className="field !py-2 !pl-9 text-sm"
          />
        </form>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {visible.length ? (
          <>
            <header className="flex items-center justify-between gap-3 border-b border-slate-500/10 px-4 py-3.5 sm:px-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
                {method ? `${PAYMENT_METHOD_LABEL[method]} Tahsilatları` : 'Tahsilat Geçmişi'}
              </h2>
              <span className="shrink-0 text-xs text-slate-400">
                {filtered ? (
                  <>
                    {visible.length} / {payments.length} kayıt ·{' '}
                    <span className="sensitive font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatTRY(visibleTotal, { compact: true })}
                    </span>
                  </>
                ) : (
                  `${payments.length} kayıt`
                )}
              </span>
            </header>
            <div className="divide-y divide-slate-500/10">
              {visible.map((p) => {
                const meta = METHOD_META[p.method]
                return (
                  <div key={p.id} className="relative flex items-center gap-3 py-3.5 pl-5 pr-4 transition-colors hover:bg-slate-500/[0.025] sm:gap-4 sm:pl-6 sm:pr-5">
                    <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', meta.bar)} />
                    <Avatar name={p.clientName ?? '—'} color={p.clientColor ?? 'indigo'} src={p.clientAvatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      {p.clientId ? (
                        <Link
                          href={`/dashboard/clients/${p.clientId}`}
                          className="block truncate text-sm font-semibold text-slate-800 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                        >
                          <span className="sensitive">{p.clientName}</span>
                        </Link>
                      ) : (
                        <span className="block truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Silinmiş danışan
                        </span>
                      )}
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        <span className="shrink-0">{formatDate(p.date)}</span>
                        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold', meta.bg, meta.tone)}>
                          <meta.icon className="h-3 w-3" />
                          {PAYMENT_METHOD_LABEL[p.method]}
                        </span>
                        {p.note && (
                          <span className="hidden min-w-0 items-center gap-1 truncate sm:inline-flex">
                            <StickyNote className="h-3 w-3 shrink-0 text-amber-500" />
                            <span className="truncate">{p.note}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="sensitive shrink-0 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatTRY(p.amount)}
                    </span>
                    <DeleteButton action={deletePayment.bind(null, p.id)} />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={CreditCard}
            title={filtered ? 'Eşleşen tahsilat yok' : 'Henüz ödeme yok'}
            description={filtered ? 'Filtreyi kaldırıp tekrar dene.' : 'Danışandan alınan ilk tahsilatı ekle.'}
            action={
              filtered ? (
                <Link
                  href="/dashboard/payments"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
                >
                  Filtreyi temizle
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  )
}
