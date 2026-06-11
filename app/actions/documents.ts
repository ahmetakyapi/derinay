'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientDocuments } from '@/lib/schema'

export async function addDocument(input: {
  clientId: string
  name: string
  type?: string
  url: string
  note?: string
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.name?.trim()) return { ok: false, error: 'Belge adı zorunlu' }
  const url = input.url?.trim() ?? ''
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: 'Geçerli bir bağlantı girin (https://…)' }

  await db.insert(clientDocuments).values({
    clientId: input.clientId,
    name: input.name.trim(),
    type: input.type?.trim() || null,
    url,
    note: input.note?.trim() || null,
  })
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function deleteDocument(id: string, clientId: string) {
  await db.delete(clientDocuments).where(eq(clientDocuments.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}
