'use client'

import { StatusPillSelect } from '@/components/ui/StatusPillSelect'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { INVOICE_STATUSES, INVOICE_STATUS_LABEL, type InvoiceStatus } from '@/lib/constants'

// Durum → renkli rozet stili (ödendi/gecikmiş bir bakışta ayrışır)
const STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft: '!border-slate-500/30 !bg-slate-500/10 !text-slate-500 dark:!text-slate-400',
  sent: '!border-sky-500/40 !bg-sky-500/10 !text-sky-700 dark:!text-sky-300',
  paid: '!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300',
  overdue: '!border-rose-500/50 !bg-rose-500/12 !text-rose-700 dark:!text-rose-300',
}

/** Makbuz durumunu satır içinde değiştir. */
export function InvoiceStatusSelect({ id, value }: { id: string; value: InvoiceStatus }) {
  return (
    <StatusPillSelect
      value={value}
      options={INVOICE_STATUSES}
      labels={INVOICE_STATUS_LABEL}
      styles={STATUS_STYLE}
      ariaLabel="Makbuz durumu"
      onSelect={(next) => updateInvoiceStatus(id, next)}
    />
  )
}
