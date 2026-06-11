'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'
import { BUSINESS, type BusinessInfo } from '@/lib/constants'

/** Vergi oranlarını kaydet (settings 'tax' anahtarı) — tüm hesaplamalar bunu okur */
export async function saveTaxSettings(input: { kdvRate: number; stopajRate: number; incomeTaxRate: number }) {
  const rates = [input.kdvRate, input.stopajRate, input.incomeTaxRate]
  if (rates.some((r) => !Number.isFinite(r) || r < 0 || r > 60)) {
    return { ok: false, error: 'Oranlar 0–60 arasında olmalı' }
  }

  const value = JSON.stringify({
    kdvRate: Math.round(input.kdvRate),
    stopajRate: Math.round(input.stopajRate),
    incomeTaxRate: Math.round(input.incomeTaxRate),
  })
  await db
    .insert(settings)
    .values({ key: 'tax', value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })

  // Vergi oranı her hesabı etkiler — geniş tazeleme
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/taxes')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/analytics')
  revalidatePath('/dashboard/settings')
  return { ok: true }
}

/** Aylık gelir hedefini kaydet (0 = kapalı) — dashboard ilerleme bandı okur */
export async function saveIncomeGoal(value: number) {
  if (!Number.isFinite(value) || value < 0) return { ok: false, error: 'Geçersiz tutar' }
  const v = String(Math.round(value))
  await db
    .insert(settings)
    .values({ key: 'income_goal', value: v, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: v, updatedAt: new Date() } })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  return { ok: true }
}

/** İşletme/makbuz kimliğini kaydet (settings tablosunda 'business' JSON anahtarı) */
export async function saveBusinessInfo(input: Partial<BusinessInfo>) {
  if (!input.name?.trim()) return { ok: false, error: 'İşletme adı boş olamaz' }
  if (!input.owner?.trim()) return { ok: false, error: 'Ad soyad boş olamaz' }

  // Yalnızca bilinen alanları al — fazlalığı temizle
  const merged: BusinessInfo = {
    ...BUSINESS,
    ...Object.fromEntries(
      (Object.keys(BUSINESS) as (keyof BusinessInfo)[]).map((k) => [k, (input[k] ?? BUSINESS[k]).toString().trim()]),
    ),
  } as BusinessInfo

  const value = JSON.stringify(merged)
  await db
    .insert(settings)
    .values({ key: 'business', value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/invoices')
  revalidatePath('/dashboard/taxes')
  return { ok: true }
}

/** Hatırlatma mesajı şablonunu kaydet (Neon settings tablosu — upsert) */
export async function saveReminderTemplate(value: string) {
  const v = value.trim()
  if (!v) return { ok: false, error: 'Şablon boş olamaz' }
  if (!v.includes('{tarih}')) return { ok: false, error: 'Şablonda {tarih} yer tutucusu bulunmalı' }

  await db
    .insert(settings)
    .values({ key: 'reminder_template', value: v, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: v, updatedAt: new Date() } })

  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/clients')
  return { ok: true }
}
