'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { payments } from '@/lib/schema'
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

  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function deletePayment(id: string) {
  await db.delete(payments).where(eq(payments.id, id))
  revalidatePath('/dashboard/payments')
  revalidatePath('/dashboard')
  return { ok: true }
}
