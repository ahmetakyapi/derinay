'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientNotes, sessions } from '@/lib/schema'
import type { SessionStatus, NoteKind, Mood } from '@/lib/constants'

// ─── Danışan notları ─────────────────────────────────────────────────────────
export async function createNote(input: {
  clientId: string
  title?: string
  body: string
  kind?: NoteKind
  mood?: Mood | null
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.body?.trim()) return { ok: false, error: 'Not boş olamaz' }

  await db.insert(clientNotes).values({
    clientId: input.clientId,
    title: input.title || null,
    body: input.body.trim(),
    kind: input.kind ?? 'session',
    mood: input.mood ?? null,
  })
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

/** Not içeriğini güncelle */
export async function updateNote(
  id: string,
  clientId: string,
  input: { title?: string; body: string; kind?: NoteKind; mood?: Mood | null },
) {
  if (!input.body?.trim()) return { ok: false, error: 'Not boş olamaz' }
  await db
    .update(clientNotes)
    .set({
      title: input.title || null,
      body: input.body.trim(),
      kind: input.kind,
      mood: input.mood ?? null,
    })
    .where(eq(clientNotes.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}

/** Notu sabitle / sabitlemeyi kaldır */
export async function togglePinNote(id: string, clientId: string, pinned: boolean) {
  await db.update(clientNotes).set({ pinned }).where(eq(clientNotes.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}

export async function deleteNote(id: string, clientId: string) {
  await db.delete(clientNotes).where(eq(clientNotes.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}

// ─── Seanslar ────────────────────────────────────────────────────────────────
export async function createSession(input: {
  clientId: string
  date: string
  durationMin?: number
  fee?: number
  status?: SessionStatus
  note?: string
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.date) return { ok: false, error: 'Tarih zorunlu' }

  await db.insert(sessions).values({
    clientId: input.clientId,
    date: new Date(input.date),
    durationMin: input.durationMin ?? 50,
    fee: String(input.fee ?? 0),
    status: input.status ?? 'scheduled',
    note: input.note || null,
  })
  revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true }
}

export async function updateSessionStatus(id: string, clientId: string, status: SessionStatus) {
  await db.update(sessions).set({ status }).where(eq(sessions.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { ok: true }
}
