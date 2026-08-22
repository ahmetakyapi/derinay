'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus, Download, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Field, Input, Select } from '@/components/ui/Field'
import { createInvoice } from '@/app/actions/invoices'
import { calcMakbuz } from '@/lib/finance'
import { formatTRY } from '@/lib/format'
import { INVOICE_STATUSES, INVOICE_STATUS_LABEL, TAX, type InvoiceStatus } from '@/lib/constants'

export function NewInvoiceDialog({
  clients,
  fixedClientId,
  label = 'Makbuz Kes',
  defaultKdvRate = TAX.KDV_RATE,
  defaultStopajRate = TAX.STOPAJ_RATE,
}: {
  clients: { id: string; name: string }[]
  fixedClientId?: string
  label?: string
  /** Ayarlar'daki vergi oranları — makbuzun başlangıç değerleri */
  defaultKdvRate?: number
  defaultStopajRate?: number
}) {
  const [open, setOpen] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [subtotal, setSubtotal] = useState(0)
  const [kdvRate, setKdvRate] = useState<number>(defaultKdvRate)
  const [stopajRate, setStopajRate] = useState<number>(defaultStopajRate)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  const { kdvAmount, stopajAmount, netUcret, total } = calcMakbuz(subtotal || 0, kdvRate, stopajRate)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createInvoice({
        clientId: fixedClientId ?? ((fd.get('clientId') as string) || null),
        subtotal: Number(fd.get('subtotal')),
        kdvRate,
        stopajRate,
        issueDate: String(fd.get('issueDate') || ''),
        dueDate: String(fd.get('dueDate') || ''),
        status: fd.get('status') as InvoiceStatus,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      setSubtotal(0)
      // Önce önizleme — isterse oradan PDF indirir
      if (res.id) setPreviewId(res.id)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
      >
        <FilePlus className="h-4 w-4" /> {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Yeni Makbuz" description="Serbest meslek makbuzu — KDV ve stopaj otomatik hesaplanır">
        <form onSubmit={onSubmit} className="space-y-4">
          {!fixedClientId && (
            <Field label="Danışan">
              <Select name="clientId" defaultValue="">
                <option value="">— (genel)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Brüt Ücret (₺)">
            <Input
              name="subtotal"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              onChange={(e) => setSubtotal(Number(e.target.value))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="KDV Oranı (%)">
              <Select value={kdvRate} onChange={(e) => setKdvRate(Number(e.target.value))}>
                {[...new Set([0, 1, 10, 20, defaultKdvRate])].sort((a, b) => a - b).map((r) => (
                  <option key={r} value={r}>%{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Stopaj / Tevkifat (%)">
              <Select value={stopajRate} onChange={(e) => setStopajRate(Number(e.target.value))}>
                {[...new Set([0, 20, defaultStopajRate])].sort((a, b) => a - b).map((r) => (
                  <option key={r} value={r}>{r === 0 ? 'Yok' : `%${r}`}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Düzenleme Tarihi">
              <Input name="issueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Vade Tarihi">
              <Input name="dueDate" type="date" />
            </Field>
          </div>

          <Field label="Statü">
            <Select name="status" defaultValue="sent">
              {INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>
              ))}
            </Select>
          </Field>

          {/* Makbuz hesap özeti */}
          <div className="rounded-xl border border-slate-500/15 bg-slate-500/5 p-3 text-sm">
            <div className="flex justify-between py-0.5 text-slate-500 dark:text-slate-400">
              <span>Brüt ücret</span><span className="font-mono tabular-nums">{formatTRY(subtotal || 0)}</span>
            </div>
            {stopajRate > 0 && (
              <div className="flex justify-between py-0.5 text-rose-600 dark:text-rose-400">
                <span>Gelir vergisi stopajı (%{stopajRate})</span><span className="font-mono tabular-nums">−{formatTRY(stopajAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5 text-slate-500 dark:text-slate-400">
              <span>Net ücret</span><span className="font-mono tabular-nums">{formatTRY(netUcret)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-500 dark:text-slate-400">
              <span>Hesaplanan KDV (%{kdvRate})</span><span className="font-mono tabular-nums">+{formatTRY(kdvAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-500/15 pt-2 font-bold text-slate-900 dark:text-white">
              <span>Tahsil edilecek</span><span className="font-mono tabular-nums">{formatTRY(total)}</span>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <SubmitButton pending={pending}>Makbuzu Oluştur</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Fatura önizleme — oluşturduktan hemen sonra */}
      <Modal
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        title="Makbuz Hazır"
        description="Önizle — istersen PDF olarak kaydet"
        size="2xl"
      >
        {previewId && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-500/15 bg-white">
              <iframe
                src={`/invoices/${previewId}/print`}
                title="Makbuz Önizleme"
                className="h-[74vh] w-full"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <Check className="h-4 w-4" /> Tamam
              </button>
              <a
                href={`/invoices/${previewId}/print?auto=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" /> PDF Olarak Kaydet
              </a>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
