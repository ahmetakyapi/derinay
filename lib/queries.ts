import 'server-only'
import { and, arrayContains, desc, eq, gte, ilike, lt, lte, or, sql } from 'drizzle-orm'
import { unstable_noStore as noStore } from 'next/cache'
import { db } from './db'
import { clients, transactions, invoices, payments, sessions, clientNotes, settings, waitlist, sessionPackages, clientScores, clientDocuments, clientGoals } from './schema'
import { monthKey, monthKeyToLabel } from './format'
import { taxSeries, type PeriodInput } from './finance'
import { REMINDER_TEMPLATE_DEFAULT, DEBT_REMINDER_TEMPLATE_DEFAULT, APP, BUSINESS, TAX, type BusinessInfo, type ClientStatus, type TxType, type TxScope } from './constants'

const num = (x: string | number | null | undefined) => Number(x ?? 0)

// ─── Tarih yardımcıları ──────────────────────────────────────────────────────
function monthBounds(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { start: iso(start), end: iso(end) }
}
function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── İşlemler ────────────────────────────────────────────────────────────────
export type TxRow = {
  id: string
  type: TxType
  amount: number
  category: string
  description: string | null
  date: string
  clientId: string | null
  clientName: string | null
  /** Gider satırındaki indirilecek KDV — gelir/kişisel satırlarda 0 */
  kdvAmount: number
}

export async function listTransactions(opts?: {
  month?: string // YYYY-MM
  type?: TxType
  scope?: TxScope
  q?: string // kategori/açıklama araması
}): Promise<TxRow[]> {
  const filters = []
  if (opts?.type) filters.push(eq(transactions.type, opts.type))
  if (opts?.scope) filters.push(eq(transactions.scope, opts.scope))
  if (opts?.month) {
    const [y, m] = opts.month.split('-').map(Number)
    filters.push(gte(transactions.date, iso(new Date(y, m - 1, 1))))
    filters.push(lte(transactions.date, iso(new Date(y, m, 0))))
  }
  if (opts?.q?.trim()) {
    const term = `%${opts.q.trim()}%`
    filters.push(or(ilike(transactions.category, term), ilike(transactions.description, term))!)
  }
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      category: transactions.category,
      description: transactions.description,
      date: transactions.date,
      kdvAmount: transactions.kdvAmount,
      clientId: transactions.clientId,
      clientName: clients.name,
    })
    .from(transactions)
    .leftJoin(clients, eq(transactions.clientId, clients.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(transactions.date))

  return rows.map((r) => ({ ...r, amount: num(r.amount), kdvAmount: num(r.kdvAmount) }))
}

// ─── Dashboard istatistikleri ────────────────────────────────────────────────
export async function getDashboard(monthsBack = 6) {
  noStore()
  await autoMarkOverdue() // vade geçtiyse uyarı bandı güncel olsun
  const [allTx, allInvoices, clientRows, taxRates] = await Promise.all([
    // Dashboard = iş (business) genel görünümü; kişisel harcamalar hariç
    db.select().from(transactions).where(eq(transactions.scope, 'business')).orderBy(desc(transactions.date)),
    db.select().from(invoices),
    db.select().from(clients),
    getTaxSettings(),
  ])

  const now = new Date()
  const cur = monthKey(now)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prev = monthKey(prevDate)

  const sumBy = (key: string, type: TxType) =>
    allTx
      .filter((t) => t.type === type && monthKey(t.date) === key)
      .reduce((s, t) => s + num(t.amount), 0)

  const curIncome = sumBy(cur, 'income')
  const curExpense = sumBy(cur, 'expense')
  const prevIncome = sumBy(prev, 'income')
  const prevExpense = sumBy(prev, 'expense')

  // Vergi — Vergiler sayfasıyla AYNI seriden okunur (devreden KDV zinciri dahil).
  // Ayrı hesaplansaydı iki ekran farklı "ödenecek vergi" gösterebilirdi.
  const taxRows = taxSeries(
    buildPeriods(allTx, allInvoices, monthKeysFromYearStart(now)),
    taxRates.incomeTaxRate,
  )
  const tax = taxRows[taxRows.length - 1]

  // Aylık trend (son N ay)
  const trend: { key: string; label: string; income: number; expense: number; net: number }[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const k = monthKey(d)
    const income = sumBy(k, 'income')
    const expense = sumBy(k, 'expense')
    trend.push({ key: k, label: monthKeyToLabel(k), income, expense, net: income - expense })
  }

  // Kategori kırılımı (bu ay, gider)
  const expenseByCat = new Map<string, number>()
  allTx
    .filter((t) => t.type === 'expense' && monthKey(t.date) === cur)
    .forEach((t) => expenseByCat.set(t.category, (expenseByCat.get(t.category) ?? 0) + num(t.amount)))
  const categoryBreakdown = [...expenseByCat.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Son işlemler
  const recent = allTx.slice(0, 6).map((t) => ({
    id: t.id,
    type: t.type,
    amount: num(t.amount),
    category: t.category,
    description: t.description,
    date: t.date,
  }))

  return {
    kpis: {
      income: curIncome,
      expense: curExpense,
      net: curIncome - curExpense,
      taxDue: tax.totalDue,
      prevIncome,
      prevExpense,
      prevNet: prevIncome - prevExpense,
    },
    tax,
    trend,
    categoryBreakdown,
    recent,
    clientCount: clientRows.length,
    activeClientCount: clientRows.filter((c) => c.status === 'active').length,
  }
}

// ─── Danışanlar ──────────────────────────────────────────────────────────────
export async function listClients(opts?: { status?: ClientStatus; q?: string; tag?: string }) {
  noStore()
  const filters = []
  if (opts?.status) filters.push(eq(clients.status, opts.status))
  if (opts?.q?.trim()) filters.push(ilike(clients.name, `%${opts.q.trim()}%`))
  if (opts?.tag?.trim()) filters.push(arrayContains(clients.tags, [opts.tag.trim()]))
  const [rows, upcoming] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(clients.createdAt)),
    // Sıradaki planlı seans — kart üzerinde "sonraki seans" için
    db
      .select({ clientId: sessions.clientId, date: sessions.date })
      .from(sessions)
      .where(and(eq(sessions.status, 'scheduled'), gte(sessions.date, new Date())))
      .orderBy(sessions.date),
  ])
  const nextByClient = new Map<string, Date>()
  for (const s of upcoming) if (!nextByClient.has(s.clientId)) nextByClient.set(s.clientId, s.date)
  return rows.map((c) => ({
    ...c,
    sessionFee: num(c.sessionFee),
    nextSession: nextByClient.get(c.id) ? String(nextByClient.get(c.id)) : null,
  }))
}

