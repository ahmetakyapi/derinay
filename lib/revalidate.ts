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
  for (const p of ['/dashboard', '/dashboard/agenda', '/dashboard/analytics']) revalidatePath(p)
  if (clientId) revalidatePath(`/dashboard/clients/${clientId}`)
}

/** Danışan kimliği değişti — liste + tüm detay sayfaları + ⌘K listesi (layout) */
export function revalidateClients() {
  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/clients', 'layout')
  revalidatePath('/dashboard', 'layout') // komut paleti danışan listesi layout'ta çekiliyor
}
