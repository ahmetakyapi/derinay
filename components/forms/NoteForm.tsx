'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2 } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createNote } from '@/app/actions/notes'
import {
  NOTE_KINDS,
  NOTE_KIND_LABEL,
  MOODS,
  MOOD_LABEL,
  MOOD_BG,
  type NoteKind,
  type Mood,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

// Yapılandırılmış not şablonları — piyasadaki EHR'lerin (SOAP vb.) hafif hâli
const NOTE_TEMPLATES: { label: string; body: string }[] = [
  {
    label: 'SOAP',
    body: 'S — Öznel (danışanın aktardığı):\n\nO — Gözlem:\n\nA — Değerlendirme:\n\nP — Plan:\n',
  },
  {
    label: 'İlk Görüşme',
    body: 'Başvuru nedeni:\n\nÖykü / arka plan:\n\nGözlem:\n\nHedefler:\n\nPlan:\n',
  },
  {
    label: 'BDT',
    body: 'Gündem:\n\nOtomatik düşünce / yeniden yapılandırma:\n\nBeceri / teknik çalışması:\n\nEv ödevi:\n',
  },
]

/**
 * Seans Defteri giriş formu — not türü, duygu durumu, başlık ve gövde.
 * Şablon çipleri gövdeyi yapılandırılmış iskeletle doldurur.
 */
export function NoteForm({
  clientId,
  compact = false,
}: {
  clientId: string
  compact?: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [kind, setKind] = useState<NoteKind>('session')
  const [mood, setMood] = useState<Mood | null>(null)
  const [body, setBody] = useState('')
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await createNote({
        clientId,
        title: String(fd.get('title') || ''),
        body,
        kind,
        mood,
        goalId: null,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      formRef.current?.reset()
      setBody('')
      setMood(null)
      setKind('session')
      router.refresh()
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className={cn('space-y-5', compact && 'space-y-4')}>
      <div>
        <p className="mb-2 text-sm font-bold tracking-[0.01em] text-slate-700 dark:text-slate-200">Kayıt Türü</p>
        <div className="flex flex-wrap gap-1.5">
          {NOTE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-full border px-3.5 py-2 text-sm font-semibold transition-all',
                kind === k
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 shadow-sm dark:text-indigo-300'
                  : 'border-slate-500/20 bg-white/40 text-slate-500 hover:border-slate-500/40 hover:text-slate-700 dark:bg-white/[0.02] dark:hover:text-slate-300',
              )}
            >
              {NOTE_KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Input name="title" placeholder="Başlık (opsiyonel)" className="bg-[rgba(var(--paper),0.9)]" />
        <Textarea
          name="body"
          rows={compact ? (body.includes('\n') ? 9 : 7) : body.includes('\n') ? 12 : 10}
          required
          placeholder="Bugünün notu…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cn(
            'bg-[rgba(var(--paper),0.92)] text-[15px] leading-7',
            compact ? 'min-h-[240px]' : 'min-h-[320px]',
          )}
        />
      </div>

      <div className="space-y-3 border-t border-slate-500/10 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Şablon:</span>
          {NOTE_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                if (body.trim()) return setPendingTemplate(t.body)
                setBody(t.body)
              }}
              className="rounded-full border border-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('rounded-2xl border border-slate-500/12 bg-[rgba(var(--paper),0.52)] px-4 py-3', compact && 'px-3.5 py-2.5')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Seans Duygusu:</span>
          <div className="flex items-center gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? null : m)}
                title={MOOD_LABEL[m]}
                aria-label={MOOD_LABEL[m]}
                className={cn(
                  'h-7 w-7 rounded-full transition-all',
                  MOOD_BG[m],
                  mood === m
                    ? 'scale-110 ring-2 ring-slate-900/50 ring-offset-2 ring-offset-[var(--bg)] dark:ring-white/70'
                    : 'opacity-50 hover:scale-105 hover:opacity-90',
                )}
              />
            ))}
          </div>
          {mood && (
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {MOOD_LABEL[mood]}
            </span>
          )}
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

      <div className={cn('flex justify-end pt-1', compact && 'pt-0')}>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={cn(
            'inline-flex min-w-[148px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-[rgb(var(--pine))] disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
            compact && 'min-w-[132px] rounded-xl px-4 py-2.5 text-[13px]',
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Feather className="h-4 w-4" />}
          {pending ? 'Ekleniyor…' : 'Not Ekle'}
        </button>
      </div>

      <ConfirmDialog
        open={pendingTemplate !== null}
        onClose={() => setPendingTemplate(null)}
        onConfirm={() => {
          if (pendingTemplate !== null) setBody(pendingTemplate)
        }}
        title="Şablon uygulansın mı?"
        description="Şu an yazdığın not metni şablonla değiştirilecek."
        confirmLabel="Değiştir"
        tone="default"
      />
    </form>
  )
}
