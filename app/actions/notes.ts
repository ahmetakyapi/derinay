'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, gte, lte, ne, notInArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clientNotes, sessions, clients } from '@/lib/schema'
import { revalidateSessions } from '@/lib/revalidate'
import type { SessionStatus, NoteKind, Mood } from '@/lib/constants'

// ─── Çakışma kontrolü ────────────────────────────────────────────────────────
/**
 * Verilen aralıklarla çakışan (iptal/gelmedi hariç) ilk seansı döner.
 * `excludeId` taşıma sırasında seansın kendisiyle çakışmasını önler.
 */
async function findConflict(
  slots: { start: Date; durationMin: number }[],
  excludeId?: string,
): Promise<string | null> {
  if (!slots.length) return null
  const windowStart = new Date(Math.min(...slots.map((s) => s.start.getTime())) - 4 * 3600_000)
  const windowEnd = new Date(Math.max(...slots.map((s) => s.start.getTime())) + 28 * 3600_000)

  const existing = await db
    .select({ id: sessions.id, date: sessions.date, durationMin: sessions.durationMin, clientId: sessions.clientId, clientName: clients.name })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(and(
      gte(sessions.date, windowStart),
      lte(sessions.date, windowEnd),
      notInArray(sessions.status, ['cancelled', 'no_show']),
      ...(excludeId ? [ne(sessions.id, excludeId)] : []),
    ))

  for (const slot of slots) {
    const aStart = slot.start.getTime()
    const aEnd = aStart + slot.durationMin * 60_000
    for (const e of existing) {
      const bStart = new Date(e.date).getTime()
      const bEnd = bStart + e.durationMin * 60_000
      if (aStart < bEnd && bStart < aEnd) {
        const when = new Intl.DateTimeFormat('tr-TR', {
          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        }).format(new Date(e.date))
        return `Çakışma: ${when} — ${e.clientName ?? 'mevcut seans'} ile üst üste biniyor`
      }
    }
  }
  return null
}

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
  /** Tekrarlayan seri: her kaç haftada bir (1=haftalık, 2=iki haftada) ve kaç adet */
  repeat?: { everyWeeks: number; count: number }
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.date) return { ok: false, error: 'Tarih zorunlu' }

  const base = new Date(input.date)
  if (Number.isNaN(base.getTime())) return { ok: false, error: 'Geçersiz tarih' }

  // Tekrar yoksa tek seans; varsa haftalık/iki-haftalık seri (en çok 52)
  const everyWeeks = input.repeat?.everyWeeks ?? 0
  const count = everyWeeks > 0 ? Math.min(Math.max(input.repeat?.count ?? 1, 1), 52) : 1

  const rows = Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i * 7 * everyWeeks)
    return {
      clientId: input.clientId,
      date: d,
      durationMin: input.durationMin ?? 50,
      fee: String(input.fee ?? 0),
      status: input.status ?? ('scheduled' as SessionStatus),
      note: input.note || null,
    }
  })

  // Çakışma kontrolü — yalnızca planlanan/tamamlanan seanslarla
  if ((input.status ?? 'scheduled') !== 'cancelled') {
    const conflict = await findConflict(rows.map((r) => ({ start: r.date, durationMin: r.durationMin })))
    if (conflict) return { ok: false, error: conflict }
  }

  await db.insert(sessions).values(rows)
  revalidateSessions(input.clientId)
  return { ok: true, count: rows.length }
}

export async function updateSessionStatus(id: string, clientId: string, status: SessionStatus) {
  // Statü değişimi devam istatistiğini, paket kullanımını ve hatırlatmaları etkiler
  await db.update(sessions).set({ status }).where(eq(sessions.id, id))
  revalidateSessions(clientId)
  return { ok: true }
}

/** Seansın tarihini/saatini değiştir (ajanda sürükle-bırak + modal) */
export async function updateSessionTime(id: string, clientId: string | null, isoLocal: string) {
  const d = new Date(isoLocal)
  if (Number.isNaN(d.getTime())) return { ok: false, error: 'Geçersiz tarih' }

  const [cur] = await db.select({ durationMin: sessions.durationMin }).from(sessions).where(eq(sessions.id, id))
  const conflict = await findConflict([{ start: d, durationMin: cur?.durationMin ?? 50 }], id)
  if (conflict) return { ok: false, error: conflict }

  await db.update(sessions).set({ date: d }).where(eq(sessions.id, id))
  revalidateSessions(clientId)
  return { ok: true }
}

/** Seansı sil */
export async function deleteSession(id: string, clientId: string | null) {
  await db.delete(sessions).where(eq(sessions.id, id))
  revalidateSessions(clientId)
  return { ok: true }
}
