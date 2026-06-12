'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Feather } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Field'
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
  goals = [],
}: {
  clientId: string
  /** Aktif tedavi hedefleri — not bir hedefe bağlanabilir */
  goals?: { id: string; title: string }[]
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [kind, setKind] = useState<NoteKind>('session')
  const [mood, setMood] = useState<Mood | null>(null)
  const [goalId, setGoalId] = useState<string | null>(null)
  const [body, setBody] = useState('')
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
        goalId,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      formRef.current?.reset()
      setBody('')
      setMood(null)
      setGoalId(null)
      setKind('session')
      router.refresh()
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      {/* Not türü */}
      <div className="flex flex-wrap gap-1.5">
        {NOTE_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              kind === k
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-500/20 text-slate-500 hover:border-slate-500/40 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {NOTE_KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <Input name="title" placeholder="Başlık (opsiyonel)" />
      <Textarea
        name="body"
        rows={body.includes('\n') ? 7 : 3}
        required
        placeholder="Bugünün notu…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      {/* Şablonlar — yapılandırılmış not iskeletleri */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Şablon:</span>
        {NOTE_TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => {
              if (body.trim() && !window.confirm('Mevcut not şablonla değiştirilsin mi?')) return
              setBody(t.body)
            }}
            className="rounded-full border border-slate-500/20 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hedefe bağla — aktif tedavi hedefleri */}
      {goals.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hedef:</span>
          {goals.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGoalId(goalId === g.id ? null : g.id)}
              className={cn(
                'max-w-[220px] truncate rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
                goalId === g.id
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-slate-500/20 text-slate-500 hover:border-amber-500/40 hover:text-amber-600 dark:text-slate-400',
              )}
            >
              🎯 {g.title}
            </button>
          ))}
        </div>
      )}

      {/* Duygu durumu — 5'li skala */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Seans duygusu:</span>
        <div className="flex items-center gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? null : m)}
              title={MOOD_LABEL[m]}
              aria-label={MOOD_LABEL[m]}
              className={cn(
                'h-6 w-6 rounded-full transition-all',
                MOOD_BG[m],
                mood === m
                  ? 'scale-110 ring-2 ring-slate-900/50 ring-offset-2 ring-offset-[var(--bg)] dark:ring-white/70'
                  : 'opacity-45 hover:scale-105 hover:opacity-90',
              )}
            />
          ))}
        </div>
        {mood && (
          <span className="font-display text-xs italic text-slate-600 dark:text-slate-300">
            {MOOD_LABEL[mood]}
          </span>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
        >
          <Feather className="h-4 w-4" /> {pending ? 'Ekleniyor…' : 'Not Ekle'}
        </button>
      </div>
    </form>
  )
}
