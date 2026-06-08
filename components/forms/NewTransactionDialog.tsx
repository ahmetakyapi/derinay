'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { createTransaction } from '@/app/actions/transactions'
import { CATEGORY_BY_TYPE, type TxType } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function NewTransactionDialog({
  clients,
  defaultType = 'income',
}: {
  clients: { id: string; name: string }[]
  defaultType?: TxType
}) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TxType>(defaultType)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createTransaction({
        type,
        amount: Number(fd.get('amount')),
        category: String(fd.get('category')),
        description: String(fd.get('description') || ''),
        date: String(fd.get('date') || ''),
        clientId: (fd.get('clientId') as string) || null,
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
        <Plus className="h-4 w-4" /> Yeni işlem
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni işlem" description="Gelir veya gider kaydı ekle">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tip seçimi */}
          <div className="grid grid-cols-2 gap-2">
            {(['income', 'expense'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all',
                  type === t
                    ? t === 'income'
                      ? 'border-emerald-500/50 bg-emerald-500/12 text-emerald-500'
                      : 'border-rose-500/50 bg-rose-500/12 text-rose-500'
                    : 'border-slate-500/20 text-slate-500 hover:text-slate-300',
                )}
              >
                {t === 'income' ? 'Gelir' : 'Gider'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tutar (₺)">
              <Input name="amount" type="number" step="0.01" min="0" required placeholder="0,00" />
            </Field>
            <Field label="Tarih">
              <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          <Field label="Kategori">
            <Input
              name="category"
              required
              list="tx-cat-list"
              placeholder="Seç veya kendi kalemini yaz…"
              autoComplete="off"
            />
            <datalist id="tx-cat-list">
              {CATEGORY_BY_TYPE[type].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Danışan (opsiyonel)">
            <Select name="clientId" defaultValue="">
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Açıklama (opsiyonel)">
            <Textarea name="description" rows={2} placeholder="Kısa not…" />
          </Field>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-300"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
