'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { createTransaction } from '@/app/actions/transactions'
import { CATEGORY_BY_TYPE, KDV_RATE_OPTIONS, type TxType } from '@/lib/constants'
import { extractKdv } from '@/lib/finance'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

export function NewTransactionDialog({
  clients,
  defaultType = 'income',
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  clients: { id: string; name: string }[]
  defaultType?: TxType
  /** Kontrollü mod — dışarıdan aç/kapat (hızlı ekle menüsü) */
  open?: boolean
  onOpenChange?: (v: boolean) => void
  hideTrigger?: boolean
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => {
    onOpenChange?.(v)
    setInternalOpen(v)
  }
  const [type, setType] = useState<TxType>(defaultType)
  // İndirilecek KDV — yalnız gider tarafında sorulur. Varsayılan 0: KDV'siz ya
  // da belgesiz gider en sık durum, kullanıcı bilerek seçmeli.
  const [kdvRate, setKdvRate] = useState(0)
  const [amount, setAmount] = useState('')
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
        recurring: fd.get('recurring') === 'on',
        kdvRate: type === 'expense' ? kdvRate : null,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" /> Yeni İşlem
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni İşlem" description="Gelir veya gider kaydı ekle">
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
                      ? 'border-emerald-500/50 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                      : 'border-rose-500/50 bg-rose-500/12 text-rose-600 dark:text-rose-400'
                    : 'border-slate-500/20 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                )}
              >
                {t === 'income' ? 'Gelir' : 'Gider'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tutar (₺)">
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
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
          {/* İndirilecek KDV — gider belgesindeki KDV, beyanda hesaplanandan düşülür */}
          {type === 'expense' && (
            <div className="rounded-xl border border-slate-500/12 bg-[rgba(var(--paper),0.5)] px-3.5 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  İndirilecek KDV:
                </span>
                {KDV_RATE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={kdvRate === r}
                    onClick={() => setKdvRate(r)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums transition-colors',
                      kdvRate === r
                        ? 'border-indigo-500/50 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-500/20 text-slate-500 hover:border-slate-500/40 dark:text-slate-400',
                    )}
                  >
                    {r === 0 ? 'Yok' : `%${r}`}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                {kdvRate > 0 && Number(amount) > 0 ? (
                  <>
                    Girdiğin tutar KDV dahil sayılır — içinden{' '}
                    <span className="font-mono font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      {formatTRY(extractKdv(Number(amount), kdvRate))}
                    </span>{' '}
                    KDV ayrılır ve beyanda hesaplanan KDV&apos;den düşülür.
                  </>
                ) : (
                  'Belgesiz ya da KDV’siz gider için “Yok” bırak.'
                )}
              </p>
            </div>
          )}

            <Textarea name="description" rows={2} placeholder="Kısa not…" />
          </Field>

          {/* Sabit kalem — her ay tekrarlanır */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-500/15 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:border-indigo-500/30 dark:text-slate-300">
            <input
              type="checkbox"
              name="recurring"
              className="h-4 w-4 rounded accent-indigo-600"
            />
            <span>
              <span className="font-semibold">Her ay tekrarlanır</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">kira, abonelik gibi sabit kalemler — tek tıkla sonraki aya kopyalanır</span>
            </span>
          </label>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              İptal
            </button>
            <SubmitButton pending={pending}>Kaydet</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
