import { config } from 'dotenv'
import { requireDatabaseUrl } from './db-env'
import { writeFile } from 'node:fs/promises'
import { sql } from 'drizzle-orm'
import { db } from '../lib/db'

config({ path: '.env.local' })
requireDatabaseUrl('npm run db:dump')

/**
 * Tek dosyalık ham yedek — şema değişikliği ÖNCESİ güvenlik ağı.
 *
 * HAM SQL kullanır (`select *`), Drizzle tablo nesneleri DEĞİL: migration'dan
 * önce çalıştığı için şema dosyası veritabanının İLERİSİNDE olabilir ve
 * Drizzle henüz var olmayan kolonu seçmeye kalkıp patlar.
 */
const TABLES = [
  'clients', 'sessions', 'client_notes', 'transactions', 'invoices', 'payments',
  'session_packages', 'client_scores', 'client_documents', 'client_goals',
  'waitlist', 'settings',
] as const

async function main() {
  const out =
    process.argv[2] ||
    `derinay-dump-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.json`

  const data: Record<string, unknown> = { exportedAt: new Date().toISOString() }
  const counts: string[] = []

  for (const t of TABLES) {
    const res = (await db.execute(
      sql.raw(`select * from "${t}"`),
    )) as unknown as { rows: unknown[] }
    const rows = res.rows ?? []
    data[t] = rows
    counts.push(`${t}:${rows.length}`)
  }

  await writeFile(out, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✓ ${out}\n  ${counts.join(' · ')}`)
}

main().catch((e) => {
  console.error('✗ Yedek alınamadı:', e instanceof Error ? e.message : e)
  process.exit(1)
})
