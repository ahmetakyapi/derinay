'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'

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