export async function getClientDetail(id: string) {
  noStore()
  const [client] = await db.select().from(clients).where(eq(clients.id, id))
  if (!client) return null

  const [notes, sess, pays, invs, txs, pkgs, scoreRows, docRows, goalRows] = await Promise.all([
    db.select().from(clientNotes).where(eq(clientNotes.clientId, id)).orderBy(desc(clientNotes.pinned), desc(clientNotes.createdAt)),
    db.select().from(sessions).where(eq(sessions.clientId, id)).orderBy(desc(sessions.date)),
    db.select().from(payments).where(eq(payments.clientId, id)).orderBy(desc(payments.date)),
    db.select().from(invoices).where(eq(invoices.clientId, id)).orderBy(desc(invoices.issueDate)),
    db.select().from(transactions).where(eq(transactions.clientId, id)).orderBy(desc(transactions.date)),
    db.select().from(sessionPackages).where(eq(sessionPackages.clientId, id)).orderBy(desc(sessionPackages.purchaseDate)),
    db.select().from(clientScores).where(eq(clientScores.clientId, id)).orderBy(clientScores.date),
    db.select().from(clientDocuments).where(eq(clientDocuments.clientId, id)).orderBy(desc(clientDocuments.createdAt)),
    db.select().from(clientGoals).where(eq(clientGoals.clientId, id)).orderBy(clientGoals.createdAt),
  ])

  const totalPaid = pays.reduce((s, p) => s + num(p.amount), 0)
  const totalInvoiced = invs.reduce((s, i) => s + num(i.total), 0)
  const completedSessions = sess.filter((s) => s.status === 'completed').length
  const noShowSessions = sess.filter((s) => s.status === 'no_show').length
  const cancelledSessions = sess.filter((s) => s.status === 'cancelled').length

  // Aktif paket = en güncel paket; kullanım = satın alma tarihinden sonra tamamlanan seanslar
  const latest = pkgs[0]
  const activePackage = latest
    ? (() => {
        const used = sess.filter(
          (s) => s.status === 'completed' && String(s.date).slice(0, 10) >= String(latest.purchaseDate).slice(0, 10),
        ).length
        return {
          id: latest.id,
          totalSessions: latest.totalSessions,
          pricePaid: num(latest.pricePaid),
          purchaseDate: String(latest.purchaseDate),
          note: latest.note,
          used: Math.min(used, latest.totalSessions),
          remaining: Math.max(latest.totalSessions - used, 0),
        }
      })()
    : null

  return {
    client: { ...client, sessionFee: num(client.sessionFee) },
    notes,
    sessions: sess.map((s) => ({ ...s, fee: num(s.fee) })),
    payments: pays.map((p) => ({ ...p, amount: num(p.amount) })),
    invoices: invs.map((i) => ({ ...i, total: num(i.total), subtotal: num(i.subtotal), kdvAmount: num(i.kdvAmount) })),
    transactions: txs.map((t) => ({ ...t, amount: num(t.amount) })),
    activePackage,
    scores: scoreRows.map((s) => ({
      id: s.id,
      label: s.label,
      value: num(s.value),
      scaleMax: s.scaleMax,
      date: String(s.date),
      note: s.note,
    })),
    documents: docRows.map((d) => ({ id: d.id, name: d.name, type: d.type, url: d.url, note: d.note })),
    goals: goalRows.map((g) => ({
      id: g.id,
      title: g.title,
      status: g.status,
      note: g.note,
      achievedAt: g.achievedAt ? String(g.achievedAt) : null,
    })),
    stats: { totalPaid, totalInvoiced, completedSessions, noShowSessions, cancelledSessions, outstanding: totalInvoiced - totalPaid },
  }
}

