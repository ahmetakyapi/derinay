'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select } from '@/components/ui/Field'
import { createPayment } from '@/app/actions/payments'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL, type PaymentMethod } from '@/lib/constants'

export function NewPaymentDialog({
  clients,
  fixedClientId,
  label = 'Ödeme ekle',
}: {
  clients: { id: string; name: string }[]
  fixedClientId?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createPayment({
        clientId: fixedClientId ?? String(fd.get('clientId')),
        amount: Number(fd.get('amount')),
        date: String(fd.get('date') || ''),
        method: fd.get('method') as PaymentMethod,
        note: String(fd.get('note') || ''),
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" /> {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni ödeme" description="Danışandan alınan tahsilatı kaydet">
        <form onSubmit={onSubmit} className="space-y-4">
          {!fixedClientId && (
            <Field label="Danışan">
              <Select name="clientId" required defaultValue="">
                <option value="" disabled>Seçin…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tutar (₺)">
              <Input name="amount" type="number" step="0.01" min="0" required placeholder="0,00" />
            </Field>
            <Field label="Tarih">
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          <Field label="Yöntem">
            <Select name="method" defaultValue="transfer">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</option>
              ))}
            </Select>
          </Field>

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="örn. Mart ayı 2 seans" />
          </Field>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-300">
              İptal
            </button>
            <button type="submit" disabled={pending} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60">
              {pending ? 'Kaydediliyor…' : 'Ödemeyi kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
