'use server'

import { db } from '@/lib/db'
import { settings } from '@/lib/schema'
import { revalidateSettings } from '@/lib/revalidate'
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
  revalidateSettings()
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
  revalidateSettings()
  return { ok: true }
}

/** İşletme/makbuz kimliğini kaydet (settings tablosunda 'business' JSON anahtarı) */
export async function saveBusinessInfo(input: Partial<BusinessInfo>) {
  // Ad soyad ZORUNLU DEĞİL: kimlik artık tamamen isteğe bağlı. Boş bırakılırsa
  // belgelerde `[Ad Soyad]` yer tutucusu görünür ve panelde "Adını ekle" yazar.
  // (Zorunlu tutulunca kullanıcı kayıtlı bir adı SİLEMİYORDU — yalnız
  // değiştirebiliyordu; bu, "kişi adı tutma" kararıyla çelişiyordu.)
  if (!input.name?.trim()) return { ok: false, error: 'İşletme adı boş olamaz' }

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

  // Ad/unvan kenar çubuğundaki sahip kartında ve karşılama başlığında da görünür
  // → layout dahil tazelenmeli (revalidateSettings bunu yapar).
  revalidateSettings()
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

  revalidateSettings()
  return { ok: true }
}
