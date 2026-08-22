'use server'

import { revalidatePath } from 'next/cache'
import { desc, eq, like } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices } from '@/lib/schema'
import { revalidateFinance } from '@/lib/revalidate'
import { calcMakbuz } from '@/lib/finance'
import { TAX, type InvoiceStatus } from '@/lib/constants'

/**
 * Sıradaki makbuz numarası — DER-YYYY-NNN.
 *
 * TOPLAM SAYIYA GÖRE ÜRETME: `count()` iki yönden bozuktu —
 *  1) Bir makbuz silinince sayaç geri düşüyor ve ZATEN VAR OLAN bir numara
 *     tekrar üretiliyordu; `number` unique olduğu için insert patlıyordu.
 *  2) Sayaç kümülatif olduğu için yeni yılın ilk makbuzu 001'den değil,
 *     önceki yılların toplamından devam ediyordu.
 * Bunun yerine O YILIN en büyük sıra numarası okunur ve bir artırılır.
 */
async function nextInvoiceNumber(year: number) {
  const prefix = `DER-${year}-`
  const [latest] = await db
    .select({ number: invoices.number })
    .from(invoices)
    .where(like(invoices.number, `${prefix}%`))
    .orderBy(desc(invoices.number))
    .limit(1)

  const lastSeq = latest ? Number(latest.number.slice(prefix.length)) : 0
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

export async function createInvoice(input: {
  clientId?: string | null
  subtotal: number
  kdvRate?: number
  stopajRate?: number
  issueDate?: string
  dueDate?: string
  status?: InvoiceStatus
  note?: string
}) {
  if (!input.subtotal || input.subtotal <= 0) return { ok: false, error: 'Tutar geçersiz' }

  const rate = input.kdvRate ?? TAX.KDV_RATE
  const stopajRate = input.stopajRate ?? 0
  const { kdvAmount, stopajAmount, total } = calcMakbuz(input.subtotal, rate, stopajRate)
  // Numara makbuzun KENDİ düzenleme yılından türer; ileri/geri tarihli makbuz
  // "gelecek yıla ait numara" almasın diye issueDate esas alınır.
  const issueYear = new Date(input.issueDate || Date.now()).getFullYear()

  const values = {
    clientId: input.clientId || null,
    subtotal: String(input.subtotal),
    kdvRate: rate,
    kdvAmount: String(kdvAmount),
    stopajRate,
    stopajAmount: String(stopajAmount),
    total: String(total),
    issueDate: input.issueDate || undefined,
    dueDate: input.dueDate || null,
    status: input.status ?? 'sent',
    note: input.note || null,
  }

  // Numara üretimi ile insert arası bir yarış olabilir (aynı anda iki makbuz).
  // unique ihlalinde bir kez daha dene, sonra anlamlı hata dön.
  let number = ''
  let created: { id: string } | undefined
  for (let attempt = 0; attempt < 3 && !created; attempt++) {
    number = await nextInvoiceNumber(issueYear)
    try {
      ;[created] = await db.insert(invoices).values({ number, ...values }).returning({ id: invoices.id })
    } catch (e) {
      if (attempt === 2) {
        console.error('Makbuz numarası üretilemedi:', e)
        return { ok: false, error: 'Makbuz numarası üretilemedi, tekrar dene' }
      }
    }
  }
  if (!created) return { ok: false, error: 'Makbuz oluşturulamadı' }

  revalidateFinance()
  if (input.clientId) revalidatePath(`/dashboard/clients/${input.clientId}`)
  return { ok: true, number, id: created.id }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const [row] = await db
    .update(invoices)
    .set({ status })
    .where(eq(invoices.id, id))
    .returning({ clientId: invoices.clientId })
  revalidateFinance()
  if (row?.clientId) revalidatePath(`/dashboard/clients/${row.clientId}`)
  return { ok: true }
}

export async function deleteInvoice(id: string) {
  const [row] = await db.delete(invoices).where(eq(invoices.id, id)).returning({ clientId: invoices.clientId })
  revalidateFinance()
  if (row?.clientId) revalidatePath(`/dashboard/clients/${row.clientId}`)
  return { ok: true }
}
