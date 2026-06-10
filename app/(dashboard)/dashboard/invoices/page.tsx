import Link from 'next/link'
import { FileText, Printer } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { InvoiceStatusSelect } from '@/components/forms/InvoiceStatusSelect'
import { listInvoices, clientOptions } from '@/lib/queries'
import { deleteInvoice } from '@/app/actions/invoices'
import { formatTRY, formatDate } from '@/lib/format'

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([listInvoices(), clientOptions()])

  const totalKdv = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.kdvAmount, 0)
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)

  return (
    <>
      <PageHeader
        title="Faturalar"
        subtitle={`${invoices.length} fatura · ${formatTRY(totalKdv, { compact: true })} KDV`}
        action={<NewInvoiceDialog clients={clients} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Toplam faturalanan</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatTRY(totalBilled)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Toplanan KDV</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-amber-600 dark:text-amber-400">{formatTRY(totalKdv)}</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {invoices.length ? (
          <div className="divide-y divide-slate-500/10">
            {invoices.map((i) => (
              // Mobil: iki satır (kimlik+tutar / kontroller) · sm+: tek satır
              <div key={i.id} className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
                <div className="flex items-center justify-between gap-3 sm:min-w-0 sm:flex-1">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{i.number}</p>
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {i.clientName ?? 'Genel'} · {formatDate(i.issueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-slate-900 dark:text-white sm:hidden">
                    {formatTRY(i.total)}
                  </span>
                </div>
                <div className="hidden text-right text-xs text-slate-500 dark:text-slate-400 sm:block">
                  <span className="block">Net {formatTRY(i.subtotal, { compact: true })}</span>
                  <span className="block">KDV %{i.kdvRate}</span>
                </div>
                <span className="hidden w-28 text-right font-mono text-[13px] font-bold tabular-nums text-slate-900 dark:text-white sm:block">
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
