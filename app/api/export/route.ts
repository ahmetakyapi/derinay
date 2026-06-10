import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients, sessions, clientNotes, transactions, invoices, payments } from '@/lib/schema'

export const dynamic = 'force-dynamic'

/**
 * Veri dışa aktarımı — CSV (Excel TR uyumlu: BOM + noktalı virgül) ve tam JSON yedek.
 * Middleware + burada ikinci kez auth ile korunur.
 *   GET /api/export?type=clients|sessions|notes|transactions|invoices|payments|json
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
    return csvResponse('faturalar', toCsv(rows as unknown as Row[], [
      { key: 'number', label: 'Fatura No' },
      { key: 'issueDate', label: 'Düzenleme' },
      { key: 'dueDate', label: 'Vade' },
      { key: 'subtotal', label: 'Net' },
      { key: 'kdvRate', label: 'KDV %' },
      { key: 'kdvAmount', label: 'KDV' },
      { key: 'total', label: 'Toplam' },
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

  // Tam JSON yedek — tüm tablolar
  const [c, se, n, t, i, pa] = await Promise.all([
    db.select().from(clients),
    db.select().from(sessions),
    db.select().from(clientNotes),
    db.select().from(transactions),
    db.select().from(invoices),
    db.select().from(payments),
  ])
  return new NextResponse(
    JSON.stringify(
      { exportedAt: new Date().toISOString(), clients: c, sessions: se, notes: n, transactions: t, invoices: i, payments: pa },
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
