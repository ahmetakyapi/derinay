import 'server-only'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from './db'
import { clients, transactions, invoices, payments, sessions, clientNotes } from './schema'
import { monthKey, monthKeyToLabel } from './format'
import { taxSummary } from './finance'
import type { ClientStatus, TxType, TxScope } from './constants'

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
}): Promise<TxRow[]> {
  const filters = []
  if (opts?.type) filters.push(eq(transactions.type, opts.type))
  if (opts?.scope) filters.push(eq(transactions.scope, opts.scope))
  if (opts?.month) {
    const [y, m] = opts.month.split('-').map(Number)
    filters.push(gte(transactions.date, iso(new Date(y, m - 1, 1))))
    filters.push(lte(transactions.date, iso(new Date(y, m, 0))))
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
export async function listClients(opts?: { status?: ClientStatus }) {
  const rows = await db
    .select()
    .from(clients)
    .where(opts?.status ? eq(clients.status, opts.status) : undefined)
    .orderBy(desc(clients.createdAt))
  return rows.map((c) => ({ ...c, sessionFee: num(c.sessionFee) }))
}

export async function getClientDetail(id: string) {
  const [client] = await db.select().from(clients).where(eq(clients.id, id))
  if (!client) return null

  const [notes, sess, pays, invs, txs] = await Promise.all([
    db.select().from(clientNotes).where(eq(clientNotes.clientId, id)).orderBy(desc(clientNotes.createdAt)),
    db.select().from(sessions).where(eq(sessions.clientId, id)).orderBy(desc(sessions.date)),
    db.select().from(payments).where(eq(payments.clientId, id)).orderBy(desc(payments.date)),
    db.select().from(invoices).where(eq(invoices.clientId, id)).orderBy(desc(invoices.issueDate)),
    db.select().from(transactions).where(eq(transactions.clientId, id)).orderBy(desc(transactions.date)),
  ])

  const totalPaid = pays.reduce((s, p) => s + num(p.amount), 0)
  const totalInvoiced = invs.reduce((s, i) => s + num(i.total), 0)
  const completedSessions = sess.filter((s) => s.status === 'completed').length

  return {
    client: { ...client, sessionFee: num(client.sessionFee) },
    notes,
    sessions: sess.map((s) => ({ ...s, fee: num(s.fee) })),
    payments: pays.map((p) => ({ ...p, amount: num(p.amount) })),
    invoices: invs.map((i) => ({ ...i, total: num(i.total), subtotal: num(i.subtotal), kdvAmount: num(i.kdvAmount) })),
    transactions: txs.map((t) => ({ ...t, amount: num(t.amount) })),
    stats: { totalPaid, totalInvoiced, completedSessions, outstanding: totalInvoiced - totalPaid },
  }
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
      total: invoices.total,
      status: invoices.status,
      clientId: invoices.clientId,
      clientName: clients.name,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.issueDate))
  return rows.map((i) => ({
    ...i,
    subtotal: num(i.subtotal),
    kdvAmount: num(i.kdvAmount),
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
      invoiceId: payments.invoiceId,
    })
    .from(payments)
    .leftJoin(clients, eq(payments.clientId, clients.id))
    .orderBy(desc(payments.date))
  return rows.map((p) => ({ ...p, amount: num(p.amount) }))
}

// Form select'leri için hafif danışan listesi
export async function clientOptions() {
  const rows = await db.select({ id: clients.id, name: clients.name }).from(clients).orderBy(clients.name)
  return rows
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
    kdvCollected: number; incomeTax: number; totalDue: number
  }[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const k = monthKey(d)
    const income = allTx.filter((t) => t.type === 'income' && monthKey(t.date) === k).reduce((s, t) => s + num(t.amount), 0)
    const expense = allTx.filter((t) => t.type === 'expense' && monthKey(t.date) === k).reduce((s, t) => s + num(t.amount), 0)
    const kdvCollected = allInvoices.filter((iv) => iv.status !== 'draft' && monthKey(iv.issueDate) === k).reduce((s, iv) => s + num(iv.kdvAmount), 0)
    const t = taxSummary({ income, expense, kdvCollected })
    months.push({ key: k, label: monthKeyToLabel(k), income, expense, ...t })
  }

  const current = months[months.length - 1]
  return { months, current }
}
