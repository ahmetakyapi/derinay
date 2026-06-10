'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { AvatarPicker } from '@/components/forms/AvatarPicker'
import { TagInput } from '@/components/forms/TagInput'
import { Field, Input, Select } from '@/components/ui/Field'
import { updateClient } from '@/app/actions/clients'
import {
  CLIENT_COLORS,
  CLIENT_COLOR_BG,
  CLIENT_STATUSES,
  CLIENT_STATUS_LABEL,
  type ClientColor,
  type ClientStatus,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

export function EditClientDialog({
  client,
}: {
  client: {
    id: string
    name: string
    email: string | null
    phone: string | null
    status: ClientStatus
    sessionFee: number
    startDate: string
    colorTag: string
    avatarUrl: string | null
    tags: string[]
  }
}) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState<ClientColor>((client.colorTag as ClientColor) ?? 'indigo')
  const [avatar, setAvatar] = useState<string | null>(client.avatarUrl)
  const [tags, setTags] = useState<string[]>(client.tags)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    start(async () => {
      const res = await updateClient(client.id, {
        name: String(fd.get('name')),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        status: fd.get('status') as ClientStatus,
        sessionFee: Number(fd.get('sessionFee') || 0),
        startDate: String(fd.get('startDate') || ''),
        colorTag: color,
        avatarUrl: avatar,
        tags,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Düzenle"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Danışanı düzenle">
        <form onSubmit={onSubmit} className="space-y-4">
          <AvatarPicker name={client.name} color={color} value={avatar} onChange={setAvatar} />

          <Field label="Ad Soyad">
            <Input name="name" required defaultValue={client.name} />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="E-posta">
              <Input name="email" type="email" defaultValue={client.email ?? ''} />
            </Field>
            <Field label="Telefon">
              <Input name="phone" defaultValue={client.phone ?? ''} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Statü">
              <Select name="status" defaultValue={client.status}>
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Seans ücreti (₺)">
              <Input name="sessionFee" type="number" step="0.01" min="0" defaultValue={client.sessionFee} />
            </Field>
          </div>

          <Field label="Başlangıç tarihi">
            <Input name="startDate" type="date" defaultValue={client.startDate.slice(0, 10)} />
          </Field>

          <TagInput value={tags} onChange={setTags} />

          <div>
            <span className="field-label">Etiket rengi</span>
            <div className="flex flex-wrap gap-2">
              {CLIENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={cn(
                    'h-8 w-8 rounded-lg bg-gradient-to-br transition-all',
                    CLIENT_COLOR_BG[c],
                    color === c
                      ? 'scale-110 ring-2 ring-slate-900/60 ring-offset-2 ring-offset-[var(--bg)] dark:ring-white/70'
                      : 'opacity-70 hover:opacity-100',
                  )}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              İptal
            </button>
            <button type="submit" disabled={pending} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60">
              {pending ? 'Kaydediliyor…' : 'Değişiklikleri kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
