import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// @neondatabase/serverless — Vercel serverless için (mistakes.md #5)
type DB = NeonHttpDatabase<typeof schema>

// Bağlantı tembel kurulur — neon() yalnızca ilk sorguda çağrılır.
// Böylece DATABASE_URL olmadan build/import sırasında patlamaz (force-dynamic ile).
let _db: DB | null = null
function getDb(): DB {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ayarlı değil — .env.local dosyasını doldurun.')
  _db = drizzle(neon(url), { schema })
  return _db
}

export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb()
    const value = Reflect.get(real, prop, real)
    return typeof value === 'function' ? value.bind(real) : value
  },
})
