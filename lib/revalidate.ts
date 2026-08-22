import { revalidatePath } from 'next/cache'

/**
 * Merkezi tazeleme yardımcıları — bir mutasyon hangi hesapları/grafikleri
 * etkiliyorsa ilgili sayfa grubu komple tazelenir. Yeni sayfa eklerken
 * ilgili gruba eklemeyi unutma.
 */

/** Finansal hesapları besleyen tüm sayfalar (KPI, grafikler, vergi, analiz) */
export function revalidateFinance() {
  for (const p of [
    '/dashboard',
    '/dashboard/finances',
    '/dashboard/taxes',
    '/dashboard/analytics',
    '/dashboard/invoices',
    '/dashboard/payments',
  ])
    revalidatePath(p)
}

/** Seans verisine bağlı sayfalar (takvimler, devam istatistiği, paket kullanımı) */
export function revalidateSessions(clientId?: string | null) {
  // Danışan kartlarındaki "sonraki seans" da seans verisinden türer → liste dahil
  for (const p of ['/dashboard', '/dashboard/agenda', '/dashboard/analytics', '/dashboard/clients'])
    revalidatePath(p)
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`)
}

/** Danışan kimliği değişti — liste + tüm detay sayfaları + ⌘K listesi (layout) */
export function revalidateClients() {
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clients', 'layout')
  revalidatePath('/dashboard', 'layout') // komut paleti danışan listesi layout'ta çekiliyor
}

/**
 * Ayar değişti — kimlik/oran/şablon panelin HER yerinde görünür:
 * kenar çubuğundaki sahip kartı ve ⌘K listesi layout seviyesinde çekilir,
 * bu yüzden layout tazelemesi ŞART (yoksa isim eski kalır).
 */
export function revalidateSettings() {
  for (const p of [
    '/dashboard',
    '/dashboard/settings',
    '/dashboard/agenda',
    '/dashboard/clients',
    '/dashboard/invoices',
    '/dashboard/taxes',
    '/dashboard/analytics',
  ])
    revalidatePath(p)
  revalidatePath('/dashboard', 'layout')
}
