import Link from 'next/link'
import { CreditCard, Banknote, Landmark, StickyNote } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { listPayments, clientOptions } from '@/lib/queries'
import { deletePayment } from '@/app/actions/payments'
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const METHOD_META: Record<PaymentMethod, { icon: typeof Banknote; tone: string; bg: string }> = {
  cash: { icon: Banknote, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  card: { icon: CreditCard, tone: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  transfer: { icon: Landmark, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
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

      {/* Yöntem kırılımı + toplam */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="glass relative overflow-hidden rounded-2xl p-4">
          <span className="absolute left-4 top-0 h-[3px] w-10 rounded-b-full bg-gradient-to-r from-emerald-500/80 via-emerald-500/30 to-transparent" />
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Toplam tahsilat
          </p>
          <p className="mt-1.5 font-display text-xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatTRY(total)}
          </p>
        </div>
        {methods.map((m) => (
          <div key={m.method} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', m.bg, m.tone)}>
                <m.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold text-slate-400">{m.count} işlem</span>
            </div>
            <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              {m.label}
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {formatTRY(m.amount, { compact: true })}
            </p>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {payments.length ? (
          <div className="divide-y divide-slate-500/10">
            {payments.map((p) => {
              const meta = METHOD_META[p.method]
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
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
                  <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{formatTRY(p.amount)}
                  </span>
                  <DeleteButton action={deletePayment.bind(null, p.id)} />
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={CreditCard} title="Henüz ödeme yok" description="Danışandan alınan ilk tahsilatı ekle." />
        )}
      </div>
    </>
  )
}
