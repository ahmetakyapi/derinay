'use server'

import { revalidatePath } from 'next/cache'
import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices } from '@/lib/schema'
import { calcKdv } from '@/lib/finance'
import { TAX, type InvoiceStatus } from '@/lib/constants'

async function nextInvoiceNumber() {
  const [{ value }] = await db.select({ value: count() }).from(invoices)
  const year = new Date().getFullYear()
  return `DER-${year}-${String(value + 1).padStart(3, '0')}`
}

export async function createInvoice(input: {
  clientId?: string | null
  subtotal: number
  kdvRate?: number
  issueDate?: string
  dueDate?: string
  status?: InvoiceStatus
  note?: string
}) {
  if (!input.subtotal || input.subtotal <= 0) return { ok: false, error: 'Tutar geçersiz' }

  const rate = input.kdvRate ?? TAX.KDV_RATE
  const { kdvAmount, total } = calcKdv(input.subtotal, rate)
  const number = await nextInvoiceNumber()

  const [created] = await db
    .insert(invoices)
    .values({
      number,
      clientId: input.clientId || null,
      subtotal: String(input.subtotal),
      kdvRate: rate,
      kdvAmount: String(kdvAmount),
      total: String(total),
      issueDate: input.issueDate || undefined,
      dueDate: input.dueDate || null,
      status: input.status ?? 'sent',
      note: input.note || null,
    })
    .returning({ id: invoices.id })

  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/taxes')
  return { ok: true, number, id: created.id }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  await db.update(invoices).set({ status }).where(eq(invoices.id, id))
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/taxes')
  return { ok: true }
}

export async function deleteInvoice(id: string) {
  await db.delete(invoices).where(eq(invoices.id, id))
  revalidatePath('/dashboard/invoices')
  return { ok: true }
}
