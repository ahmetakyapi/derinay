import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  clients, sessions, clientNotes, transactions, invoices, payments,
  sessionPackages, clientScores, clientDocuments, clientGoals, waitlist, settings,
} from '@/lib/schema'

export const dynamic = 'force-dynamic'

/**
 * Veri dışa aktarımı — CSV (Excel TR uyumlu: BOM + noktalı virgül) ve tam JSON yedek.
 * Middleware + burada ikinci kez auth ile korunur.
 *   GET /api/export?type=clients|sessions|notes|transactions|invoices|payments
 *                        |packages|scores|documents|waitlist|json
 */

type Row = Record<string, unknown>

function toCsv(rows: Row[], headers: { key: string; label: string }[]): string {
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    headers.map((h) => esc(h.label)).join(';'),
    ...rows.map((r) => headers.map((h) => esc(r[h.key])).join(';')),
  ]
  return `﻿${lines.join('\n')}` // BOM — Excel'de Türkçe karakterler için
}

function csvResponse(name: string, body: string) {
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="derinay-${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type') ?? 'json'

  if (type === 'clients') {
    const rows = await db.select().from(clients)
    return csvResponse('danisanlar', toCsv(rows as unknown as Row[], [
      { key: 'name', label: 'Ad Soyad' },
      { key: 'email', label: 'E-posta' },
      { key: 'phone', label: 'Telefon' },
      { key: 'status', label: 'Statü' },
      { key: 'startDate', label: 'Başlangıç' },
      { key: 'sessionFee', label: 'Seans Ücreti' },
      { key: 'tags', label: 'Etiketler' },
    ]))
  }

  if (type === 'sessions') {
    const rows = await db.select().from(sessions)
    return csvResponse('seanslar', toCsv(rows as unknown as Row[], [
      { key: 'date', label: 'Tarih' },
      { key: 'durationMin', label: 'Süre (dk)' },
      { key: 'status', label: 'Durum' },
      { key: 'fee', label: 'Ücret' },
      { key: 'note', label: 'Not' },
    ]))
  }

  if (type === 'notes') {
    const rows = await db.select().from(clientNotes)
    return csvResponse('notlar', toCsv(rows as unknown as Row[], [
      { key: 'createdAt', label: 'Tarih' },
      { key: 'kind', label: 'Tür' },
      { key: 'mood', label: 'Duygu' },
      { key: 'title', label: 'Başlık' },
      { key: 'body', label: 'Not' },
    ]))
  }

  if (type === 'transactions') {
    const rows = await db.select().from(transactions)
    return csvResponse('islemler', toCsv(rows as unknown as Row[], [
      { key: 'date', label: 'Tarih' },
      { key: 'type', label: 'Tip' },
      { key: 'scope', label: 'Kapsam' },
      { key: 'category', label: 'Kategori' },
      { key: 'amount', label: 'Tutar' },
      { key: 'description', label: 'Açıklama' },
      { key: 'recurring', label: 'Tekrarlayan' },
    ]))
  }

  if (type === 'invoices') {
    const rows = await db.select().from(invoices)
    return csvResponse('makbuzlar', toCsv(rows as unknown as Row[], [
      { key: 'number', label: 'Makbuz No' },
      { key: 'issueDate', label: 'Düzenleme' },
      { key: 'dueDate', label: 'Vade' },
      { key: 'subtotal', label: 'Brüt Ücret' },
      { key: 'stopajRate', label: 'Stopaj %' },
      { key: 'stopajAmount', label: 'Stopaj' },
      { key: 'kdvRate', label: 'KDV %' },
      { key: 'kdvAmount', label: 'KDV' },
      { key: 'total', label: 'Tahsil Edilen' },
      { key: 'status', label: 'Durum' },
    ]))
  }

  if (type === 'payments') {
    const rows = await db.select().from(payments)
    return csvResponse('odemeler', toCsv(rows as unknown as Row[], [
      { key: 'date', label: 'Tarih' },
      { key: 'amount', label: 'Tutar' },
      { key: 'method', label: 'Yöntem' },
      { key: 'note', label: 'Not' },
    ]))
  }

  if (type === 'packages') {
    const rows = await db.select().from(sessionPackages)
    return csvResponse('paketler', toCsv(rows as unknown as Row[], [
      { key: 'purchaseDate', label: 'Satın Alma' },
      { key: 'totalSessions', label: 'Seans Sayısı' },
      { key: 'pricePaid', label: 'Ödenen Tutar' },
      { key: 'note', label: 'Not' },
    ]))
  }

  if (type === 'scores') {
    const rows = await db.select().from(clientScores)
    return csvResponse('olcumler', toCsv(rows as unknown as Row[], [
      { key: 'date', label: 'Tarih' },
      { key: 'label', label: 'Ölçek' },
      { key: 'value', label: 'Puan' },
      { key: 'scaleMax', label: 'Üst Sınır' },
      { key: 'note', label: 'Not' },
    ]))
  }

  if (type === 'documents') {
    const rows = await db.select().from(clientDocuments)
    return csvResponse('belgeler', toCsv(rows as unknown as Row[], [
      { key: 'name', label: 'Belge' },
      { key: 'type', label: 'Tür' },
      { key: 'url', label: 'Bağlantı' },
      { key: 'note', label: 'Not' },
      { key: 'createdAt', label: 'Eklendi' },
    ]))
  }

  if (type === 'goals') {
    const rows = await db.select().from(clientGoals)
    return csvResponse('hedefler', toCsv(rows as unknown as Row[], [
      { key: 'title', label: 'Hedef' },
      { key: 'status', label: 'Durum' },
      { key: 'note', label: 'Not' },
      { key: 'createdAt', label: 'Eklendi' },
      { key: 'achievedAt', label: 'Tamamlandı' },
    ]))
  }

  if (type === 'waitlist') {
    const rows = await db.select().from(waitlist)
    return csvResponse('bekleme-listesi', toCsv(rows as unknown as Row[], [
      { key: 'name', label: 'Ad Soyad' },
      { key: 'phone', label: 'Telefon' },
      { key: 'email', label: 'E-posta' },
      { key: 'source', label: 'Kaynak' },
      { key: 'priority', label: 'Öncelik' },
      { key: 'note', label: 'Not' },
      { key: 'createdAt', label: 'Başvuru' },
    ]))
  }

  // Tam JSON yedek — TÜM tablolar (yeni tablo eklenince buraya da ekle)
  // Son yedek zamanını kaydet (dashboard "yedek eskidi" hatırlatması bunu okur)
  const nowIso = new Date().toISOString()
  await db
    .insert(settings)
    .values({ key: 'last_backup_at', value: nowIso, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: nowIso, updatedAt: new Date() } })

  const [c, se, n, t, i, pa, pk, sc, doc, gl, wl, st] = await Promise.all([
    db.select().from(clients),
    db.select().from(sessions),
    db.select().from(clientNotes),
    db.select().from(transactions),
    db.select().from(invoices),
    db.select().from(payments),
    db.select().from(sessionPackages),
    db.select().from(clientScores),
    db.select().from(clientDocuments),
    db.select().from(clientGoals),
    db.select().from(waitlist),
    db.select().from(settings),
  ])
  return new NextResponse(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        clients: c, sessions: se, notes: n, transactions: t, invoices: i, payments: pa,
        sessionPackages: pk, clientScores: sc, clientDocuments: doc, clientGoals: gl, waitlist: wl, settings: st,
      },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="derinay-yedek-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    },
  )
}
