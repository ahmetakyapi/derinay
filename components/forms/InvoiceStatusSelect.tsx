'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { INVOICE_STATUSES, INVOICE_STATUS_LABEL, type InvoiceStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Durum → renkli rozet stili (ödendi/gecikmiş bir bakışta ayrışır)
const STATUS_STYLE: Record<InvoiceStatus, string> = {
  draft: '!border-slate-500/30 !bg-slate-500/10 !text-slate-500 dark:!text-slate-400',
  sent: '!border-sky-500/40 !bg-sky-500/10 !text-sky-700 dark:!text-sky-300',
  paid: '!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300',
  overdue: '!border-rose-500/50 !bg-rose-500/12 !text-rose-700 dark:!text-rose-300',
}

export function InvoiceStatusSelect({ id, value }: { id: string; value: InvoiceStatus }) {
  const [current, setCurrent] = useState<InvoiceStatus>(value)
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value as InvoiceStatus
        setCurrent(status)
        start(async () => {
          await updateInvoiceStatus(id, status)
          router.refresh()
        })
      }}
      className={cn(
        'field !w-auto cursor-pointer !rounded-full !py-1.5 !pl-3 !pr-7 !text-xs !font-semibold transition-colors',
        STATUS_STYLE[current],
      )}
    >
      {INVOICE_STATUSES.map((s) => (
        <option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>
      ))}
    </select>
  )
}
