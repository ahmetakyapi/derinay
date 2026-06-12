'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarPlus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input, Select } from '@/components/ui/Field'
import { createSession } from '@/app/actions/notes'
import { SESSION_STATUSES, SESSION_STATUS_LABEL, type SessionStatus } from '@/lib/constants'

export function NewSessionDialog({
  clientId,
  defaultFee = 0,
  clients = [],
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  /** Sabit danışan (danışan detayından açılırsa) */
  clientId?: string
  defaultFee?: number
  /** clientId yoksa seçim listesi (dashboard'dan hızlı seans eklemek için) */
  clients?: { id: string; name: string; sessionFee: number }[]
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
  const [error, setError] = useState<string | null>(null)
  const [fee, setFee] = useState<number>(defaultFee)
  const [everyWeeks, setEveryWeeks] = useState(0) // 0=tek seferlik, 1=haftalık, 2=iki haftada
  const [count, setCount] = useState(8)
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
        repeat: everyWeeks > 0 ? { everyWeeks, count } : undefined,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      setEveryWeeks(0)
      router.refresh()
    })
  }

  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
        >
          <CalendarPlus className="h-3.5 w-3.5" /> Seans Ekle
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni Seans" description="Seansı planla veya geçmiş seans ekle">
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

          {/* Tekrarlayan seans — haftalık sabit slot */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tekrar">
              <Select value={everyWeeks} onChange={(e) => setEveryWeeks(Number(e.target.value))}>
                <option value={0}>Tek seferlik</option>
                <option value={1}>Her hafta</option>
                <option value={2}>İki haftada bir</option>
              </Select>
            </Field>
            {everyWeeks > 0 && (
              <Field label="Kaç seans">
                <Input
                  type="number"
                  min={2}
                  max={52}
                  value={count}
                  onChange={(e) => setCount(Math.min(Math.max(Number(e.target.value) || 2, 2), 52))}
                />
              </Field>
            )}
          </div>
          {everyWeeks > 0 && (
            <p className="-mt-1 text-xs text-slate-500 dark:text-slate-400">
              Aynı gün ve saatte <span className="font-semibold text-indigo-600 dark:text-indigo-300">{count} seans</span> oluşturulur
              ({everyWeeks === 1 ? 'haftalık' : 'iki haftada bir'}).
            </p>
          )}

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="Seans notu…" />
          </Field>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending}>{everyWeeks > 0 ? `${count} Seans Oluştur` : 'Seansı Kaydet'}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
