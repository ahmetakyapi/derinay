'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { transactions } from '@/lib/schema'
import type { TxType } from '@/lib/constants'

export async function createTransaction(input: {
  type: TxType
  amount: number
  category: string
  description?: string
  date?: string
  clientId?: string | null
}) {
  if (!input.amount || input.amount <= 0) return { ok: false, error: 'Tutar geçersiz' }
  if (!input.category) return { ok: false, error: 'Kategori zorunlu' }

  await db.insert(transactions).values({
    type: input.type,
    amount: String(input.amount),
    category: input.category,
    description: input.description || null,
    date: input.date || undefined,
    clientId: input.clientId || null,
  })

  revalidatePath('/dashboard/finances')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/taxes')
  return { ok: true }
}

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id))
  revalidatePath('/dashboard/finances')
  revalidatePath('/dashboard')
  return { ok: true }
}