// ─── Devam & no-show istatistiği (son N ay) ──────────────────────────────────
export async function getAttendanceStats(monthsBack = 12) {
  const now = new Date()
  const since = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)
  const rows = await db.select({ status: sessions.status, fee: sessions.fee, date: sessions.date }).from(sessions)

  let completed = 0, cancelled = 0, noShow = 0, lostRevenue = 0
  for (const r of rows) {
    if (new Date(r.date) < since) continue
    if (r.status === 'completed') completed++
    else if (r.status === 'cancelled') { cancelled++; lostRevenue += num(r.fee) }
    else if (r.status === 'no_show') { noShow++; lostRevenue += num(r.fee) }
  }
  const past = completed + cancelled + noShow
  const attendanceRate = past > 0 ? Math.round((completed / past) * 100) : 100
  const noShowRate = past > 0 ? Math.round((noShow / past) * 100) : 0
  return { completed, cancelled, noShow, lostRevenue, attendanceRate, noShowRate, monthsBack }
}

// ─── Faturalar ───────────────────────────────────────────────────────────────

/** Vadesi geçen 'sent' makbuzları otomatik 'overdue' yapar — okuma sırasında, idempotent */
async function autoMarkOverdue() {
  await db
    .update(invoices)
    .set({ status: 'overdue' })
    .where(and(eq(invoices.status, 'sent'), lt(invoices.dueDate, iso(new Date()))))
}

export async function listInvoices() {
  await autoMarkOverdue()
  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      subtotal: invoices.subtotal,
      kdvRate: invoices.kdvRate,
      kdvAmount: invoices.kdvAmount,
      stopajAmount: invoices.stopajAmount,
      total: invoices.total,
      status: invoices.status,
      clientId: invoices.clientId,
      clientName: clients.name,
      clientAvatar: clients.avatarUrl,
      clientColor: clients.colorTag,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.issueDate))
  return rows.map((i) => ({
    ...i,
    subtotal: num(i.subtotal),
    kdvAmount: num(i.kdvAmount),
    stopajAmount: num(i.stopajAmount),
    total: num(i.total),
  }))
}

// ─── Tek fatura (yazdırma/PDF) ───────────────────────────────────────────────
export async function getInvoiceDetail(id: string) {
  const [row] = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      subtotal: invoices.subtotal,
      kdvRate: invoices.kdvRate,
      kdvAmount: invoices.kdvAmount,
      stopajRate: invoices.stopajRate,
      stopajAmount: invoices.stopajAmount,
      total: invoices.total,
      status: invoices.status,
      note: invoices.note,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.id, id))

  if (!row) return null
  return {
    ...row,
    subtotal: num(row.subtotal),
    kdvAmount: num(row.kdvAmount),
    stopajAmount: num(row.stopajAmount),
    total: num(row.total),
  }
}

// ─── Ödemeler ────────────────────────────────────────────────────────────────
export async function listPayments() {
  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      date: payments.date,
      method: payments.method,
      note: payments.note,
      clientId: payments.clientId,
      clientName: clients.name,
      clientAvatar: clients.avatarUrl,
      clientColor: clients.colorTag,
      invoiceId: payments.invoiceId,
    })
    .from(payments)
    .leftJoin(clients, eq(payments.clientId, clients.id))
    .orderBy(desc(payments.date))
  return rows.map((p) => ({ ...p, amount: num(p.amount) }))
}

// Form select'leri için hafif danışan listesi (sessionFee → seans ücretini otomatik doldurmak için)
/** Komut paleti için hafif danışan listesi (ad + renk + avatar) */
export async function clientSearchList() {
  noStore()
  return db
    .select({ id: clients.id, name: clients.name, colorTag: clients.colorTag, avatarUrl: clients.avatarUrl })
    .from(clients)
    .orderBy(clients.name)
}

export async function clientOptions() {
  noStore()
  const rows = await db
    .select({ id: clients.id, name: clients.name, sessionFee: clients.sessionFee })
    .from(clients)
    .orderBy(clients.name)
  return rows.map((r) => ({ ...r, sessionFee: num(r.sessionFee) }))
}

