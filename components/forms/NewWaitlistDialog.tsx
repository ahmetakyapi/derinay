'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { addWaitlist } from '@/app/actions/waitlist'

export function NewWaitlistDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    start(async () => {
      const res = await addWaitlist({
        name: String(fd.get('name')),
        phone: String(fd.get('phone') || ''),
        email: String(fd.get('email') || ''),
        source: String(fd.get('source') || ''),
        priority: fd.get('priority') as 'normal' | 'high',
        note: String(fd.get('note') || ''),
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      form.reset()
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
        <UserPlus className="h-4 w-4" /> Başvuru Ekle
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni Başvuru" description="Bekleme listesine danışan adayı ekle">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Ad Soyad">
            <Input name="name" required placeholder="Ayşe Yılmaz" autoFocus />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Telefon"><Input name="phone" placeholder="05xx…" /></Field>
            <Field label="E-posta"><Input name="email" type="email" placeholder="ornek@mail.com" /></Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Kaynak">
              <Input name="source" placeholder="Instagram, tavsiye…" list="wl-source" autoComplete="off" />
              <datalist id="wl-source">
                {['Instagram', 'Tavsiye', 'Google', 'Web sitesi', 'Telefon'].map((s) => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Öncelik">
              <Select name="priority" defaultValue="normal">
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
              </Select>
            </Field>
          </div>

          <Field label="Not (opsiyonel)">
            <Textarea name="note" rows={2} placeholder="Talep, uygun saatler, kısa bilgi…" />
          </Field>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending} busyLabel="Ekleniyor…">Listeye Ekle</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
