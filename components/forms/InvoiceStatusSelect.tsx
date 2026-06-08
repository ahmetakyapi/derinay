'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { INVOICE_STATUSES, INVOICE_STATUS_LABEL, type InvoiceStatus } from '@/lib/constants'

export function InvoiceStatusSelect({ id, value }: { id: string; value: InvoiceStatus }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value as InvoiceStatus
        start(async () => {
          await updateInvoiceStatus(id, status)
          router.refresh()
        })
      }}
      className="field !w-auto !py-1.5 !text-xs"
    >
      {INVOICE_STATUSES.map((s) => (
        <option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>
      ))}
    </select>
  )
}
