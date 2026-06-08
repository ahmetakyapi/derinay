import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { calcKdv } from '../lib/finance'
import * as schema from '../lib/schema'
import { clients, sessions, clientNotes, transactions, invoices, payments } from '../lib/schema'

if (!process.env.DATABASE_URL) {
  console.error('✗ DATABASE_URL bulunamadı. .env.local dosyasını doldurun.')
  process.exit(1)
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema })

// ─── Tarih yardımcıları ──────────────────────────────────────────────────────
const now = new Date()
function monthsAgo(m: number, day = 15) {
  return new Date(now.getFullYear(), now.getMonth() - m, day)
}
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const money = (n: number) => n.toFixed(2)

const COLORS = ['indigo', 'emerald', 'sky', 'violet', 'amber', 'rose', 'teal', 'cyan']

const CLIENTS = [
  { name: 'Ayşe Yılmaz',     status: 'active',    fee: 1500, since: 14, color: 'indigo' },
  { name: 'Mehmet Demir',    status: 'active',    fee: 1500, since: 8,  color: 'emerald' },
  { name: 'Zeynep Kaya',     status: 'active',    fee: 1800, since: 5,  color: 'violet' },
  { name: 'Can Aydın',       status: 'active',    fee: 1500, since: 3,  color: 'sky' },
  { name: 'Elif Şahin',      status: 'paused',    fee: 1400, since: 11, color: 'amber' },
  { name: 'Burak Çelik',     status: 'active',    fee: 1600, since: 2,  color: 'teal' },
  { name: 'Selin Arslan',    status: 'completed', fee: 1300, since: 20, color: 'rose' },
  { name: 'Deniz Koç',       status: 'active',    fee: 1700, since: 6,  color: 'cyan' },
] as const

const NOTES = [
  'İlk görüşmede yoğun kaygı belirtileri gözlemlendi. Nefes egzersizleri önerildi.',
  'Uyku düzeninde belirgin iyileşme. Haftalık takibe devam.',
  'Aile ilişkileri üzerine çalışıldı. Bir sonraki seansa günlük tutacak.',
  'Bilişsel yeniden yapılandırma teknikleri tanıtıldı.',
  'Motivasyonda artış var; hedef belirleme üzerine konuşuldu.',
]

