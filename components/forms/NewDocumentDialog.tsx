'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input } from '@/components/ui/Field'
import { addDocument } from '@/app/actions/documents'

const DOC_TYPES = ['Onam formu', 'Test / Ölçek', 'Rapor', 'Görüşme notu', 'Sözleşme', 'Diğer']

export function NewDocumentDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await addDocument({
        clientId,
        name: String(fd.get('name')),
        type: String(fd.get('type') || ''),
        url: String(fd.get('url')),
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
        <Paperclip className="h-3.5 w-3.5" /> Belge Ekle
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Belge Bağlantısı" description="Dosya kendi deponda (Drive/iCloud) kalır — buraya yalnızca bağlantısını ekle">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Belge Adı">
              <Input name="name" required placeholder="Onam formu" autoFocus />
            </Field>
            <Field label="Tür">
              <Input name="type" list="doc-types" autoComplete="off" placeholder="Onam formu" />
              <datalist id="doc-types">
                {DOC_TYPES.map((t) => <option key={t} value={t} />)}
              </datalist>
            </Field>
          </div>

          <Field label="Bağlantı (URL)">
            <Input name="url" type="url" required placeholder="https://drive.google.com/…" inputMode="url" />
          </Field>

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="Kısa açıklama…" />
          </Field>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending}>Bağlantıyı Ekle</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
