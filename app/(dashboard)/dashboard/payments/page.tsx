import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { listPayments, clientOptions } from '@/lib/queries'
import { deletePayment } from '@/app/actions/payments'
import { PAYMENT_METHOD_LABEL } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'

export default async function PaymentsPage() {
  const [payments, clients] = await Promise.all([listPayments(), clientOptions()])
  const total = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader
        title="Ödemeler"
        subtitle={`${payments.length} tahsilat · ${formatTRY(total, { compact: true })}`}
        action={<NewPaymentDialog clients={clients} />}
      />

      <div className="glass overflow-hidden rounded-2xl">
        {payments.length ? (
          <div className="divide-y divide-slate-500/10">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
                <Avatar name={p.clientName ?? '—'} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link
                    href={p.clientId ? `/dashboard/clients/${p.clientId}` : '#'}
                    className="truncate text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                  >
                    {p.clientName ?? 'Silinmiş danışan'}
                  </Link>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(p.date)} · {PAYMENT_METHOD_LABEL[p.method]}
                    {p.note ? ` · ${p.note}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{formatTRY(p.amount)}</span>
                <DeleteButton action={deletePayment.bind(null, p.id)} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={CreditCard} title="Henüz ödeme yok" description="Danışandan alınan ilk tahsilatı ekle." />
        )}
      </div>
    </>
  )
}
