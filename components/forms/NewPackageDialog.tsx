'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PackagePlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { createPackage } from '@/app/actions/packages'

export function NewPackageDialog({
  clientId,
  defaultPrice = 0,
  label = 'Paket',
}: {
  clientId: string
  /** Danışanın seans ücreti × adet için öneri (boş bırakılır, kullanıcı girer) */
  defaultPrice?: number
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
      const res = await createPackage({
        clientId,
        totalSessions: Number(fd.get('totalSessions')),
        pricePaid: Number(fd.get('pricePaid') || 0),
        purchaseDate: String(fd.get('purchaseDate') || ''),
        note: String(fd.get('note') || ''),
        recordIncome: fd.get('recordIncome') === 'on',
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
      >
        <PackagePlus className="h-3.5 w-3.5" /> {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Seans Paketi" description="Ön ödemeli paket — kullanım tamamlanan seanslardan sayılır">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Seans Sayısı">
              <Input name="totalSessions" type="number" min="1" step="1" required placeholder="10" autoFocus />
            </Field>
            <Field label="Ödenen Tutar (₺)">
              <Input name="pricePaid" type="number" step="0.01" min="0" placeholder="0,00" defaultValue={defaultPrice || ''} />
            </Field>
          </div>

          <Field label="Satın Alma Tarihi">
            <Input name="purchaseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>

          <Field label="Not (opsiyonel)">
            <Textarea name="note" rows={2} placeholder="örn. 10+1 kampanya, taksitli…" />
          </Field>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-500/15 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:border-indigo-500/30 dark:text-slate-300">
            <input type="checkbox" name="recordIncome" defaultChecked className="h-4 w-4 rounded accent-indigo-600" />
            <span>
              <span className="font-semibold">Tutarı gelir olarak da kaydet</span>
              <span className="block text-xs text-slate-400">finans & vergiye yansısın (ayrıca ödeme eklemeyeceksen işaretle)</span>
            </span>
          </label>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending}>Paketi Kaydet</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
