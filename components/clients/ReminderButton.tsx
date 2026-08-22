'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, MessageCircle, Save, Send } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Field'
import { saveReminderTemplate } from '@/app/actions/settings'
import { cn } from '@/lib/utils'

/** "05xx xxx xx xx" → "905xxxxxxxxx" (wa.me formatı) */
function waPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('0')) return `9${digits}`
  return `90${digits}`
}

/** Şablondaki yer tutucuları doldur: {ad}, {tarih}, {terapist} */
function resolve(template: string, clientName: string, date: Date, therapist: string): string {
  const firstName = clientName.trim().split(/\s+/)[0]
  const when = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return template
    .replaceAll('{ad}', firstName)
    .replaceAll('{tarih}', when)
    .replaceAll('{terapist}', therapist)
}

/**
 * Seans hatırlatma — şablon Neon'da tutulur (settings tablosu), buradan
 * düzenlenip kaydedilebilir; mesaj kopyalanır veya WhatsApp'ta açılır.
 */
export function ReminderButton({
  clientName,
  phone,
  date,
  template,
  therapist,
  className,
}: {
  clientName: string
  phone: string | null
  date: string | Date
  template: string
  /** `{terapist}` yerine yazılacak ad — Ayarlar → İşletme Kimliği'nden gelir */
  therapist: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(template)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  const message = resolve(draft, clientName, new Date(date), therapist)
  const dirty = draft !== template

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Mesajı kopyala:', message)
    }
  }

  function saveTemplate() {
    setError(null)
    start(async () => {
      const res = await saveReminderTemplate(draft)
      if (!res.ok) return setError(res.error ?? 'Kaydedilemedi')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(template)
          setOpen(true)
        }}
        aria-label="Seans hatırlatması gönder"
        title="Seans hatırlatması gönder"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
          className,
        )}
      >
        <Send className="h-3.5 w-3.5" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Seans Hatırlatması"
        description={
          <>
            <span className="sensitive">{clientName}</span> · mesajı düzenleyebilir, şablon olarak
            kaydedebilirsin
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reminder-template" className="field-label">
              Mesaj şablonu{' '}
              <span className="font-normal text-slate-400">
                — {'{ad}'}, {'{tarih}'}, {'{terapist}'} otomatik dolar
              </span>
            </label>
            <Textarea id="reminder-template" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
            {dirty && (
              <button
                type="button"
                onClick={saveTemplate}
                disabled={pending}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-500/25 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 disabled:opacity-60 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                {saved ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
                {saved ? 'Şablon kaydedildi' : pending ? 'Kaydediliyor…' : 'Şablon Olarak Kaydet'}
              </button>
            )}
            {error && <p role="alert" className="mt-1.5 text-xs text-rose-500">{error}</p>}
          </div>

          {/* Önizleme */}
          <div className="note-paper rounded-xl p-3.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Önizleme</p>
            {/* Mesaj danışanın adını içerir */}
            <p className="sensitive whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{message}</p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={copy}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                copied
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-500/25 text-slate-600 hover:border-indigo-500/50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300',
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
            {phone && (
              <a
                href={`https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp&apos;ta Aç
              </a>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
