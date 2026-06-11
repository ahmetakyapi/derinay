'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientGoals } from '@/lib/schema'

export async function addGoal(input: { clientId: string; title: string; note?: string }) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.title?.trim()) return { ok: false, error: 'Hedef boş olamaz' }

  await db.insert(clientGoals).values({
    clientId: input.clientId,
    title: input.title.trim(),
    note: input.note?.trim() || null,
  })
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function setGoalStatus(id: string, clientId: string, status: 'active' | 'achieved' | 'paused') {
  await db
    .update(clientGoals)
    .set({ status, achievedAt: status === 'achieved' ? new Date() : null })
    .where(eq(clientGoals.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}

export async function deleteGoal(id: string, clientId: string) {
  await db.delete(clientGoals).where(eq(clientGoals.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}
