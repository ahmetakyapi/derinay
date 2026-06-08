'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients } from '@/lib/schema'
import type { ClientStatus, ClientColor } from '@/lib/constants'

export async function createClient(input: {
  name: string
  email?: string
  phone?: string
  status?: ClientStatus
  sessionFee?: number
  startDate?: string
  colorTag?: ClientColor
  tags?: string[]
  notes?: string
}) {
  if (!input.name?.trim()) return { ok: false, error: 'İsim zorunlu' }

  await db.insert(clients).values({
    name: input.name.trim(),
    email: input.email || null,
    phone: input.phone || null,
    status: input.status ?? 'active',
    sessionFee: String(input.sessionFee ?? 0),
    startDate: input.startDate || undefined,
    colorTag: input.colorTag ?? 'indigo',
    tags: input.tags ?? [],
    notes: input.notes || null,
  })

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function updateClientStatus(id: string, status: ClientStatus) {
  await db.update(clients).set({ status, updatedAt: new Date() }).where(eq(clients.id, id))
  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
  return { ok: true }
}

export async function updateClient(
  id: string,
  input: {
    name: string
    email?: string
    phone?: string
    status?: ClientStatus
    sessionFee?: number
    startDate?: string
    colorTag?: ClientColor
  },
) {
  if (!input.name?.trim()) return { ok: false, error: 'İsim zorunlu' }

  await db
    .update(clients)
    .set({
      name: input.name.trim(),
      email: input.email || null,
      phone: input.phone || null,
      status: input.status,
      sessionFee: input.sessionFee !== undefined ? String(input.sessionFee) : undefined,
      startDate: input.startDate || undefined,
      colorTag: input.colorTag,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
  return { ok: true }
}

export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id))
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard')
  return { ok: true }
}
