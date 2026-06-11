import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { calcMakbuz } from '../lib/finance'
import * as schema from '../lib/schema'
import {
  clients, sessions, clientNotes, transactions, invoices, payments,
  sessionPackages, clientScores, clientDocuments, clientGoals, waitlist,
} from '../lib/schema'

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
  // ── GÜVENLİK KİLİDİ ──────────────────────────────────────────────────────
  // Seed TÜM verileri siler. Gerçek veri varken yanlışlıkla çalıştırmayı önle:
  // dolu veritabanında yalnızca `npm run db:seed -- --force` ile çalışır.
  const existing = await db.select({ id: clients.id }).from(clients).limit(1)
  if (existing.length > 0 && !process.argv.includes('--force')) {
    console.error('✗ Veritabanı boş değil — seed TÜM verileri siler!')
    console.error('  Gerçekten istiyorsan önce yedek al (Yedekleme sayfası), sonra:')
    console.error('  npm run db:seed -- --force')
    process.exit(1)
  }

  console.log('→ Mevcut veriler temizleniyor…')
  await db.delete(payments)
  await db.delete(invoices)
  await db.delete(transactions)
  await db.delete(clientNotes)
  await db.delete(sessions)
  await db.delete(sessionPackages)
  await db.delete(clientScores)
  await db.delete(clientDocuments)
  await db.delete(clientGoals)
  await db.delete(waitlist)
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
        // Doğum günü — bir kısmı yakın günlerde (dashboard hatırlatması görünsün)
        birthDate: Math.random() < 0.75
          ? isoDate(new Date(1980 + Math.floor(Math.random() * 25), Math.random() < 0.3 ? now.getMonth() : Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)))
          : null,
        consentGiven: Math.random() < 0.8, // çoğunda onam alınmış, birkaçında eksik (hatırlatma görünsün)
        sessionFee: money(c.fee),
        colorTag: c.color,
        tags: pick([['EMDR'], ['BDT', 'Online'], ['Çift terapisi'], ['Online'], ['Şema terapi'], []]),
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
    // 2-4 not — Seans Defteri: tür + duygu + ara sıra sabitlenmiş
    const KINDS = ['session', 'session', 'observation', 'homework', 'important'] as const
    const MOOD_POOL = ['great', 'good', 'good', 'neutral', 'low', 'difficult'] as const
    const noteCount = 2 + Math.floor(Math.random() * 3)
    for (let n = 0; n < noteCount; n++) {
      noteRows.push({
        clientId: c.id,
        body: pick(NOTES),
        kind: pick([...KINDS]),
        mood: Math.random() < 0.8 ? pick([...MOOD_POOL]) : null,
        pinned: n === 0 && Math.random() < 0.3,
      })
    }
  }

  // ─── Bu haftanın seansları (saatli — haftalık takvim için) ─────────────────
  const activeForWeek = inserted.filter((c) => c.status === 'active')
  const monday = (() => {
    const n = new Date()
    const day = (n.getDay() + 6) % 7 // Pzt=0
    return new Date(n.getFullYear(), n.getMonth(), n.getDate() - day)
  })()
  const HOURS = [10, 11, 13, 14, 15, 16, 17]
  for (let wd = 0; wd < 5; wd++) {
    // her iş günü 2-3 seans
    const slots = 2 + Math.floor(Math.random() * 2)
    const usedHours: number[] = []
    for (let s = 0; s < slots && s < activeForWeek.length; s++) {
      const c = activeForWeek[(wd + s) % activeForWeek.length]
      let hour = pick(HOURS)
      while (usedHours.includes(hour)) hour = pick(HOURS)
      usedHours.push(hour)
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + wd, hour, 0, 0)
      const isPast = d.getTime() < Date.now()
      sessRows.push({
        clientId: c.id,
        date: d,
        durationMin: 50,
        status: isPast ? 'completed' : 'scheduled',
        fee: money(Number(c.fee)),
      })
    }
  }

  // ─── Giderler (her ay düzenli) ─────────────────────────────────────────────
  console.log('→ Giderler ekleniyor…')
  for (let m = 4; m >= 0; m--) {
    txRows.push({ type: 'expense', amount: money(9000), category: 'Ofis kirası', date: isoDate(monthsAgo(m, 1)), description: 'Aylık ofis kirası', recurring: true })
    txRows.push({ type: 'expense', amount: money(1200 + Math.random() * 600), category: 'Faturalar (elektrik/su/internet)', date: isoDate(monthsAgo(m, 5)) })
    txRows.push({ type: 'expense', amount: money(650), category: 'Yazılım & abonelikler', date: isoDate(monthsAgo(m, 3)), description: 'Randevu & not yazılımı', recurring: true })
    if (m % 2 === 0) txRows.push({ type: 'expense', amount: money(2500), category: 'Süpervizyon', date: isoDate(monthsAgo(m, 12)) })
    if (m % 3 === 0) txRows.push({ type: 'expense', amount: money(1800), category: 'Pazarlama', date: isoDate(monthsAgo(m, 9)), description: 'Sosyal medya reklamı' })
  }

  // ─── Kişisel harcamalar (bu ay, gün bazlı) ─────────────────────────────────
  console.log('→ Kişisel harcamalar ekleniyor…')
  const PERSONAL: [string, number, number][] = [
    // [kategori, min, max]
    ['Market', 400, 1200], ['Yemek & kafe', 150, 600], ['Ulaşım', 80, 300],
    ['Kişisel bakım', 200, 900], ['Giyim', 500, 2500], ['Eğlence', 200, 800],
    ['Abonelikler', 60, 350], ['Sağlık', 300, 1500], ['Hediye', 250, 1200],
  ]
  const today = now.getDate()
  for (let day = 1; day <= today; day++) {
    // her güne ~%55 ihtimalle 1, bazen 2 harcama
    if (Math.random() > 0.55) continue
    const count = Math.random() > 0.75 ? 2 : 1
    for (let c = 0; c < count; c++) {
      const [cat, lo, hi] = pick(PERSONAL)
      const amount = Math.round((lo + Math.random() * (hi - lo)) / 5) * 5
      txRows.push({
        type: 'expense',
        scope: 'personal',
        amount: money(amount),
        category: cat,
        date: isoDate(new Date(now.getFullYear(), now.getMonth(), day)),
      })
    }
  }

  await db.insert(sessions).values(sessRows)
  await db.insert(clientNotes).values(noteRows)
  await db.insert(transactions).values(txRows)

  // ─── Makbuzlar + ödemeler ──────────────────────────────────────────────────
  console.log('→ Makbuzlar ve ödemeler ekleniyor…')
  const invRows: (typeof invoices.$inferInsert)[] = []
  const payRows: (typeof payments.$inferInsert)[] = []
  let counter = 1
  const year = now.getFullYear()

  const activeClients = inserted.filter((c) => c.status !== 'completed')
  for (let m = 3; m >= 0; m--) {
    for (const c of activeClients.slice(0, 5)) {
      const brut = Number(c.fee) * (2 + Math.floor(Math.random() * 2))
      const stopajRate = Math.random() < 0.7 ? 20 : 0 // çoğu makbuz stopajlı
      const { kdvAmount, stopajAmount, total } = calcMakbuz(brut, 20, stopajRate)
      const issue = monthsAgo(m, 2)
      const status = (m === 0 ? pick(['sent', 'paid', 'overdue']) : 'paid') as schema.Invoice['status']
      const id = crypto.randomUUID()
      invRows.push({
        id,
        number: `DER-${year}-${String(counter++).padStart(3, '0')}`,
        clientId: c.id,
        issueDate: isoDate(issue),
        dueDate: isoDate(monthsAgo(m, 16)),
        subtotal: money(brut),
        kdvRate: 20,
        kdvAmount: money(kdvAmount),
        stopajRate,
        stopajAmount: money(stopajAmount),
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
          note: 'Makbuz tahsilatı',
        })
      }
    }
  }

  await db.insert(invoices).values(invRows)
  await db.insert(payments).values(payRows)

  // ─── Seans paketleri (birkaç aktif danışanda) ──────────────────────────────
  console.log('→ Seans paketleri ekleniyor…')
  const pkgRows: (typeof sessionPackages.$inferInsert)[] = []
  for (const c of activeClients.slice(0, 3)) {
    const totalSessions = pick([8, 10, 12])
    pkgRows.push({
      clientId: c.id,
      totalSessions,
      pricePaid: money(Number(c.fee) * totalSessions * 0.9), // %10 paket indirimi
      purchaseDate: isoDate(monthsAgo(1, 10)),
      note: `${totalSessions} seanslık paket — %10 indirimli`,
    })
  }
  await db.insert(sessionPackages).values(pkgRows)

  // ─── İlerleme ölçümleri (ölçek puanı serisi) ───────────────────────────────
  console.log('→ İlerleme ölçümleri ekleniyor…')
  const scoreRows: (typeof clientScores.$inferInsert)[] = []
  for (const c of activeClients.slice(0, 4)) {
    const scale = pick(['İyilik hali', 'Anksiyete', 'Uyku kalitesi'])
    const improving = scale === 'İyilik hali' || scale === 'Uyku kalitesi'
    let v = improving ? 4 : 8
    for (let m = 4; m >= 0; m--) {
      v += (improving ? 1 : -1) * (Math.random() < 0.75 ? 1 : 0) // dalgalı ama iyileşen seyir
      scoreRows.push({
        clientId: c.id,
        label: scale,
        value: money(Math.max(1, Math.min(10, v + (Math.random() - 0.5)))),
        scaleMax: 10,
        date: isoDate(monthsAgo(m, 20)),
      })
    }
  }
  await db.insert(clientScores).values(scoreRows)

  // ─── Belge bağlantıları ────────────────────────────────────────────────────
  console.log('→ Belge bağlantıları ekleniyor…')
  const docRows: (typeof clientDocuments.$inferInsert)[] = activeClients.slice(0, 3).map((c, i) => ({
    clientId: c.id,
    name: pick(['Onam formu', 'Beck Depresyon Envanteri', 'Değerlendirme raporu']),
    type: pick(['Onam formu', 'Test / Ölçek', 'Rapor']),
    url: `https://drive.google.com/file/d/ornek-belge-${i + 1}`,
    note: i === 0 ? 'İlk görüşmede imzalandı' : null,
  }))
  await db.insert(clientDocuments).values(docRows)

  // ─── Tedavi hedefleri ──────────────────────────────────────────────────────
  console.log('→ Tedavi hedefleri ekleniyor…')
  const GOAL_POOL = [
    'Uyku düzenini iyileştirmek',
    'Haftada 3 gün nefes egzersizi yapmak',
    'Sosyal ortamlarda kaygıyı yönetebilmek',
    'Sınır koyma becerisini geliştirmek',
    'Günlük tutma alışkanlığı kazanmak',
    'Aile içi iletişimi güçlendirmek',
  ]
  const goalRows: (typeof clientGoals.$inferInsert)[] = []
  for (const c of activeClients.slice(0, 5)) {
    const count = 2 + Math.floor(Math.random() * 2)
    const picked = [...GOAL_POOL].sort(() => Math.random() - 0.5).slice(0, count)
    picked.forEach((title, idx) => {
      const achieved = idx === 0 && Math.random() < 0.5
      goalRows.push({
        clientId: c.id,
        title,
        status: achieved ? 'achieved' : 'active',
        achievedAt: achieved ? monthsAgo(0, 10) : null,
      })
    })
  }
  await db.insert(clientGoals).values(goalRows)

  // ─── Bekleme listesi ───────────────────────────────────────────────────────
  console.log('→ Bekleme listesi ekleniyor…')
  const wlRows: (typeof waitlist.$inferInsert)[] = [
    { name: 'Merve Aktaş', phone: '0532 111 22 33', source: 'Instagram', priority: 'high', note: 'Kaygı yakınması — hafta içi akşam uygun' },
    { name: 'Oğuz Yıldırım', email: 'oguz.y@mail.com', source: 'Tavsiye', priority: 'normal', note: 'Çift terapisi talebi' },
    { name: 'İrem Doğan', phone: '0541 444 55 66', source: 'Google', priority: 'normal', note: null },
  ]
  await db.insert(waitlist).values(wlRows)

  console.log('✓ Seed tamamlandı:')
  console.log(`  ${inserted.length} danışan, ${sessRows.length} seans, ${noteRows.length} not`)
  console.log(`  ${txRows.length} işlem, ${invRows.length} makbuz, ${payRows.length} ödeme`)
  console.log(`  ${pkgRows.length} paket, ${scoreRows.length} ölçüm, ${docRows.length} belge, ${wlRows.length} bekleme kaydı`)
  process.exit(0)
}

main().catch((e) => {
  console.error('✗ Seed hatası:', e)
  process.exit(1)
})