// ─── Yaklaşan doğum günleri (önümüzdeki N gün) ──────────────────────────────
export async function getUpcomingBirthdays(daysAhead = 14) {
  noStore()
  const rows = await db
    .select({ id: clients.id, name: clients.name, birthDate: clients.birthDate, colorTag: clients.colorTag, avatarUrl: clients.avatarUrl })
    .from(clients)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = rows
    .filter((r) => r.birthDate)
    .map((r) => {
      const [, mm, dd] = String(r.birthDate).split('-').map(Number)
      let next = new Date(today.getFullYear(), mm - 1, dd)
      if (next < today) next = new Date(today.getFullYear() + 1, mm - 1, dd)
      const daysUntil = Math.round((next.getTime() - today.getTime()) / 86_400_000)
      return { id: r.id, name: r.name, colorTag: r.colorTag, avatarUrl: r.avatarUrl, daysUntil, month: mm, day: dd }
    })
    .filter((r) => r.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return upcoming
}

// ─── Dashboard hatırlatmaları (bugün + eksik not + biten paket + eski ölçüm) ──
export async function getDashboardReminders() {
  noStore()
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dkey = (d: Date | string) => iso(new Date(d))
  const todayKey = dkey(now)
  const tomorrowKey = dkey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const since30 = dkey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30))

  const [clientRows, sess, pkgs, scoreRows] = await Promise.all([
    db.select({ id: clients.id, name: clients.name, phone: clients.phone, colorTag: clients.colorTag, avatarUrl: clients.avatarUrl, status: clients.status, consentGiven: clients.consentGiven }).from(clients),
    db.select({ id: sessions.id, clientId: sessions.clientId, date: sessions.date, status: sessions.status, note: sessions.note, fee: sessions.fee }).from(sessions),
    db.select().from(sessionPackages).orderBy(desc(sessionPackages.purchaseDate)),
    db.select({ clientId: clientScores.clientId, date: clientScores.date, label: clientScores.label }).from(clientScores),
  ])
  // Map — `clientRows.find()` her seans/not/paket/ölçüm için tüm listeyi
  // tarıyordu (O(n²)). Dashboard'un en sıcak sorgusu, indeks bir kez kurulur.
  const clientById = new Map(clientRows.map((c) => [c.id, c]))
  const cOf = (id: string | null) => (id ? clientById.get(id) : undefined)

  // Danışan başına TAMAMLANMIŞ seans tarihleri — paket kullanımı bunun üzerinden
  // sayılır; eskiden paket başına tüm seans listesi filtreleniyordu.
  const completedByClient = new Map<string, string[]>()
  for (const s of sess) {
    if (s.status !== 'completed' || !s.clientId) continue
    const list = completedByClient.get(s.clientId) ?? []
    list.push(dkey(s.date))
    completedByClient.set(s.clientId, list)
  }

  const mapSession = (s: (typeof sess)[number]) => {
    const d = new Date(s.date)
    const c = cOf(s.clientId)
    return {
      id: s.id,
      clientId: s.clientId,
      clientName: c?.name ?? '—',
      clientPhone: c?.phone ?? null,
      colorTag: c?.colorTag ?? 'indigo',
      avatarUrl: c?.avatarUrl ?? null,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      dateIso: d.toISOString(),
      status: s.status,
    }
  }
  const byTime = (a: { dateIso: string }, b: { dateIso: string }) => +new Date(a.dateIso) - +new Date(b.dateIso)

  // Bugünkü seanslar (saate göre) + yarınki planlı seanslar (hatırlatma için)
  const todaySessions = sess.filter((s) => dkey(s.date) === todayKey).map(mapSession).sort(byTime)
  const tomorrowSessions = sess
    .filter((s) => s.status === 'scheduled' && dkey(s.date) === tomorrowKey)
    .map(mapSession)
    .sort(byTime)

  // Tamamlanmış ama notu boş seanslar (son 30 gün)
  const missingNotes = sess
    .filter((s) => s.status === 'completed' && dkey(s.date) >= since30 && !(s.note && s.note.trim()))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((s) => ({ id: s.id, clientId: s.clientId, clientName: cOf(s.clientId)?.name ?? '—', date: dkey(s.date) }))

  // Biten/bitmek üzere paketler (her danışanın en güncel paketi, kalan ≤ 1)
  const seen = new Set<string>()
  const endingPackages: { clientId: string; clientName: string; remaining: number; total: number }[] = []
  for (const p of pkgs) {
    if (seen.has(p.clientId)) continue
    seen.add(p.clientId)
    const since = String(p.purchaseDate).slice(0, 10)
    const used = (completedByClient.get(p.clientId) ?? []).filter((d) => d >= since).length
    const remaining = Math.max(p.totalSessions - used, 0)
    if (remaining <= 1) endingPackages.push({ clientId: p.clientId, clientName: cOf(p.clientId)?.name ?? '—', remaining, total: p.totalSessions })
  }

  // Eskimiş ölçüm (ölçüm yapılmış ama son ölçüm 28+ gün önce)
  const latestByClient = new Map<string, { date: string; label: string }>()
  for (const s of scoreRows) {
    const cur = latestByClient.get(s.clientId)
    if (!cur || String(s.date) > cur.date) latestByClient.set(s.clientId, { date: String(s.date), label: s.label })
  }
  const staleScores: { clientId: string; clientName: string; daysSince: number; label: string }[] = []
  for (const [clientId, info] of latestByClient) {
    const daysSince = Math.round((+new Date(todayKey) - +new Date(info.date)) / 86_400_000)
    if (daysSince >= 28) staleScores.push({ clientId, clientName: cOf(clientId)?.name ?? '—', daysSince, label: info.label })
  }
  staleScores.sort((a, b) => b.daysSince - a.daysSince)

  // Onam/KVKK eksik aktif danışanlar
  const missingConsent = clientRows
    .filter((c) => c.status === 'active' && !c.consentGiven)
    .map((c) => ({ clientId: c.id, clientName: c.name }))

  // Yedek eskidi mi? (hiç yoksa veya 14+ gün geçtiyse uyar)
  const backup = await getLastBackup()
  const backupStale = backup.daysAgo === null || backup.daysAgo >= 14 ? backup : null

  return { todaySessions, tomorrowSessions, missingNotes, endingPackages, staleScores, missingConsent, backupStale }
}

