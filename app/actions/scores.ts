'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientScores } from '@/lib/schema'

export async function addScore(input: {
  clientId: string
  label: string
  value: number
  scaleMax?: number | null
  date?: string
  note?: string
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.label?.trim()) return { ok: false, error: 'Ölçek adı zorunlu' }
  if (input.value === undefined || Number.isNaN(input.value)) return { ok: false, error: 'Puan geçersiz' }

  await db.insert(clientScores).values({
    clientId: input.clientId,
    label: input.label.trim(),
    value: String(input.value),
    scaleMax: input.scaleMax || null,
    date: input.date || undefined,
    note: input.note || null,
  })
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function deleteScore(id: string, clientId: string) {
  await db.delete(clientScores).where(eq(clientScores.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}
