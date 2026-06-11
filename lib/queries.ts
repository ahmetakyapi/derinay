import 'server-only'
import { and, arrayContains, desc, eq, gte, ilike, lte, or } from 'drizzle-orm'
import { db } from './db'
import { clients, transactions, invoices, payments, sessions, clientNotes, settings, waitlist, sessionPackages, clientScores } from './schema'
import { monthKey, monthKeyToLabel } from './format'
import { taxSummary } from './finance'
import { REMINDER_TEMPLATE_DEFAULT, BUSINESS, type BusinessInfo, type ClientStatus, type TxType, type TxScope } from './constants'

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
      clientId: transactions.clientId,
      clientName: clients.name,
    })
    .from(transactions)
    .leftJoin(clients, eq(transactions.clientId, clients.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(transactions.date))

  return rows.map((r) => ({ ...r, amount: num(r.amount) }))
}

// ─── Dashboard istatistikleri ────────────────────────────────────────────────
export async function getDashboard(monthsBack = 6) {
  const [allTx, allInvoices, clientRows] = await Promise.all([
    // Dashboard = iş (business) genel görünümü; kişisel harcamalar hariç
    db.select().from(transactions).where(eq(transactions.scope, 'business')).orderBy(desc(transactions.date)),
    db.select().from(invoices),
    db.select().from(clients),
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

  // KDV — bu ay düzenlenmiş (taslak hariç) faturalar
  const kdvCollected = allInvoices
    .filter((i) => i.status !== 'draft' && monthKey(i.issueDate) === cur)
    .reduce((s, i) => s + num(i.kdvAmount), 0)

  const tax = taxSummary({ income: curIncome, expense: curExpense, kdvCollected })

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
  const filters = []
  if (opts?.status) filters.push(eq(clients.status, opts.status))
  if (opts?.q?.trim()) filters.push(ilike(clients.name, `%${opts.q.trim()}%`))
  if (opts?.tag?.trim()) filters.push(arrayContains(clients.tags, [opts.tag.trim()]))
  const rows = await db
    .select()
    .from(clients)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(clients.createdAt))
  return rows.map((c) => ({ ...c, sessionFee: num(c.sessionFee) }))
}

export async function getClientDetail(id: string) {
  const [client] = await db.select().from(clients).where(eq(clients.id, id))
  if (!client) return null

  const [notes, sess, pays, invs, txs, pkgs, scoreRows] = await Promise.all([
    db.select().from(clientNotes).where(eq(clientNotes.clientId, id)).orderBy(desc(clientNotes.pinned), desc(clientNotes.createdAt)),
    db.select().from(sessions).where(eq(sessions.clientId, id)).orderBy(desc(sessions.date)),
    db.select().from(payments).where(eq(payments.clientId, id)).orderBy(desc(payments.date)),
    db.select().from(invoices).where(eq(invoices.clientId, id)).orderBy(desc(invoices.issueDate)),
    db.select().from(transactions).where(eq(transactions.clientId, id)).orderBy(desc(transactions.date)),
    db.select().from(sessionPackages).where(eq(sessionPackages.clientId, id)).orderBy(desc(sessionPackages.purchaseDate)),
    db.select().from(clientScores).where(eq(clientScores.clientId, id)).orderBy(clientScores.date),
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
export async function listInvoices() {
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
export async function clientOptions() {
  const rows = await db
    .select({ id: clients.id, name: clients.name, sessionFee: clients.sessionFee })
    .from(clients)
    .orderBy(clients.name)
  return rows.map((r) => ({ ...r, sessionFee: num(r.sessionFee) }))
}

// ─── Yaklaşan doğum günleri (önümüzdeki N gün) ──────────────────────────────
export async function getUpcomingBirthdays(daysAhead = 14) {
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

// ─── Bekleyen tahsilat — danışan başına bakiye (faturalanan − ödenen) ─────────
export async function getOutstandingBalances() {
  const [clientRows, invs, pays] = await Promise.all([
    db.select({ id: clients.id, name: clients.name, colorTag: clients.colorTag, avatarUrl: clients.avatarUrl }).from(clients),
    db.select().from(invoices),
    db.select().from(payments),
  ])

  const invoiced = new Map<string, number>()
  invs
    .filter((i) => i.clientId && i.status !== 'draft')
    .forEach((i) => invoiced.set(i.clientId!, (invoiced.get(i.clientId!) ?? 0) + num(i.total)))
  const paid = new Map<string, number>()
  pays.forEach((p) => paid.set(p.clientId, (paid.get(p.clientId) ?? 0) + num(p.amount)))

  const today = iso(new Date())
  const overdue = invs.filter(
    (i) => i.status === 'overdue' || (i.status === 'sent' && i.dueDate !== null && i.dueDate < today),
  )

  return {
    balances: clientRows
      .map((c) => ({ ...c, outstanding: (invoiced.get(c.id) ?? 0) - (paid.get(c.id) ?? 0) }))
      .filter((c) => c.outstanding > 0.005)
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 6),
    overdueCount: overdue.length,
    overdueTotal: overdue.reduce((s, i) => s + num(i.total), 0),
  }
}

// ─── Kişisel harcamalar (gün bazlı takvim) ───────────────────────────────────
export async function getPersonalMonth(month?: string) {
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

// ─── Vergi genel görünümü ────────────────────────────────────────────────────
export async function getTaxOverview(monthsBack = 6) {
  const [allTx, allInvoices] = await Promise.all([
    db.select().from(transactions).where(eq(transactions.scope, 'business')),
    db.select().from(invoices),
  ])
  const now = new Date()
  const months: {
    key: string; label: string; income: number; expense: number
    kdvCollected: number; stopajWithheld: number; incomeTax: number; totalDue: number
  }[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const k = monthKey(d)
    const income = allTx.filter((t) => t.type === 'income' && monthKey(t.date) === k).reduce((s, t) => s + num(t.amount), 0)
    const expense = allTx.filter((t) => t.type === 'expense' && monthKey(t.date) === k).reduce((s, t) => s + num(t.amount), 0)
    const monthInv = allInvoices.filter((iv) => iv.status !== 'draft' && monthKey(iv.issueDate) === k)
    const kdvCollected = monthInv.reduce((s, iv) => s + num(iv.kdvAmount), 0)
    const stopajWithheld = monthInv.reduce((s, iv) => s + num(iv.stopajAmount), 0)
    const t = taxSummary({ income, expense, kdvCollected })
    months.push({ key: k, label: monthKeyToLabel(k), income, expense, stopajWithheld, ...t })
  }

  const current = months[months.length - 1]
  return { months, current }
}

// ─── Yıllık analiz ───────────────────────────────────────────────────────────
export async function getYearAnalytics(year: number) {
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

  // 12 aylık seri + kümülatif net
  const months = Array.from({ length: 12 }, (_, m) => {
    const k = `${year}-${String(m + 1).padStart(2, '0')}`
    const income = txs.filter((t) => t.type === 'income' && t.date.startsWith(k)).reduce((s, t) => s + num(t.amount), 0)
    const expense = txs.filter((t) => t.type === 'expense' && t.date.startsWith(k)).reduce((s, t) => s + num(t.amount), 0)
    const kdv = invs.filter((i) => i.status !== 'draft' && i.issueDate.startsWith(k)).reduce((s, i) => s + num(i.kdvAmount), 0)
    const tax = taxSummary({ income, expense, kdvCollected: kdv })
    return { key: k, label: monthKeyToLabel(k), income, expense, net: income - expense, kdv, incomeTax: tax.incomeTax, totalDue: tax.totalDue }
  })
  let running = 0
  const cumulative = months.map((m) => ({ label: m.label, value: (running += m.net) }))

  const totalIncome = months.reduce((s, m) => s + m.income, 0)
  const totalExpense = months.reduce((s, m) => s + m.expense, 0)
  const totalKdv = months.reduce((s, m) => s + m.kdv, 0)
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

// ─── Bekleme listesi ─────────────────────────────────────────────────────────
export async function listWaitlist() {
  const rows = await db.select().from(waitlist).orderBy(desc(waitlist.priority), desc(waitlist.createdAt))
  return rows.map((r) => ({ ...r, createdAt: String(r.createdAt) }))
}

/** İşletme/makbuz kimliği — varsayılanların üzerine settings'teki JSON'u uygular */
export async function getBusinessInfo(): Promise<BusinessInfo> {
  const [row] = await db.select().from(settings).where(eq(settings.key, 'business'))
  if (!row?.value) return BUSINESS
  try {
    const saved = JSON.parse(row.value) as Partial<BusinessInfo>
    return { ...BUSINESS, ...saved }
  } catch {
    return BUSINESS
  }
}