// ─── Bekleyen tahsilat — danışan başına bakiye (faturalanan − ödenen) ─────────
export async function getOutstandingBalances() {
  noStore()
  const [clientRows, invs] = await Promise.all([
    db
      .select({ id: clients.id, name: clients.name, phone: clients.phone, colorTag: clients.colorTag, avatarUrl: clients.avatarUrl })
      .from(clients),
    db.select().from(invoices),
  ])

  /**
   * BAKİYE MAKBUZ DURUMUNDAN TÜRER — ödeme kayıtlarından değil.
   *
   * Eskiden bakiye "taslak olmayan makbuz toplamı − ödeme kaydı toplamı" idi;
   * bir makbuzu 'Ödendi' işaretlemek bakiyeyi KAPATMIYORDU, ayrıca ödeme kaydı
   * girmek gerekiyordu. İkisini birden yapan kullanıcı ise borcu iki kez
   * kapatmış oluyordu. Tek ve öğretilebilir kural: **açık makbuz = borç**.
   * Ödemeler ayrı bir defterdir (tahsilat geçmişi, yöntem dağılımı).
   */
  const openStatuses = new Set(['sent', 'overdue'])
  const today = iso(new Date())
  const byClient = new Map<string, { total: number; oldestDue: string | null }>()

  for (const i of invs) {
    if (!i.clientId || !openStatuses.has(i.status)) continue
    const cur = byClient.get(i.clientId) ?? { total: 0, oldestDue: null }
    cur.total += num(i.total)
    // Yaşlandırma için en ESKİ vade — alacağın kaç gündür beklediğini o söyler
    if (i.dueDate && (!cur.oldestDue || i.dueDate < cur.oldestDue)) cur.oldestDue = i.dueDate
    byClient.set(i.clientId, cur)
  }

  const daysBetween = (from: string) =>
    Math.max(0, Math.floor((Date.parse(today) - Date.parse(from)) / 86_400_000))

  const balances = clientRows
    .map((c) => {
      const row = byClient.get(c.id)
      if (!row || row.total <= 0.005) return null
      const overdueDays = row.oldestDue && row.oldestDue < today ? daysBetween(row.oldestDue) : 0
      return { ...c, outstanding: row.total, overdueDays }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    // Önce en uzun bekleyen, sonra en büyük tutar — kovalama sırası budur
    .sort((a, b) => b.overdueDays - a.overdueDays || b.outstanding - a.outstanding)

  const overdue = invs.filter(
    (i) => i.status === 'overdue' || (i.status === 'sent' && i.dueDate !== null && i.dueDate < today),
  )

  return {
    balances: balances.slice(0, 6),
    balanceTotal: balances.reduce((s, b) => s + b.outstanding, 0),
    balanceCount: balances.length,
    overdueCount: overdue.length,
    overdueTotal: overdue.reduce((s, i) => s + num(i.total), 0),
  }
}

// ─── Kişisel harcamalar (gün bazlı takvim) ───────────────────────────────────
export async function getPersonalMonth(month?: string) {
  noStore()
  const base = month ? new Date(Number(month.split('-')[0]), Number(month.split('-')[1]) - 1, 1) : new Date()
  const start = iso(new Date(base.getFullYear(), base.getMonth(), 1))
  const end = iso(new Date(base.getFullYear(), base.getMonth() + 1, 0))

  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.scope, 'personal'),
        gte(transactions.date, start),
        lte(transactions.date, end),
      ),
    )
    .orderBy(desc(transactions.date))

  const items = rows.map((t) => ({
    id: t.id,
    amount: num(t.amount),
    category: t.category,
    description: t.description,
    date: t.date, // YYYY-MM-DD
  }))

  // Gün → toplam ve kalemler
  const byDay = new Map<string, { total: number; items: typeof items }>()
  for (const it of items) {
    const cur = byDay.get(it.date) ?? { total: 0, items: [] }
    cur.total += it.amount
    cur.items.push(it)
    byDay.set(it.date, cur)
  }

  const total = items.reduce((s, it) => s + it.amount, 0)
  // Kategori kırılımı
  const byCat = new Map<string, number>()
  items.forEach((it) => byCat.set(it.category, (byCat.get(it.category) ?? 0) + it.amount))
  const categoryBreakdown = [...byCat.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    monthDate: { year: base.getFullYear(), month: base.getMonth() },
    byDay: Object.fromEntries([...byDay.entries()].map(([k, v]) => [k, v])),
    items,
    total,
    categoryBreakdown,
  }
}

// ─── Haftalık seans takvimi (dashboard) ──────────────────────────────────────
export async function getWeekSessions(weekOffset = 0) {
  noStore()
  const now = new Date()
  // Haftanın başlangıcı = Pazartesi
  const day = (now.getDay() + 6) % 7 // Pzt=0 … Paz=6
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + weekOffset * 7)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59)

  const rows = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      durationMin: sessions.durationMin,
      status: sessions.status,
      fee: sessions.fee,
      clientId: sessions.clientId,
      clientName: clients.name,
      colorTag: clients.colorTag,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(and(gte(sessions.date, monday), lte(sessions.date, sunday)))
    .orderBy(sessions.date)

  // 7 güne dağıt
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    return { date: d, key: iso(d), items: [] as typeof rows }
  })
  for (const s of rows) {
    const k = iso(new Date(s.date))
    const slot = days.find((d) => d.key === k)
    if (slot) slot.items.push(s)
  }

  return {
    weekStart: iso(monday),
    todayKey: iso(now),
    days: days.map((d) => ({
      key: d.key,
      label: new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(d.date),
      dayNum: d.date.getDate(),
      items: d.items.map((s) => ({
        id: s.id,
        time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(s.date)),
        clientName: s.clientName ?? '—',
        clientId: s.clientId,
        colorTag: s.colorTag ?? 'indigo',
        status: s.status,
        durationMin: s.durationMin,
      })),
    })),
  }
}


