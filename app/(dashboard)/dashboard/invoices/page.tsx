import Link from 'next/link'
import { FileText, Printer, CircleCheck, Send, Clock3, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { InvoiceStatusSelect } from '@/components/forms/InvoiceStatusSelect'
import { listInvoices, clientOptions } from '@/lib/queries'
import { deleteInvoice } from '@/app/actions/invoices'
import { formatTRY, formatDate } from '@/lib/format'
import type { InvoiceStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Statü → sol aksan çubuğu rengi (galeri etiketi)
const STATUS_BAR: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-400/50',
  sent: 'bg-sky-500/70',
  paid: 'bg-emerald-500/70',
  overdue: 'bg-rose-500/80',
}

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([listInvoices(), clientOptions()])

  const totalKdv = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.kdvAmount, 0)
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)
  const sumByStatus = (st: InvoiceStatus) =>
    invoices.filter((i) => i.status === st).reduce((s, i) => s + i.total, 0)
  const countByStatus = (st: InvoiceStatus) => invoices.filter((i) => i.status === st).length

  const summary = [
    { label: 'Ödendi', icon: CircleCheck, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', amount: sumByStatus('paid'), count: countByStatus('paid') },
    { label: 'Gönderildi', icon: Send, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', amount: sumByStatus('sent'), count: countByStatus('sent') },
    { label: 'Taslak', icon: Clock3, tone: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10', amount: sumByStatus('draft'), count: countByStatus('draft') },
    { label: 'Gecikmiş', icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', amount: sumByStatus('overdue'), count: countByStatus('overdue') },
  ]

  return (
    <>
      <PageHeader
        title="Faturalar"
        subtitle={`${invoices.length} fatura · ${formatTRY(totalBilled, { compact: true })} faturalanan · ${formatTRY(totalKdv, { compact: true })} KDV`}
        action={<NewInvoiceDialog clients={clients} />}
      />

      {/* Statü özeti — galeri rafı */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', s.bg, s.tone)}>
                <s.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold text-slate-400">{s.count} adet</span>
            </div>
            <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
              {s.label}
            </p>
            <p className={cn('mt-0.5 font-display text-lg font-semibold tracking-tight', s.tone)}>
              {formatTRY(s.amount, { compact: true })}
            </p>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {invoices.length ? (
          <div className="divide-y divide-slate-500/10">
            {invoices.map((i) => (
              // Mobil: iki satır (kimlik+tutar / kontroller) · sm+: tek satır
              <div
                key={i.id}
                className={cn(
                  'relative flex flex-col gap-2.5 py-3.5 pl-5 pr-4 sm:flex-row sm:items-center sm:gap-4 sm:pl-6 sm:pr-5',
                  i.status === 'overdue' && 'bg-rose-500/[0.05]',
                  i.status === 'paid' && 'bg-emerald-500/[0.03]',
                )}
              >
                {/* Statü aksan çubuğu */}
                <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', STATUS_BAR[i.status])} />

                <div className="flex items-center justify-between gap-3 sm:min-w-0 sm:flex-1">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={i.clientName ?? 'Genel'} color={i.clientColor ?? 'indigo'} src={i.clientAvatar} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {i.clientName ?? 'Genel'}
                      </p>
                      <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {i.number} · {formatDate(i.issueDate)}
                        {i.dueDate ? ` · vade ${formatDate(i.dueDate)}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'shrink-0 font-mono text-[13px] font-bold tabular-nums sm:hidden',
                    i.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400'
                      : i.status === 'overdue' ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-white',
                  )}>
                    {formatTRY(i.total)}
                  </span>
                </div>

                <div className="hidden shrink-0 text-right text-[11px] leading-snug text-slate-500 dark:text-slate-400 md:block">
                  <span className="block">Net {formatTRY(i.subtotal, { compact: true })}</span>
                  <span className="block">KDV %{i.kdvRate} · {formatTRY(i.kdvAmount, { compact: true })}</span>
                </div>

                <span className={cn(
                  'hidden w-28 shrink-0 text-right font-mono text-sm font-bold tabular-nums sm:block',
                  i.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400'
                    : i.status === 'overdue' ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white',
                )}>
                  {formatTRY(i.total)}
                </span>

                <div className="flex items-center justify-between gap-2 sm:justify-start">
                  <InvoiceStatusSelect id={i.id} value={i.status} />
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/invoices/${i.id}/print`}
                      target="_blank"
                      aria-label="PDF / Yazdır"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300"
                    >
                      <Printer className="h-4 w-4" />
                    </Link>
                    <DeleteButton action={deleteInvoice.bind(null, i.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="Henüz fatura yok" description="İlk faturanı kes." />
        )}
      </div>
    </>
  )
}
