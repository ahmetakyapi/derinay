'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import {
  clients, sessions, clientNotes, transactions, invoices, payments,
  sessionPackages, clientScores, clientDocuments, waitlist, settings,
} from '@/lib/schema'

/**
 * Tam JSON yedeği geri yükler.
 *
 * GÜVENLİK: Tüm delete+insert'ler tek `db.batch()` çağrısında gönderilir —
 * Neon bunu tek transaction'da çalıştırır. Ortada hata olursa HİÇBİR ŞEY
 * değişmez (ya hep ya hiç). Yedek dosyası kullanıcıda kaldığı için işlem
 * her durumda tekrarlanabilir.
 */

type Row = Record<string, unknown>

/** ISO string → Date (timestamp kolonları için); geçersizse şimdiki an */
function toDate(v: unknown): Date {
  const d = new Date(String(v ?? ''))
  return Number.isNaN(d.getTime()) ? new Date() : d
}

/** Ortak alan dönüşümleri — createdAt/updatedAt her tabloda timestamp */
function ts(rows: Row[], extra: string[] = []): Row[] {
  return rows.map((r) => {
    const out: Row = { ...r }
    for (const k of ['createdAt', 'updatedAt', ...extra]) {
      if (k in out && out[k] != null) out[k] = toDate(out[k])
    }
    return out
  })
}

export async function restoreBackup(formData: FormData) {
  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false as const, error: 'Dosya seçilmedi' }
  if (file.size > 16 * 1024 * 1024) return { ok: false as const, error: 'Dosya çok büyük (16MB sınırı)' }

  let data: Record<string, unknown>
  try {
    data = JSON.parse(await file.text())
  } catch {
    return { ok: false as const, error: 'Dosya geçerli bir JSON değil' }
  }

  // Yedek şekli doğrulaması — Derinay yedeği mi?
  if (!data.exportedAt || !Array.isArray(data.clients)) {
    return { ok: false as const, error: 'Bu dosya bir Derinay yedeği değil (exportedAt/clients yok)' }
  }

  const arr = (k: string): Row[] => (Array.isArray(data[k]) ? (data[k] as Row[]) : [])

  const rows = {
    clients: ts(arr('clients')),
    sessions: ts(arr('sessions'), ['date']),
    notes: ts(arr('notes')),
    transactions: ts(arr('transactions')),
    invoices: ts(arr('invoices')),
    payments: ts(arr('payments')),
    sessionPackages: ts(arr('sessionPackages')),
    clientScores: ts(arr('clientScores')),
    clientDocuments: ts(arr('clientDocuments')),
    waitlist: ts(arr('waitlist')),
    settings: ts(arr('settings')),
  }

  // Tek atomik batch: önce çocuk tablolar silinir, sonra ebeveynden çocuğa eklenir.
  // (drizzle batch tipi en az bir öğe ister; silmeler her zaman var.)
  const statements: unknown[] = [
    db.delete(payments),
    db.delete(invoices),
    db.delete(transactions),
    db.delete(clientNotes),
    db.delete(sessions),
    db.delete(sessionPackages),
    db.delete(clientScores),
    db.delete(clientDocuments),
    db.delete(waitlist),
    db.delete(clients),
    db.delete(settings),
  ]
  if (rows.clients.length) statements.push(db.insert(clients).values(rows.clients as never))
  if (rows.sessions.length) statements.push(db.insert(sessions).values(rows.sessions as never))
  if (rows.notes.length) statements.push(db.insert(clientNotes).values(rows.notes as never))
  if (rows.transactions.length) statements.push(db.insert(transactions).values(rows.transactions as never))
  if (rows.invoices.length) statements.push(db.insert(invoices).values(rows.invoices as never))
  if (rows.payments.length) statements.push(db.insert(payments).values(rows.payments as never))
  if (rows.sessionPackages.length) statements.push(db.insert(sessionPackages).values(rows.sessionPackages as never))
  if (rows.clientScores.length) statements.push(db.insert(clientScores).values(rows.clientScores as never))
  if (rows.clientDocuments.length) statements.push(db.insert(clientDocuments).values(rows.clientDocuments as never))
  if (rows.waitlist.length) statements.push(db.insert(waitlist).values(rows.waitlist as never))
  if (rows.settings.length) statements.push(db.insert(settings).values(rows.settings as never))

  try {
    await db.batch(statements as never)
  } catch (e) {
    console.error('Restore hatası:', e)
    return {
      ok: false as const,
      error: 'Geri yükleme başarısız — hiçbir veri değiştirilmedi. Dosya eski bir sürümden olabilir.',
    }
  }

  // Her şey değişti — komple tazele
  revalidatePath('/', 'layout')

  return {
    ok: true as const,
    counts: {
      danışan: rows.clients.length,
      seans: rows.sessions.length,
      not: rows.notes.length,
      işlem: rows.transactions.length,
      makbuz: rows.invoices.length,
      ödeme: rows.payments.length,
    },
    exportedAt: String(data.exportedAt),
  }
}