/**
 * Bir ay aralığının ham vergi girdilerini çıkarır (ESKİDEN YENİYE sıralı).
 * `taxSeries` bunu devreden KDV zinciriyle işler — dashboard ve Vergiler
 * sayfası AYNI fonksiyonu kullandığı için iki ekran farklı rakam gösteremez.
 *
 * `startKey`'den önceki aylar da hesaba katılır: devreden KDV zinciri yılbaşından
 * kurulmazsa ilk ayın devreden bakiyesi sıfır sanılır.
 */
function buildPeriods(
  allTx: { type: string; date: string; amount: string | number; kdvAmount: string | number | null }[],
  allInvoices: { status: string; issueDate: string; kdvAmount: string | number; stopajAmount: string | number }[],
  keys: string[],
): PeriodInput[] {
  return keys.map((k) => {
    const monthTx = allTx.filter((t) => monthKey(t.date) === k)
    const monthInv = allInvoices.filter((iv) => iv.status !== 'draft' && monthKey(iv.issueDate) === k)
    return {
      key: k,
      label: monthKeyToLabel(k),
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + num(t.amount), 0),
      expense: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + num(t.amount), 0),
      kdvCollected: monthInv.reduce((s, iv) => s + num(iv.kdvAmount), 0),
      kdvDeductible: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + num(t.kdvAmount), 0),
      stopajWithheld: monthInv.reduce((s, iv) => s + num(iv.stopajAmount), 0),
    }
  })
}

/** Yılbaşından verilen aya kadarki ay anahtarları — devreden zinciri için */
function monthKeysFromYearStart(through: Date): string[] {
  const out: string[] = []
  for (let m = 0; m <= through.getMonth(); m++) out.push(monthKey(new Date(through.getFullYear(), m, 1)))
  return out
}

// ─── Vergi genel görünümü ────────────────────────────────────────────────────
export async function getTaxOverview(monthsBack = 6) {
  noStore()
  const [allTx, allInvoices, taxRates] = await Promise.all([
    db.select().from(transactions).where(eq(transactions.scope, 'business')),
    db.select().from(invoices),
    getTaxSettings(),
  ])
  const now = new Date()

  // Devreden KDV zinciri YILBAŞINDAN kurulur; yalnız gösterilen 6 ay üzerinden
  // kurulsaydı ilk ayın devreden bakiyesi hatalı biçimde sıfır sayılırdı.
  const chainKeys = monthKeysFromYearStart(now)
  const full = taxSeries(buildPeriods(allTx, allInvoices, chainKeys), taxRates.incomeTaxRate)
  const months = full.slice(-monthsBack)

  const current = months[months.length - 1]
  return { months, current, taxRates }
}

