import Link from 'next/link'
import { CreditCard, Banknote, Landmark, StickyNote, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { BloomArt } from '@/components/art/BloomArt'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { listPayments, clientOptions } from '@/lib/queries'
import { deletePayment } from '@/app/actions/payments'
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const METHOD_META: Record<PaymentMethod, { icon: typeof Banknote; tone: string; bg: string; bar: string; seg: string }> = {
  cash:     { icon: Banknote,   tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/12', bar: 'bg-emerald-500/70', seg: 'bg-emerald-500' },
  card:     { icon: CreditCard, tone: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-500/12',  bar: 'bg-violet-500/70',  seg: 'bg-violet-500' },
  transfer: { icon: Landmark,   tone: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-500/12',     bar: 'bg-sky-500/70',     seg: 'bg-sky-500' },
}

export default async function PaymentsPage() {
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

  return (
    <>
      <PageHeader
        title="Ödemeler"
        subtitle={`${payments.length} tahsilat · ${formatTRY(total, { compact: true })} toplam`}
        action={<NewPaymentDialog clients={clients} />}
      />

      {/* Tahsilat şeridi — toplam + yöntem dağılımı */}
      <div className="glass relative mb-6 overflow-hidden rounded-2xl p-5 sm:p-6">
        <BloomArt className="pointer-events-none absolute -right-4 -top-6 hidden h-44 w-32 opacity-40 sm:block" delay={0.4} />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Toplam Tahsilat
          </p>
          <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-4xl">
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
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {methods.map((m) => (
              <div key={m.method} className="flex items-center gap-3 rounded-xl border border-slate-500/10 p-3">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', m.bg, m.tone)}>
                  <m.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                    {m.label} · {m.count}
                  </p>
                  <p className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {formatTRY(m.amount, { compact: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {payments.length ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-500/10 px-4 py-3.5 sm:px-5">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Tahsilat Geçmişi</h2>
              <span className="text-xs text-slate-400">{payments.length} kayıt</span>
            </header>
            <div className="divide-y divide-slate-500/10">
              {payments.map((p) => {
                const meta = METHOD_META[p.method]
                return (
                  <div key={p.id} className="relative flex items-center gap-3 py-3.5 pl-5 pr-4 transition-colors hover:bg-slate-500/[0.025] sm:gap-4 sm:pl-6 sm:pr-5">
                    <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', meta.bar)} />
                    <Avatar name={p.clientName ?? '—'} color={p.clientColor ?? 'indigo'} src={p.clientAvatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={p.clientId ? `/dashboard/clients/${p.clientId}` : '#'}
                        className="truncate text-sm font-semibold text-slate-800 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                      >
                        {p.clientName ?? 'Silinmiş danışan'}
                      </Link>
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
                    <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatTRY(p.amount)}
                    </span>
                    <DeleteButton action={deletePayment.bind(null, p.id)} />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState icon={CreditCard} title="Henüz ödeme yok" description="Danışandan alınan ilk tahsilatı ekle." />
        )}
      </div>
    </>
  )
}
