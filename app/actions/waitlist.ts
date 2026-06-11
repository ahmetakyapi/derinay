'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { waitlist, clients } from '@/lib/schema'

export async function addWaitlist(input: {
  name: string
  phone?: string
  email?: string
  source?: string
  priority?: 'normal' | 'high'
  note?: string
}) {
  if (!input.name?.trim()) return { ok: false, error: 'İsim zorunlu' }

  await db.insert(waitlist).values({
    name: input.name.trim(),
    phone: input.phone || null,
    email: input.email || null,
    source: input.source || null,
    priority: input.priority ?? 'normal',
    note: input.note || null,
  })
  revalidatePath('/dashboard/waitlist')
  return { ok: true }
}

export async function deleteWaitlist(id: string) {
  await db.delete(waitlist).where(eq(waitlist.id, id))
  revalidatePath('/dashboard/waitlist')
  return { ok: true }
}

/** Bekleme listesindeki kişiyi danışana dönüştür (kayıt silinir, danışan oluşturulur) */
export async function convertWaitlist(id: string) {
  const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, id))
  if (!entry) return { ok: false, error: 'Kayıt bulunamadı' }

  const [created] = await db
    .insert(clients)
    .values({
      name: entry.name,
      phone: entry.phone,
      email: entry.email,
      notes: entry.note,
      status: 'active',
    })
    .returning({ id: clients.id })

  await db.delete(waitlist).where(eq(waitlist.id, id))

  revalidatePath('/dashboard/waitlist')
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard')
  return { ok: true, clientId: created.id }
}