// ─── Yıllık analiz ───────────────────────────────────────────────────────────
export async function getYearAnalytics(year: number) {
  noStore()
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31, 23, 59, 59)

  const [txs, invs, sess, pays] = await Promise.all([
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        category: transactions.category,
        date: transactions.date,
        kdvAmount: transactions.kdvAmount, // indirilecek KDV — taxSeries okur
        clientId: transactions.clientId,
        clientName: clients.name,
        clientColor: clients.colorTag,
        clientAvatar: clients.avatarUrl,
      })
      .from(transactions)
      .leftJoin(clients, eq(transactions.clientId, clients.id))
      .where(and(eq(transactions.scope, 'business'), gte(transactions.date, start), lte(transactions.date, end))),
    db.select().from(invoices).where(and(gte(invoices.issueDate, start), lte(invoices.issueDate, end))),
    db.select().from(sessions).where(and(gte(sessions.date, yearStart), lte(sessions.date, yearEnd))),
    db.select().from(payments).where(and(gte(payments.date, start), lte(payments.date, end))),
  ])
  const taxRates = await getTaxSettings()

  // 12 aylık seri + kümülatif net — vergi tarafı ORTAK seriden (devreden KDV dahil)
  const yearKeys = Array.from({ length: 12 }, (_, m) => `${year}-${String(m + 1).padStart(2, '0')}`)
  const taxRows = taxSeries(buildPeriods(txs, invs, yearKeys), taxRates.incomeTaxRate)
  const months = taxRows.map((r) => ({
    key: r.key,
    label: r.label,
    income: r.income,
    expense: r.expense,
    net: r.income - r.expense,
    kdv: r.kdvCollected,
    kdvDeductible: r.kdvDeductible,
    kdvPayable: r.kdvPayable,
    incomeTax: r.incomeTax,
    totalDue: r.totalDue,
  }))
  let running = 0
  const cumulative = months.map((m) => ({ label: m.label, value: (running += m.net) }))

  const totalIncome = months.reduce((s, m) => s + m.income, 0)
  const totalExpense = months.reduce((s, m) => s + m.expense, 0)
  // Yıllık toplamda ÖDENECEK KDV kullanılır — 'toplanan' beyan edilecek tutar değil
  const totalKdv = months.reduce((s, m) => s + m.kdvPayable, 0)
  const totalTax = months.reduce((s, m) => s + m.totalDue, 0)

  // Ortalama: cari yılda geçen aylar, geçmiş yılda 12 ay
  const now = new Date()
  const elapsed = year === now.getFullYear() ? now.getMonth() + 1 : year < now.getFullYear() ? 12 : 1
  const bestMonthRaw = months.reduce((a, b) => (b.net > a.net ? b : a), months[0])
  const bestMonth = {
    ...bestMonthRaw,
    // Kısaltma değil tam ay adı ("Mar" değil "Mart")
    fullLabel: new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(
      new Date(year, Number(bestMonthRaw.key.split('-')[1]) - 1, 1),
    ),
  }

  // Kategori kırılımları (yıllık)
  const catSum = (type: TxType) => {
    const map = new Map<string, number>()
    txs.filter((t) => t.type === type).forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + num(t.amount)))
    return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
  }

  // En çok gelir getiren danışanlar
  const clientMap = new Map<string, { name: string; color: string; avatar: string | null; amount: number }>()
  txs
    .filter((t) => t.type === 'income' && t.clientId)
    .forEach((t) => {
      const cur = clientMap.get(t.clientId!) ?? { name: t.clientName ?? '—', color: t.clientColor ?? 'indigo', avatar: t.clientAvatar ?? null, amount: 0 }
      cur.amount += num(t.amount)
      clientMap.set(t.clientId!, cur)
    })
  const topClients = [...clientMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)

  // Seans istatistikleri
  const sessionStats = {
    total: sess.length,
    completed: sess.filter((s) => s.status === 'completed').length,
    scheduled: sess.filter((s) => s.status === 'scheduled').length,
    cancelled: sess.filter((s) => s.status === 'cancelled').length,
    noShow: sess.filter((s) => s.status === 'no_show').length,
    avgFee: (() => {
      const done = sess.filter((s) => s.status === 'completed')
      return done.length ? done.reduce((sum, s) => sum + num(s.fee), 0) / done.length : 0
    })(),
    // Gelmeyen + iptal seansların kaçırılan ücreti (gelir kaybı)
    lostRevenue: sess
      .filter((s) => s.status === 'no_show' || s.status === 'cancelled')
      .reduce((sum, s) => sum + num(s.fee), 0),
  }

  // Ödeme yöntemi kırılımı
  const methodTotals = (['cash', 'card', 'transfer'] as const).map((m) => ({
    method: m,
    amount: pays.filter((p) => p.method === m).reduce((s, p) => s + num(p.amount), 0),
    count: pays.filter((p) => p.method === m).length,
  }))

  return {
    year,
    months,
    cumulative,
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      kdv: totalKdv,
      tax: totalTax,
      avgMonthlyNet: (totalIncome - totalExpense) / elapsed,
    },
    bestMonth,
    expenseByCategory: catSum('expense'),
    incomeByCategory: catSum('income'),
    topClients,
    sessionStats,
    methodTotals,
  }
}

// ─── Ajanda ──────────────────────────────────────────────────────────────────
export type AgendaItem = {
  id: string
  clientId: string | null
  clientName: string
  clientPhone: string | null
  colorTag: string
  status: string
  fee: number
  durationMin: number
  dateKey: string
  /** Gece yarısından itibaren dakika (saat ızgarasında konum) */
  startMin: number
  time: string
}

function mondayOf(d: Date) {
  const day = (d.getDay() + 6) % 7 // Pzt=0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
}

/** Haftalık ajanda — anchor (YYYY-MM-DD) hangi haftaysa o hafta */
export async function getAgendaWeek(anchor?: string) {
  const base = anchor ? new Date(`${anchor}T12:00:00`) : new Date()
  const monday = mondayOf(base)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59)

  const rows = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      durationMin: sessions.durationMin,
      status: sessions.status,
      fee: sessions.fee,
      clientId: sessions.clientId,
      clientName: clients.name,
      clientPhone: clients.phone,
      colorTag: clients.colorTag,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(and(gte(sessions.date, monday), lte(sessions.date, sunday)))
    .orderBy(sessions.date)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
    return {
      key: iso(d),
      label: new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(d),
      dayNum: d.getDate(),
      items: [] as AgendaItem[],
    }
  })

  for (const r of rows) {
    const d = new Date(r.date)
    const key = iso(d)
    const slot = days.find((x) => x.key === key)
    if (!slot) continue
    slot.items.push({
      id: r.id,
      clientId: r.clientId,
      clientName: r.clientName ?? '—',
      clientPhone: r.clientPhone,
      colorTag: r.colorTag ?? 'indigo',
      status: r.status,
      fee: num(r.fee),
      durationMin: r.durationMin,
      dateKey: key,
      startMin: d.getHours() * 60 + d.getMinutes(),
      time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(d),
    })
  }

  const prevAnchor = iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() - 7))
  const nextAnchor = iso(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7))
  return { days, todayKey: iso(new Date()), weekStart: iso(monday), prevAnchor, nextAnchor }
}

