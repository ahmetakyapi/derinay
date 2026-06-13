import { config } from 'dotenv'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { db } from '../lib/db'
import {
  clients,
  sessions,
  clientNotes,
  transactions,
  invoices,
  payments,
  sessionPackages,
  clientScores,
  clientDocuments,
  clientGoals,
  waitlist,
  settings,
} from '../lib/schema'

config({ path: '.env.local' })

type Row = Record<string, unknown>

function toDate(value: unknown): Date {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function ts(rows: Row[], extra: string[] = []): Row[] {
  return rows.map((row) => {
    const out: Row = { ...row }
    for (const key of ['createdAt', 'updatedAt', ...extra]) {
      if (key in out && out[key] != null) out[key] = toDate(out[key])
    }
    return out
  })
}

function arr(data: Record<string, unknown>, key: string): Row[] {
  return Array.isArray(data[key]) ? (data[key] as Row[]) : []
}

async function main() {
  const backupPath = process.argv[2]

  if (!backupPath) {
    console.error('Kullanım: npm run db:restore -- ./yedek.json')
    process.exit(1)
  }

  const fullPath = resolve(process.cwd(), backupPath)
  const raw = await readFile(fullPath, 'utf8')

  let data: Record<string, unknown>
  try {
    data = JSON.parse(raw)
  } catch {
    console.error('✗ Dosya geçerli bir JSON değil.')
    process.exit(1)
  }

  if (!data.exportedAt || !Array.isArray(data.clients)) {
    console.error('✗ Bu dosya bir Derinay yedeği değil.')
    process.exit(1)
  }

  const rows = {
    clients: ts(arr(data, 'clients')),
    sessions: ts(arr(data, 'sessions'), ['date']),
    notes: ts(arr(data, 'notes')),
    transactions: ts(arr(data, 'transactions')),
    invoices: ts(arr(data, 'invoices')),
    payments: ts(arr(data, 'payments')),
    sessionPackages: ts(arr(data, 'sessionPackages')),
    clientScores: ts(arr(data, 'clientScores')),
    clientDocuments: ts(arr(data, 'clientDocuments')),
    clientGoals: ts(arr(data, 'clientGoals'), ['achievedAt']),
    waitlist: ts(arr(data, 'waitlist')),
    settings: ts(arr(data, 'settings')),
  }

  const statements: unknown[] = [
    db.delete(payments),
    db.delete(invoices),
    db.delete(transactions),
    db.delete(clientNotes),
    db.delete(sessions),
    db.delete(sessionPackages),
    db.delete(clientScores),
    db.delete(clientDocuments),
    db.delete(clientGoals),
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
  if (rows.clientGoals.length) statements.push(db.insert(clientGoals).values(rows.clientGoals as never))
  if (rows.waitlist.length) statements.push(db.insert(waitlist).values(rows.waitlist as never))
  if (rows.settings.length) statements.push(db.insert(settings).values(rows.settings as never))

  try {
    await db.batch(statements as never)
  } catch (error) {
    console.error('✗ Geri yükleme başarısız; veritabanı değiştirilmedi.')
    console.error(error)
    process.exit(1)
  }

  console.log('✓ Yedek geri yüklendi.')
  console.log(
    JSON.stringify(
      {
        exportedAt: String(data.exportedAt),
        clients: rows.clients.length,
        sessions: rows.sessions.length,
        notes: rows.notes.length,
        transactions: rows.transactions.length,
        invoices: rows.invoices.length,
        payments: rows.payments.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
