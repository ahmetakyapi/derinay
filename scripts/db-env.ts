import { config } from 'dotenv'

config({ path: '.env.local' })

/**
 * CLI betikleri için bağlantı kontrolü.
 *
 * `lib/db.ts` tembel proxy'si bağlantı yoksa fırlatıyor ama betik bunu ham bir
 * yığın izi olarak basıyordu — kullanıcı "ne yapmam gerekiyor" sorusunun
 * cevabını göremiyordu. Bu yardımcı, çalıştırmadan ÖNCE anlaşılır biçimde durur.
 */
export function requireDatabaseUrl(script: string) {
  const url = process.env.DATABASE_URL?.trim()
  if (url) return url

  console.error(`
✗ DATABASE_URL bulunamadı — ${script} çalıştırılamaz.

  1. Neon panosundan bağlantı dizesini kopyala (pooled connection string).
  2. Bu projedeki .env.local dosyasını aç.
  3. DATABASE_URL= satırının sonuna yapıştır ve kaydet.

  Dosya .gitignore kapsamındadır; commit'lenmez.
`)
  process.exit(1)
}
