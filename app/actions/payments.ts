'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments } from '@/lib/schema'
import { revalidateFinance } from '@/lib/revalidate'
import type { PaymentMethod } from '@/lib/constants'

export async function createPayment(input: {
  clientId: string
  invoiceId?: string | null
  amount: number
  date?: string
  method?: PaymentMethod
  note?: string
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan seçin' }
  if (!input.amount || input.amount <= 0) return { ok: false, error: 'Tutar geçersiz' }

  await db.insert(payments).values({
    clientId: input.clientId,
    invoiceId: input.invoiceId || null,
    amount: String(input.amount),
    date: input.date || undefined,
    method: input.method ?? 'transfer',
    note: input.note || null,
  })

  revalidateFinance()
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function deletePayment(id: string) {
  // Bakiyesi değişen danışanın detayı da tazelensin
  const [row] = await db.select({ clientId: payments.clientId }).from(payments).where(eq(payments.id, id))
  await db.delete(payments).where(eq(payments.id, id))
  revalidateFinance()
  if (row?.clientId) revalidatePath(`/dashboard/clients/${row.clientId}`)
  return { ok: true }
}
