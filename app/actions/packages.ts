'use server'

import { revalidatePath } from 'next/cache'
import { revalidateFinance } from '@/lib/revalidate'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sessionPackages, transactions } from '@/lib/schema'

export async function createPackage(input: {
  clientId: string
  totalSessions: number
  pricePaid?: number
  purchaseDate?: string
  note?: string
  /** Ödenen tutarı gelir olarak da kaydet (çift sayımı önlemek için kullanıcı seçer) */
  recordIncome?: boolean
}) {
  if (!input.clientId) return { ok: false, error: 'Danışan bulunamadı' }
  if (!input.totalSessions || input.totalSessions < 1) return { ok: false, error: 'Seans sayısı geçersiz' }

  const price = input.pricePaid ?? 0
  await db.insert(sessionPackages).values({
    clientId: input.clientId,
    totalSessions: Math.round(input.totalSessions),
    pricePaid: String(price),
    purchaseDate: input.purchaseDate || undefined,
    note: input.note || null,
  })

  // İsteğe bağlı: paket ücretini işletme geliri olarak kaydet
  if (input.recordIncome && price > 0) {
    await db.insert(transactions).values({
      type: 'income',
      scope: 'business',
      amount: String(price),
      category: 'Seans paketi',
      description: `${input.totalSessions} seanslık paket`,
      date: input.purchaseDate || undefined,
      clientId: input.clientId,
    })
    // Gelir kaydı KPI, grafik, vergi ve analiz sayfalarının hepsini etkiler
    revalidateFinance()
  }

  revalidatePath(`/dashboard/clients/${input.clientId}`)
  revalidatePath('/dashboard') // hatırlatmalar (biten paket)
  return { ok: true }
}

export async function deletePackage(id: string, clientId: string) {
  await db.delete(sessionPackages).where(eq(sessionPackages.id, id))
  revalidatePath(`/dashboard/clients/${clientId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}
