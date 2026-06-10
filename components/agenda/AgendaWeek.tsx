'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, GripVertical } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { SessionStatusSelect } from '@/components/forms/SessionStatusSelect'
import { ReminderButton } from '@/components/clients/ReminderButton'
import { updateSessionTime, deleteSession } from '@/app/actions/notes'
import type { AgendaItem } from '@/lib/queries'
import { SESSION_STATUS_LABEL, STATUS_TONE, type SessionStatus } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

type Day = { key: string; label: string; dayNum: number; items: AgendaItem[] }

// Çalışma aralığı: 08:00–21:00 → 1px = 1dk (desktop ızgara)
const DAY_START = 8 * 60
const DAY_END = 21 * 60
const SPAN = DAY_END - DAY_START
const SNAP = 30 // sürüklemede dakika hassasiyeti

const DOT: Record<string, string> = {
  indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', sky: 'bg-sky-500',
  violet: 'bg-violet-500', amber: 'bg-amber-500', rose: 'bg-rose-500',
  teal: 'bg-teal-500', cyan: 'bg-cyan-500',
}

const pad = (n: number) => String(n).padStart(2, '0')

export function AgendaWeek({ days, todayKey }: { days: Day[]; todayKey: string }) {
  const [selected, setSelected] = useState<AgendaItem | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  function move(item: { id: string; clientId: string | null }, dayKey: string, minutes: number) {
    const clamped = Math.max(DAY_START, Math.min(DAY_END - SNAP, minutes))
    const isoLocal = `${dayKey}T${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`
    start(async () => {
      await updateSessionTime(item.id, item.clientId, isoLocal)
      router.refresh()
    })
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, dayKey: string) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const item = days.flatMap((d) => d.items).find((x) => x.id === id)
    if (!item) return
    const rect = e.currentTarget.getBoundingClientRect()
    const raw = DAY_START + ((e.clientY - rect.top) / rect.height) * SPAN
    move(item, dayKey, Math.round(raw / SNAP) * SNAP)
    setDragId(null)
  }

  function saveTime(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selected) return
    const fd = new FormData(e.currentTarget)
    const isoLocal = String(fd.get('when'))
    start(async () => {
      await updateSessionTime(selected.id, selected.clientId, isoLocal)
      setSelected(null)
      router.refresh()
    })
  }

  function removeSession() {
    if (!selected) return
    if (!window.confirm('Bu seans silinecek. Emin misiniz?')) return
    start(async () => {
      await deleteSession(selected.id, selected.clientId)
      setSelected(null)
      router.refresh()
    })
  }

  const hours = Array.from({ length: SPAN / 60 + 1 }, (_, i) => DAY_START / 60 + i)

  return (
    <>
      {/* ── Desktop: saat ızgarası + sürükle-bırak ── */}
      <div className="glass hidden overflow-hidden rounded-2xl lg:block">
        {/* Gün başlıkları */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-500/10">
          <div />
          {days.map((d) => (
            <div
              key={d.key}
              className={cn(
                'border-l border-slate-500/10 px-2 py-2.5 text-center',
                d.key === todayKey && 'bg-indigo-500/[0.06]',
              )}
            >
              <span className={cn('text-[10px] font-bold uppercase tracking-wide', d.key === todayKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
                {d.label}
              </span>
              <span className={cn('ml-1.5 text-sm font-bold', d.key === todayKey ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200')}>
                {d.dayNum}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[56px_repeat(7,1fr)]">
          {/* Saat cetveli */}
          <div className="relative" style={{ height: SPAN }}>
            {hours.map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-slate-400"
                style={{ top: (h * 60 - DAY_START) }}
              >
                {pad(h)}:00
              </span>
            ))}
          </div>

          {/* Gün kolonları */}
          {days.map((d) => (
            <div
              key={d.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, d.key)}
              className={cn(
                'relative border-l border-slate-500/10',
                d.key === todayKey && 'bg-indigo-500/[0.04]',
              )}
              style={{ height: SPAN }}
            >
              {/* Saat çizgileri */}
              {hours.slice(1).map((h) => (
                <span
                  key={h}
                  className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-500/10"
                  style={{ top: h * 60 - DAY_START }}
                />
              ))}

              {/* Seans blokları */}
              {d.items.map((it) => {
                const top = Math.max(0, it.startMin - DAY_START)
                const height = Math.max(34, Math.min(it.durationMin, DAY_END - it.startMin))
                const dim = it.status === 'cancelled' || it.status === 'no_show'
                return (
                  <div
                    key={it.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', it.id)
                      e.dataTransfer.effectAllowed = 'move'
                      setDragId(it.id)
                    }}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setSelected(it)}
                    className={cn(
                      'group absolute inset-x-1 cursor-grab overflow-hidden rounded-lg border px-1.5 py-1 text-left shadow-sm transition-all active:cursor-grabbing',
                      'border-slate-500/15 bg-[rgba(var(--paper),0.95)] hover:border-indigo-500/50 hover:shadow-md',
                      dim && 'opacity-45',
                      dragId === it.id && 'opacity-30',
                      pending && 'pointer-events-none',
                    )}
                    style={{ top, height }}
                  >
                    <span className={cn('absolute inset-y-1 left-0 w-[3px] rounded-r-full', DOT[it.colorTag] ?? DOT.indigo)} />
                    <div className="flex items-center gap-1 pl-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300">{it.time}</span>
                      <GripVertical className="ml-auto h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
                    </div>
                    <p className={cn('truncate pl-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-100', dim && 'line-through')}>
                      {it.clientName}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <p className="border-t border-slate-500/10 px-4 py-2 text-[11px] text-slate-400">
          Seansı sürükleyerek gün/saat değiştir · tıklayarak detayını aç
        </p>
      </div>

      {/* ── Mobil: gün gün liste ── */}
      <div className="space-y-3 lg:hidden">
        {days.map((d) => (
          <section
            key={d.key}
            className={cn('glass rounded-2xl p-4', d.key === todayKey && 'ring-1 ring-indigo-500/40')}
          >
            <h3 className="mb-2.5 flex items-baseline gap-2">
              <span className={cn('text-xs font-bold uppercase tracking-wide', d.key === todayKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
                {d.label}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{d.dayNum}</span>
              {d.key === todayKey && <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">bugün</span>}
            </h3>
            {d.items.length ? (
              <ul className="space-y-1.5">
                {d.items.map((it) => {
                  const dim = it.status === 'cancelled' || it.status === 'no_show'
                  return (
                    <li key={it.id}>
                      <button
                        onClick={() => setSelected(it)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl border border-slate-500/10 px-3 py-2.5 text-left transition-colors hover:border-indigo-500/40',
                          dim && 'opacity-50',
                        )}
                      >
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', DOT[it.colorTag] ?? DOT.indigo)} />
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{it.time}</span>
                        <span className={cn('min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100', dim && 'line-through')}>
                          {it.clientName}
                        </span>
                        <StatusBadge label={SESSION_STATUS_LABEL[it.status as SessionStatus]} tone={STATUS_TONE[it.status]} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="py-2 text-center text-xs text-slate-400">Seans yok</p>
            )}
          </section>
        ))}
      </div>

      {/* ── Seans detay modalı ── */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.clientName ?? ''}
        description={selected ? `${formatTRY(selected.fee)} · ${selected.durationMin} dk` : undefined}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <SessionStatusSelect
                id={selected.id}
                clientId={selected.clientId ?? ''}
                value={selected.status as SessionStatus}
              />
              <ReminderButton
                clientName={selected.clientName}
                phone={selected.clientPhone}
                date={`${selected.dateKey}T${pad(Math.floor(selected.startMin / 60))}:${pad(selected.startMin % 60)}`}
              />
              {selected.clientId && (
                <Link
                  href={`/dashboard/clients/${selected.clientId}`}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  Danışan profili <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            <form onSubmit={saveTime} className="flex items-end gap-2">
              <Field label="Tarih & saat" className="flex-1">
                <Input
                  name="when"
                  type="datetime-local"
                  required
                  defaultValue={`${selected.dateKey}T${pad(Math.floor(selected.startMin / 60))}:${pad(selected.startMin % 60)}`}
                />
              </Field>
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
              >
                Taşı
              </button>
            </form>

            <div className="flex justify-end border-t border-slate-500/10 pt-3">
              <button
                onClick={removeSession}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" /> Seansı sil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