async function main() {
  console.log('→ Mevcut veriler temizleniyor…')
  await db.delete(payments)
  await db.delete(invoices)
  await db.delete(transactions)
  await db.delete(clientNotes)
  await db.delete(sessions)
  await db.delete(clients)

  console.log('→ Danışanlar ekleniyor…')
  const inserted = await db
    .insert(clients)
    .values(
      CLIENTS.map((c) => ({
        name: c.name,
        email: c.name.toLocaleLowerCase('tr').replace(/\s+/g, '.').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ğ/g, 'g') + '@mail.com',
        phone: '05' + Math.floor(100000000 + Math.random() * 899999999),
        status: c.status,
        startDate: isoDate(monthsAgo(c.since, 1)),
        sessionFee: money(c.fee),
        colorTag: c.color,
        tags: [],
      })),
    )
    .returning({ id: clients.id, fee: clients.sessionFee, name: clients.name, status: clients.status })

  // ─── Seanslar + notlar + danışan gelirleri ─────────────────────────────────
  console.log('→ Seanslar, notlar ve gelirler ekleniyor…')
  const txRows: (typeof transactions.$inferInsert)[] = []
  const sessRows: (typeof sessions.$inferInsert)[] = []
  const noteRows: (typeof clientNotes.$inferInsert)[] = []

  for (const c of inserted) {
    if (c.status === 'completed') continue
    const fee = Number(c.fee)
    // son 5 ay, her ay ~3 seans
    for (let m = 4; m >= 0; m--) {
      const count = c.status === 'paused' && m < 2 ? 0 : 2 + Math.floor(Math.random() * 2)
      for (let s = 0; s < count; s++) {
        const d = monthsAgo(m, 4 + s * 8)
        sessRows.push({ clientId: c.id, date: d, durationMin: 50, status: 'completed', fee: money(fee) })
        txRows.push({
          type: 'income',
          amount: money(fee),
          category: s % 3 === 0 ? 'Online seans' : 'Seans geliri',
          description: `${c.name} — seans`,
          date: isoDate(d),
          clientId: c.id,
        })
      }
    }
    // 1-2 not
    const noteCount = 1 + Math.floor(Math.random() * 2)
    for (let n = 0; n < noteCount; n++) {
      noteRows.push({ clientId: c.id, body: pick(NOTES) })
    }
  }

  // ─── Giderler (her ay düzenli) ─────────────────────────────────────────────
  console.log('→ Giderler ekleniyor…')
  for (let m = 4; m >= 0; m--) {
    txRows.push({ type: 'expense', amount: money(9000), category: 'Ofis kirası', date: isoDate(monthsAgo(m, 1)), description: 'Aylık ofis kirası' })
    txRows.push({ type: 'expense', amount: money(1200 + Math.random() * 600), category: 'Faturalar (elektrik/su/internet)', date: isoDate(monthsAgo(m, 5)) })
    txRows.push({ type: 'expense', amount: money(650), category: 'Yazılım & abonelikler', date: isoDate(monthsAgo(m, 3)), description: 'Randevu & not yazılımı' })
    if (m % 2 === 0) txRows.push({ type: 'expense', amount: money(2500), category: 'Süpervizyon', date: isoDate(monthsAgo(m, 12)) })
    if (m % 3 === 0) txRows.push({ type: 'expense', amount: money(1800), category: 'Pazarlama', date: isoDate(monthsAgo(m, 9)), description: 'Sosyal medya reklamı' })
  }

  await db.insert(sessions).values(sessRows)
  await db.insert(clientNotes).values(noteRows)
  await db.insert(transactions).values(txRows)

  // ─── Faturalar + ödemeler ──────────────────────────────────────────────────
  console.log('→ Faturalar ve ödemeler ekleniyor…')
  const invRows: (typeof invoices.$inferInsert)[] = []
  const payRows: (typeof payments.$inferInsert)[] = []
  let counter = 1
  const year = now.getFullYear()

  const activeClients = inserted.filter((c) => c.status !== 'completed')
  for (let m = 3; m >= 0; m--) {
    for (const c of activeClients.slice(0, 5)) {
      const subtotal = Number(c.fee) * (2 + Math.floor(Math.random() * 2))
      const { kdvAmount, total } = calcKdv(subtotal, 20)
      const issue = monthsAgo(m, 2)
      const status = (m === 0 ? pick(['sent', 'paid', 'overdue']) : 'paid') as schema.Invoice['status']
      const id = crypto.randomUUID()
      invRows.push({
        id,
        number: `DER-${year}-${String(counter++).padStart(3, '0')}`,
        clientId: c.id,
        issueDate: isoDate(issue),
        dueDate: isoDate(monthsAgo(m, 16)),
        subtotal: money(subtotal),
        kdvRate: 20,
        kdvAmount: money(kdvAmount),
        total: money(total),
        status,
      })
      if (status === 'paid') {
        payRows.push({
          clientId: c.id,
          invoiceId: id,
          amount: money(total),
          date: isoDate(monthsAgo(m, 6)),
          method: pick(['cash', 'card', 'transfer']) as schema.Payment['method'],
          note: 'Fatura tahsilatı',
        })
      }
    }
  }

  await db.insert(invoices).values(invRows)
  await db.insert(payments).values(payRows)

  console.log('✓ Seed tamamlandı:')
  console.log(`  ${inserted.length} danışan, ${sessRows.length} seans, ${noteRows.length} not`)
  console.log(`  ${txRows.length} işlem, ${invRows.length} fatura, ${payRows.length} ödeme`)
  process.exit(0)
}

main().catch((e) => {
  console.error('✗ Seed hatası:', e)
  process.exit(1)
})
