import { config } from 'dotenv'
import { requireDatabaseUrl } from './db-env'
import { sql } from 'drizzle-orm'
import { db } from '../lib/db'

config({ path: '.env.local' })
requireDatabaseUrl('npm run db:check')

/**
 * Şema doğrulaması — `db:push` sonrası "gerçekten oldu mu" kontrolü.
 *
 * Push sessizce yarım kalabilir (bağlantı, izin, çakışan tip). Bu betik
 * beklenen kolonların VARLIĞINI ve tiplerini okur, ayrıca kaç satırın
 * indirilecek KDV taşıdığını söyler.
 */
const EXPECTED: { table: string; column: string; type: string }[] = [
  { table: 'transactions', column: 'kdv_rate', type: 'integer' },
  { table: 'transactions', column: 'kdv_amount', type: 'numeric' },
]

async function main() {
  const rows = (await db.execute(sql`
    select table_name, column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
  `)) as unknown as { rows: { table_name: string; column_name: string; data_type: string }[] }

  const have = new Map(
    (rows.rows ?? []).map((r) => [`${r.table_name}.${r.column_name}`, r.data_type]),
  )

  let ok = true
  for (const e of EXPECTED) {
    const actual = have.get(`${e.table}.${e.column}`)
    if (!actual) {
      console.error(`✗ EKSİK  ${e.table}.${e.column} — db:push çalıştırılmamış olabilir`)
      ok = false
    } else if (!actual.startsWith(e.type)) {
      console.error(`✗ TİP    ${e.table}.${e.column} → beklenen ${e.type}, bulunan ${actual}`)
      ok = false
    } else {
      console.log(`✓ ${e.table}.${e.column} (${actual})`)
    }
  }

  if (!ok) process.exit(1)

  const counts = (await db.execute(sql`
    select
      count(*)::int as total,
      count(*) filter (where kdv_amount is not null)::int as with_kdv,
      count(*) filter (where type = 'expense' and scope = 'business')::int as business_expense
    from transactions
  `)) as unknown as { rows: { total: number; with_kdv: number; business_expense: number }[] }

  const c = counts.rows?.[0]
  if (c) {
    console.log(
      `\n  ${c.total} işlem · ${c.business_expense} işletme gideri · ${c.with_kdv} tanesinde indirilecek KDV var`,
    )
    if (c.business_expense > 0 && c.with_kdv === 0) {
      console.log('  ↳ Mevcut giderlerin hiçbirinde KDV oranı yok; beyanda indirim yapmazlar.')
      console.log('    Gelir & Gider sayfasından yeniden girerek ya da elle oran yazarak doldurabilirsin.')
    }
  }
  console.log('\n✓ Şema beklenen hâlde.')
}

main().catch((e) => {
  console.error('✗ Kontrol başarısız:', e)
  process.exit(1)
})
