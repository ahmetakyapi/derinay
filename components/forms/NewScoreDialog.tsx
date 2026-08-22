'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input } from '@/components/ui/Field'
import { addScore } from '@/app/actions/scores'

const SCALE_SUGGESTIONS = ['İyilik hali', 'Anksiyete', 'Depresyon', 'Uyku kalitesi', 'Stres', 'Motivasyon']

export function NewScoreDialog({ clientId, lastLabel }: { clientId: string; lastLabel?: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await addScore({
        clientId,
        label: String(fd.get('label')),
        value: Number(fd.get('value')),
        scaleMax: Number(fd.get('scaleMax')) || null,
        date: String(fd.get('date') || ''),
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
      >
        <Plus className="h-3.5 w-3.5" /> Ölçüm Ekle
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="İlerleme Ölçümü" description="Bir ölçek puanı kaydet — zaman içindeki değişimi izle">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Ölçek / Ölçüm">
            <Input name="label" required list="score-labels" autoComplete="off" defaultValue={lastLabel ?? ''} placeholder="İyilik hali" />
            <datalist id="score-labels">
              {SCALE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Puan">
              <Input name="value" type="number" step="0.5" required placeholder="7" autoFocus />
            </Field>
            <Field label="Üst Sınır (opsiyonel)">
              <Input name="scaleMax" type="number" step="1" min="1" placeholder="10" />
            </Field>
          </div>

          <Field label="Tarih">
            <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </Field>

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="Kısa bağlam…" />
          </Field>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending}>Ölçümü Kaydet</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