/** Aylık ajanda — gün → seans listesi */
export async function getAgendaMonth(month?: string) {
  const base = month ? new Date(Number(month.split('-')[0]), Number(month.split('-')[1]) - 1, 1) : new Date()
  const start = new Date(base.getFullYear(), base.getMonth(), 1)
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59)

  const rows = await db
    .select({
      id: sessions.id,
      date: sessions.date,
      status: sessions.status,
      clientId: sessions.clientId,
      clientName: clients.name,
      colorTag: clients.colorTag,
    })
    .from(sessions)
    .leftJoin(clients, eq(sessions.clientId, clients.id))
    .where(and(gte(sessions.date, start), lte(sessions.date, end)))
    .orderBy(sessions.date)

  const byDay = new Map<string, { id: string; time: string; clientId: string | null; clientName: string; colorTag: string; status: string }[]>()
  for (const r of rows) {
    const d = new Date(r.date)
    const key = iso(d)
    const list = byDay.get(key) ?? []
    list.push({
      id: r.id,
      time: new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(d),
      clientId: r.clientId,
      clientName: r.clientName ?? '—',
      colorTag: r.colorTag ?? 'indigo',
      status: r.status,
    })
    byDay.set(key, list)
  }

  return {
    year: base.getFullYear(),
    month: base.getMonth(),
    byDay: Object.fromEntries(byDay),
    todayKey: iso(new Date()),
    total: rows.length,
  }
}

// ─── Ayarlar ─────────────────────────────────────────────────────────────────
export async function getReminderTemplate(): Promise<string> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'reminder_template'))
  return row?.value ?? REMINDER_TEMPLATE_DEFAULT
}

/**
 * Hatırlatma mesajı için gereken her şey: şablon + `{terapist}` yerine yazılacak ad.
 * Ad, Ayarlar → İşletme Kimliği'nden gelir (kodda kişi adı tutulmaz).
 */
export async function getReminderConfig(): Promise<{
  template: string
  debtTemplate: string
  therapist: string
}> {
  const [template, business, debtRow] = await Promise.all([
    getReminderTemplate(),
    getBusinessInfo(),
    db.select().from(settings).where(eq(settings.key, 'debt_reminder_template')),
  ])
  return {
    template,
    debtTemplate: debtRow[0]?.value ?? DEBT_REMINDER_TEMPLATE_DEFAULT,
    therapist: business.owner.trim() || business.name.trim(),
  }
}

// ─── Bekleme listesi ─────────────────────────────────────────────────────────
export async function listWaitlist() {
  // DİKKAT: desc(priority) METİN sıralamasıdır — 'normal' > 'high' olduğu için
  // öncelikli başvuruları listenin SONUNA atardı. Açık CASE ifadesiyle sıralanır.
  const rows = await db
    .select()
    .from(waitlist)
    .orderBy(sql`case when ${waitlist.priority} = 'high' then 0 else 1 end`, desc(waitlist.createdAt))
  return rows.map((r) => ({ ...r, createdAt: String(r.createdAt) }))
}

// ─── Son yedek zamanı (export route'u yazar) ─────────────────────────────────
export async function getLastBackup(): Promise<{ at: string | null; daysAgo: number | null }> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'last_backup_at'))
  if (!row?.value) return { at: null, daysAgo: null }
  const d = new Date(row.value)
  if (Number.isNaN(d.getTime())) return { at: null, daysAgo: null }
  const daysAgo = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  return { at: row.value, daysAgo }
}

// ─── Aylık gelir hedefi (0 = kapalı) ─────────────────────────────────────────
export async function getIncomeGoal(): Promise<number> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'income_goal'))
  const n = Number(row?.value ?? 0)
  return Number.isFinite(n) && n > 0 ? n : 0
}

// ─── Vergi oranları (Ayarlar'dan düzenlenebilir) ─────────────────────────────
export type TaxSettings = { kdvRate: number; stopajRate: number; incomeTaxRate: number }

export async function getTaxSettings(): Promise<TaxSettings> {
  const def: TaxSettings = {
    kdvRate: TAX.KDV_RATE,
    stopajRate: TAX.STOPAJ_RATE,
    incomeTaxRate: TAX.INCOME_TAX_ESTIMATE_RATE,
  }
  const [row] = await db.select().from(settings).where(eq(settings.key, 'tax'))
  if (!row?.value) return def
  try {
    const saved = JSON.parse(row.value) as Partial<TaxSettings>
    return { ...def, ...saved }
  } catch {
    return def
  }
}

/** İşletme/makbuz kimliği — varsayılanların üzerine settings'teki JSON'u uygular */
export async function getBusinessInfo(): Promise<BusinessInfo> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'business'))
  if (!row?.value) return BUSINESS
  try {
    const saved = JSON.parse(row.value) as Partial<BusinessInfo>
    // Boş kaydedilen alan varsayılana düşer: belgede köşeli parantezli yer tutucu
    // kalır ("[Vergi Dairesi]"), boşluk değil — muhasebeci neyin eksik olduğunu görür.
    const merged = { ...BUSINESS }
    for (const key of Object.keys(BUSINESS) as (keyof BusinessInfo)[]) {
      const v = saved[key]
      if (typeof v === 'string' && v.trim()) merged[key] = v.trim()
    }
    return merged
  } catch {
    return BUSINESS
  }
}

/**
 * Panelde görünen sahip kimliği — sidebar kartı ve karşılama başlığı bunu kullanır.
 * Ayarlar boşsa marka adına düşer; hiçbir yerde sabit kişi adı yoktur.
 */
export async function getOwnerIdentity(): Promise<{
  name: string
  firstName: string
  title: string
  isSet: boolean
}> {
  const b = await getBusinessInfo()
  const owner = b.owner.trim()
  return {
    name: owner || b.name.trim() || APP.name,
    firstName: owner ? owner.split(/\s+/)[0] : '',
    title: b.title.trim() || BUSINESS.title,
    isSet: owner.length > 0,
  }
}
