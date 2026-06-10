'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select } from '@/components/ui/Field'
import { createSession } from '@/app/actions/notes'
import { SESSION_STATUSES, SESSION_STATUS_LABEL, type SessionStatus } from '@/lib/constants'

export function NewSessionDialog({
  clientId,
  defaultFee = 0,
  clients = [],
}: {
  /** Sabit danışan (danışan detayından açılırsa) */
  clientId?: string
  defaultFee?: number
  /** clientId yoksa seçim listesi (dashboard'dan hızlı seans eklemek için) */
  clients?: { id: string; name: string; sessionFee: number }[]
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fee, setFee] = useState<number>(defaultFee)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const targetClientId = clientId ?? String(fd.get('clientId') || '')
    start(async () => {
      const res = await createSession({
        clientId: targetClientId,
        date: String(fd.get('date')),
        durationMin: Number(fd.get('durationMin') || 50),
        fee: Number(fd.get('fee') || 0),
        status: fd.get('status') as SessionStatus,
        note: String(fd.get('note') || ''),
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      router.refresh()
    })
  }

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
      >
        <CalendarPlus className="h-3.5 w-3.5" /> Seans ekle
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni seans" description="Seansı planla veya geçmiş seans ekle">
        <form onSubmit={onSubmit} className="space-y-4">
          {!clientId && (
            <Field label="Danışan">
              <Select
                name="clientId"
                required
                defaultValue=""
                onChange={(e) => {
                  const c = clients.find((x) => x.id === e.target.value)
                  if (c) setFee(c.sessionFee) // danışanın seans ücretini otomatik getir
                }}
              >
                <option value="" disabled>Seçin…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Tarih & saat">
            <Input name="date" type="datetime-local" required defaultValue={nowLocal} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Süre (dk)">
              <Input name="durationMin" type="number" min="0" defaultValue={50} />
            </Field>
            <Field label="Ücret (₺)">
              <Input name="fee" type="number" step="0.01" min="0" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Durum">
            <Select name="status" defaultValue="scheduled">
              {SESSION_STATUSES.map((s) => (
                <option key={s} value={s}>{SESSION_STATUS_LABEL[s]}</option>
              ))}
            </Select>
          </Field>

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="Seans notu…" />
          </Field>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <button type="submit" disabled={pending} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60">
              {pending ? 'Kaydediliyor…' : 'Seansı kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
