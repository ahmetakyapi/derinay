'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, gte, lte } from 'drizzle-orm'
import { extractKdv } from '@/lib/finance'
import { db } from '@/lib/db'
import { transactions } from '@/lib/schema'
import { revalidateFinance } from '@/lib/revalidate'
import type { TxType, TxScope } from '@/lib/constants'

export async function createTransaction(input: {
  type: TxType
  scope?: TxScope
  amount: number
  category: string
  description?: string
  date?: string
  clientId?: string | null
  recurring?: boolean
  /** İndirilecek KDV oranı — yalnız İŞLETME GİDERİNDE anlamlı, 0/boş = KDV'siz */
  kdvRate?: number | null
}) {
  const kdvRate = Number(input.kdvRate ?? 0)
  const isDeductible = input.type === 'expense' && (input.scope ?? 'business') === 'business' && kdvRate > 0

  if (!input.amount || input.amount <= 0) return { ok: false, error: 'Tutar geçersiz' }
  if (!input.category?.trim()) return { ok: false, error: 'Kategori zorunlu' }

  await db.insert(transactions).values({
    type: input.type,
    scope: input.scope ?? 'business',
    amount: String(input.amount),
    category: input.category.trim(),
    description: input.description || null,
    date: input.date || undefined,
    clientId: input.clientId || null,
    // KDV yalnız İŞLETME GİDERİNDE tutulur: gelir tarafının KDV'si makbuzda
    // (invoices.kdvAmount), kişisel harcamanın ise beyanda yeri yok.
    kdvRate: isDeductible ? kdvRate : null,
    kdvAmount: isDeductible && kdvRate ? String(extractKdv(input.amount, kdvRate)) : null,
    recurring: input.recurring ?? false,
  })

  revalidateFinance()
  revalidatePath('/dashboard/personal')
  return { ok: true }
}

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id))
  revalidateFinance()
  revalidatePath('/dashboard/personal')
  return { ok: true }
}

/**
 * Tekrarlayan (sabit) kalemleri önceki aydan hedef aya kopyala.
 * Aynı kategori+tutar zaten hedef ayda varsa atlanır (çift kopya koruması).
 */
export async function copyRecurring(targetMonth: string) {
  if (!/^\d{4}-\d{2}$/.test(targetMonth)) return { ok: false, error: 'Geçersiz ay', copied: 0 }
  const [y, m] = targetMonth.split('-').map(Number)
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const prevStart = iso(new Date(y, m - 2, 1))
  const prevEnd = iso(new Date(y, m - 1, 0))
  const curStart = iso(new Date(y, m - 1, 1))
  const curEnd = iso(new Date(y, m, 0))
  const daysInTarget = new Date(y, m, 0).getDate()

  const [recurringPrev, existingCur] = await Promise.all([
    db.select().from(transactions).where(and(
      eq(transactions.recurring, true),
      gte(transactions.date, prevStart),
      lte(transactions.date, prevEnd),
    )),
    db.select().from(transactions).where(and(
      eq(transactions.recurring, true),
      gte(transactions.date, curStart),
      lte(transactions.date, curEnd),
    )),
  ])

  const exists = new Set(existingCur.map((t) => `${t.type}|${t.category}|${t.amount}`))
  let copied = 0
  for (const t of recurringPrev) {
    if (exists.has(`${t.type}|${t.category}|${t.amount}`)) continue
    const day = Math.min(Number(t.date.split('-')[2]), daysInTarget)
    await db.insert(transactions).values({
      type: t.type,
      scope: t.scope,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: `${targetMonth}-${String(day).padStart(2, '0')}`,
      clientId: t.clientId,
      // Sabit giderin KDV'si de her ay tekrar eder — taşınmazsa kopyalanan
      // kira/abonelik kalemleri beyanda indirilecek KDV'siz görünürdü.
      kdvRate: t.kdvRate,
      kdvAmount: t.kdvAmount,
      recurring: true,
    })
    copied++
  }

  revalidateFinance()
  // Sabit kalemler personal scope'ta da olabilir — Kişisel sekmesi de tazelenmeli
  revalidatePath('/dashboard/personal')
  return { ok: true, copied }
}
