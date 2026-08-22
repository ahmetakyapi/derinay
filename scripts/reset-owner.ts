import { config } from 'dotenv'
import { requireDatabaseUrl } from './db-env'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { settings } from '../lib/schema'
import { BUSINESS, type BusinessInfo } from '../lib/constants'

config({ path: '.env.local' })
requireDatabaseUrl('npm run db:reset-owner')

/**
 * Kayıtlı kişi adını (ve istenirse tüm işletme kimliğini) veritabanından siler.
 *
 * Kod tabanında hiçbir yerde kişi adı tutulmaz; ama `settings.business` JSON'u
 * geçmişte kaydedilmiş bir adı taşıyor olabilir ve panelde görünür. Bu betik
 * onu temizler.
 *
 *   npm run db:reset-owner          → yalnız "owner" alanını boşaltır
 *   npm run db:reset-owner -- --all → tüm işletme kimliğini varsayılana döndürür
 */
async function main() {
  const all = process.argv.includes('--all')
  const [row] = await db.select().from(settings).where(eq(settings.key, 'business'))

  if (!row?.value) {
    console.log('✓ Kayıtlı işletme kimliği yok — temizlenecek bir şey bulunamadı.')
    return
  }

  let saved: Partial<BusinessInfo> = {}
  try {
    saved = JSON.parse(row.value) as Partial<BusinessInfo>
  } catch {
    console.error('✗ Kayıtlı değer geçerli JSON değil; olduğu gibi bırakıldı.')
    process.exit(1)
  }

  const before = saved.owner?.trim() || '(boş)'
  const next: BusinessInfo = all ? { ...BUSINESS } : ({ ...BUSINESS, ...saved, owner: '' } as BusinessInfo)
  const value = JSON.stringify(next)

  await db
    .update(settings)
    .set({ value, updatedAt: new Date() })
    .where(eq(settings.key, 'business'))

  console.log(all ? '✓ Tüm işletme kimliği varsayılana döndürüldü.' : `✓ Kayıtlı ad silindi: "${before}" → (boş)`)
  console.log('  Panelde artık "Adını ekle" görünür; Ayarlar → İşletme Kimliği\'nden yeniden doldurabilirsin.')
}

main().catch((e) => {
  console.error('✗ Hata:', e)
  process.exit(1)
})
