'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pin, Trash2, Pencil, Check, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {Field, Input, Textarea } from '@/components/ui/Field'
import { togglePinNote, deleteNote, updateNote } from '@/app/actions/notes'
import {
  NOTE_KINDS,
  NOTE_KIND_LABEL,
  NOTE_KIND_TONE,
  MOODS,
  MOOD_LABEL,
  MOOD_BG,
  type NoteKind,
  type Mood,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

export type NoteCardData = {
  id: string
  clientId: string
  title: string | null
  body: string
  kind: NoteKind
  mood: Mood | null
  pinned: boolean
  createdAt: string
  goalId: string | null
  /** Bağlı hedefin başlığı (sayfada çözülür) */
  goalTitle?: string | null
}

/**
 * Seans Defteri kartı — çizgili kâğıt, tür rozeti, duygu noktası, altın raptiye.
 * Kalem ile satır içi düzenlenebilir.
 */
export function NoteCard({ note }: { note: NoteCardData }) {
  const [pending, start] = useTransition()
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [kind, setKind] = useState<NoteKind>(note.kind)
  const [mood, setMood] = useState<Mood | null>(note.mood)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function onPin() {
    start(async () => {
      await togglePinNote(note.id, note.clientId, !note.pinned)
      router.refresh()
    })
  }

  async function onDelete() {
    await deleteNote(note.id, note.clientId)
    router.refresh()
  }

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await updateNote(note.id, note.clientId, {
        title: String(fd.get('title') || ''),
        body: String(fd.get('body') || ''),
        kind,
        mood,
        goalId: note.goalId, // hedef bağlantısını koru
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setEditing(false)
      router.refresh()
    })
  }

  if (editing) {
    return (
      <form onSubmit={onSave} className="note-paper note-paper-rich relative space-y-3 rounded-[1.35rem] p-4 ring-1 ring-indigo-500/30 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          {NOTE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
                kind === k
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-500/20 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              )}
            >
              {NOTE_KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <Field label="Başlık (opsiyonel)">
          <Input name="title" defaultValue={note.title ?? ''} placeholder="Başlık" />
        </Field>
        <Field label="Not">
          <Textarea name="body" rows={4} required defaultValue={note.body} />
        </Field>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Duygu:</span>
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? null : m)}
              title={MOOD_LABEL[m]}
              aria-label={MOOD_LABEL[m]}
              className={cn(
                'h-5 w-5 rounded-full transition-all',
                MOOD_BG[m],
                mood === m
                  ? 'scale-110 ring-2 ring-slate-900/50 ring-offset-1 ring-offset-[var(--bg)] dark:ring-white/70'
                  : 'opacity-45 hover:opacity-90',
              )}
            />
          ))}
        </div>
        {error && <p role="alert" className="text-xs text-rose-500">{error}</p>}
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" /> Vazgeç
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" /> {pending ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div
      className={cn(
        'note-paper note-paper-rich group relative rounded-[1.35rem] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-5',
        note.pinned && 'ring-1 ring-amber-500/40',
      )}
    >
      {/* Altın raptiye — sabitlenmiş not */}
      {note.pinned && (
        <span className="absolute -top-2 right-4 flex h-6 w-6 rotate-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
          <Pin className="h-3 w-3" />
        </span>
      )}

      <div className="mb-3 flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={NOTE_KIND_LABEL[note.kind]} tone={NOTE_KIND_TONE[note.kind]} />
            {note.mood && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span className={cn('h-2.5 w-2.5 rounded-full', MOOD_BG[note.mood])} />
                {MOOD_LABEL[note.mood]}
              </span>
            )}
            {note.goalTitle && (
              <span
                title={`Hedef: ${note.goalTitle}`}
                className="inline-flex max-w-[220px] items-center gap-1 truncate rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
              >
                🎯 <span className="truncate">{note.goalTitle}</span>
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {formatDateTime(note.createdAt)}
          </p>
        </div>
        <span className="ml-auto flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            onClick={() => setEditing(true)}
            disabled={pending}
            aria-label="Düzenle"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onPin}
            disabled={pending}
            aria-label={note.pinned ? 'Sabitlemeyi kaldır' : 'Notu sabitle'}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
              note.pinned
                ? 'text-amber-600 hover:bg-amber-500/10 dark:text-amber-400'
                : 'text-slate-400 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400',
            )}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Sil"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        title="Not silinsin mi?"
        description="Bu seans notu kalıcı olarak silinecek."
      />

      {note.title && (
        <p className="break-words font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {note.title}
        </p>
      )}
      {/* break-words: boşluksuz uzun metin (URL, uzun kelime) kartı taşırıyordu */}
      <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-600 dark:text-slate-300">
        {note.body}
      </p>
    </div>
  )
}
