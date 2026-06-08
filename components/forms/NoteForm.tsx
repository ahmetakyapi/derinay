'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Field'
import { createNote } from '@/app/actions/notes'

export function NoteForm({ clientId }: { clientId: string }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
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
        body: String(fd.get('body') || ''),
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <Input name="title" placeholder="Başlık (opsiyonel)" />
      <Textarea name="body" rows={3} required placeholder="Seans/danışan notu…" />
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> {pending ? 'Ekleniyor…' : 'Not ekle'}
        </button>
      </div>
    </form>
  )
}
