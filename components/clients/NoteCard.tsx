'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pin, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { togglePinNote, deleteNote } from '@/app/actions/notes'
import {
  NOTE_KIND_LABEL,
  NOTE_KIND_TONE,
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
}

/**
 * Seans Defteri kartı — çizgili kâğıt, tür rozeti, duygu noktası, altın raptiye.
 */
export function NoteCard({ note }: { note: NoteCardData }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onPin() {
    start(async () => {
      await togglePinNote(note.id, note.clientId, !note.pinned)
      router.refresh()
    })
  }

  function onDelete() {
    if (!window.confirm('Bu not silinecek. Emin misiniz?')) return
    start(async () => {
      await deleteNote(note.id, note.clientId)
      router.refresh()
    })
  }

  return (
    <div
      className={cn(
        'note-paper group relative rounded-xl p-4 transition-all',
        note.pinned && 'ring-1 ring-amber-500/40',
      )}
    >
      {/* Altın raptiye — sabitlenmiş not */}
      {note.pinned && (
        <span className="absolute -top-2 right-4 flex h-5 w-5 rotate-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
          <Pin className="h-3 w-3" />
        </span>
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge label={NOTE_KIND_LABEL[note.kind]} tone={NOTE_KIND_TONE[note.kind]} />
        {note.mood && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className={cn('h-2.5 w-2.5 rounded-full', MOOD_BG[note.mood])} />
            {MOOD_LABEL[note.mood]}
          </span>
        )}
        <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
            onClick={onDelete}
            disabled={pending}
            aria-label="Sil"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {note.title && (
        <p className="font-display text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
          {note.title}
        </p>
      )}
      <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
        {note.body}
      </p>
      <p className="mt-2 text-[11px] text-slate-400">{formatDateTime(note.createdAt)}</p>
    </div>
  )
}
