'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, GripVertical, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input } from '@/components/ui/Field'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { SessionStatusSelect } from '@/components/forms/SessionStatusSelect'
import { ReminderButton } from '@/components/clients/ReminderButton'
import { updateSessionTime, deleteSession } from '@/app/actions/notes'
import type { AgendaItem } from '@/lib/queries'
import { SESSION_STATUS_LABEL, STATUS_TONE, type SessionStatus, CLIENT_COLOR_DOT } from '@/lib/constants'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

type Day = { key: string; label: string; dayNum: number; items: AgendaItem[] }

/**
 * Görünür saat aralığı: 1px = 1dk (desktop ızgara).
 * Varsayılan 08:00–21:00'dir ama aralık SABİT DEĞİLDİR — haftada 07:30 ya da
 * 21:30'luk bir seans varsa pencere onu içerecek şekilde genişler. Sabit
 * aralıkta bu seanslar ya yanlış saate çizilir (top negatif → 0'a kelepçelenir)
 * ya da kolon dışına taşıp `overflow-hidden` tarafından kırpılırdı.
 */
const DEFAULT_START = 8 * 60
const DEFAULT_END = 21 * 60
const SNAP = 30 // sürüklemede dakika hassasiyeti

/** Haftadaki seansları kapsayan, saat başına yuvarlanmış görünür aralık */
function visibleRange(days: Day[]): { start: number; end: number } {
  let start = DEFAULT_START
  let end = DEFAULT_END
  for (const d of days) {
    for (const it of d.items) {
      start = Math.min(start, it.startMin)
      end = Math.max(end, it.startMin + it.durationMin)
    }
  }
  return {
    start: Math.max(0, Math.floor(start / 60) * 60),
    end: Math.min(24 * 60, Math.ceil(end / 60) * 60),
  }
}

// Seans bloğu — danışan rengine göre yumuşak tint (galeri etiketi)
const TINT: Record<string, { bar: string; bg: string; border: string; text: string }> = {
  indigo:  { bar: 'bg-indigo-500',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25 hover:border-indigo-500/60',   text: 'text-indigo-700 dark:text-indigo-200' },
  emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25 hover:border-emerald-500/60', text: 'text-emerald-700 dark:text-emerald-200' },
  sky:     { bar: 'bg-sky-500',     bg: 'bg-sky-500/10',     border: 'border-sky-500/25 hover:border-sky-500/60',         text: 'text-sky-700 dark:text-sky-200' },
  violet:  { bar: 'bg-violet-500',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25 hover:border-violet-500/60',   text: 'text-violet-700 dark:text-violet-200' },
  amber:   { bar: 'bg-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25 hover:border-amber-500/60',     text: 'text-amber-700 dark:text-amber-200' },
  rose:    { bar: 'bg-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25 hover:border-rose-500/60',       text: 'text-rose-700 dark:text-rose-200' },
  teal:    { bar: 'bg-teal-500',    bg: 'bg-teal-500/10',    border: 'border-teal-500/25 hover:border-teal-500/60',       text: 'text-teal-700 dark:text-teal-200' },
  cyan:    { bar: 'bg-cyan-500',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/25 hover:border-cyan-500/60',       text: 'text-cyan-700 dark:text-cyan-200' },
}
const tintOf = (c: string) => TINT[c] ?? TINT.indigo

const pad = (n: number) => String(n).padStart(2, '0')

export function AgendaWeek({
  days,
  todayKey,
  reminderTemplate,
  therapist,
}: {
  days: Day[]
  todayKey: string
  reminderTemplate: string
  therapist: string
}) {
  const [selected, setSelected] = useState<AgendaItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [hoverDay, setHoverDay] = useState<string | null>(null) // sürükleme hedefi vurgusu
  const [nowMin, setNowMin] = useState<number | null>(null) // canlı "şu an" çizgisi (mount sonrası)
  const [conflict, setConflict] = useState<string | null>(null) // çakışma uyarısı (geçici)
  const [pending, start] = useTransition()
  const router = useRouter()

  const { start: DAY_START, end: DAY_END } = useMemo(() => visibleRange(days), [days])
  const SPAN = DAY_END - DAY_START

  function showConflict(msg: string) {
    setConflict(msg)
    setTimeout(() => setConflict(null), 4500)
  }

  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setNowMin(n.getHours() * 60 + n.getMinutes())
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [])

  function move(item: { id: string; clientId: string | null }, dayKey: string, minutes: number) {
    const clamped = Math.max(DAY_START, Math.min(DAY_END - SNAP, minutes))
    const isoLocal = `${dayKey}T${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`
    start(async () => {
      const res = await updateSessionTime(item.id, item.clientId, isoLocal)
      if (!res.ok && res.error) showConflict(res.error)
      router.refresh()
    })
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, dayKey: string) {
    e.preventDefault()
    setHoverDay(null)
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
      const res = await updateSessionTime(selected.id, selected.clientId, isoLocal)
      if (!res.ok && res.error) showConflict(res.error)
      setSelected(null)
      router.refresh()
    })
  }

  async function removeSession() {
    if (!selected) return
    await deleteSession(selected.id, selected.clientId)
    setSelected(null)
    router.refresh()
  }

  const hours = Array.from({ length: SPAN / 60 + 1 }, (_, i) => DAY_START / 60 + i)

  return (
    <>
      {/* ── Desktop: saat ızgarası + sürükle-bırak ── */}
      <div className="glass hidden overflow-hidden rounded-2xl lg:block">
        {/* Gün başlıkları */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-500/10">
          <div />
          {days.map((d, di) => {
            const isToday = d.key === todayKey
            const isWeekend = di >= 5
            return (
              <div
                key={d.key}
                className={cn(
                  'border-l border-slate-500/10 px-2 py-2.5 text-center',
                  isToday && 'bg-indigo-500/[0.07]',
                  !isToday && isWeekend && 'bg-slate-500/[0.03]',
                )}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={cn('text-[10px] font-bold uppercase tracking-wide', isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')}>
                    {d.label}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      isToday
                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-700 dark:text-slate-200',
                    )}
                  >
                    {d.dayNum}
                  </span>
                </div>
                <span className={cn('mt-0.5 block text-[10px] font-medium', d.items.length ? 'text-slate-400' : 'text-transparent')}>
                  {d.items.length ? `${d.items.length} seans` : '·'}
                </span>
              </div>
            )
          })}
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
          {days.map((d, di) => (
            <div
              key={d.key}
              onDragOver={(e) => {
                e.preventDefault()
                if (hoverDay !== d.key) setHoverDay(d.key)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setHoverDay(null)
              }}
              onDrop={(e) => onDrop(e, d.key)}
              className={cn(
                'relative border-l border-slate-500/10 transition-colors',
                d.key === todayKey && 'bg-indigo-500/[0.04]',
                d.key !== todayKey && di >= 5 && 'bg-slate-500/[0.025]',
                dragId && hoverDay === d.key && 'bg-indigo-500/[0.09] ring-1 ring-inset ring-indigo-500/30',
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

              {/* Şu an çizgisi — yalnızca bugünün kolonunda */}
              {d.key === todayKey && nowMin !== null && nowMin >= DAY_START && nowMin <= DAY_END && (
                <span
                  className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                  style={{ top: nowMin - DAY_START }}
                  aria-hidden
                >
                  <span className="-ml-1 h-2 w-2 rounded-full bg-rose-500 ring-4 ring-rose-500/25" />
                  <span className="h-px flex-1 bg-rose-500/70" />
                </span>
              )}

              {/* Seans blokları — danışan rengine göre tint */}
              {d.items.map((it) => {
                // Aralık artık seansları kapsıyor; yine de kelepçele ki
                // bozuk veri (ör. 23:50 + 60dk) ızgarayı taşırmasın.
                const top = Math.min(Math.max(0, it.startMin - DAY_START), SPAN - 20)
                const height = Math.max(24, Math.min(it.durationMin, SPAN - top))
                const dim = it.status === 'cancelled' || it.status === 'no_show'
                const t = tintOf(it.colorTag)
                return (
                  <div
                    key={it.id}
                    role="button"
                    tabIndex={0}
                    /* İsim aria-label'a YAZILMAZ: ekranda .sensitive ile bulanan
                       değer erişilebilir adda düz metin olarak sızıyordu. */
                    aria-label={`${it.time} seansını aç`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(it)
                      }
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', it.id)
                      e.dataTransfer.effectAllowed = 'move'
                      setDragId(it.id)
                    }}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setSelected(it)}
                    className={cn(
                      // NOT: backdrop-blur kullanma — .glass (backdrop-filter) içinde iç içe
                      // backdrop blur, Chrome/Safari'de metinde smear/bulanıklık glitch'i yapar.
                      'group absolute inset-x-1 z-10 cursor-grab overflow-hidden rounded-lg border bg-[rgba(var(--paper),0.92)] px-1.5 py-1 text-left shadow-sm outline-none transition-all hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500/60 active:cursor-grabbing',
                      t.border,
                      dim && 'opacity-45',
                      dragId === it.id && 'opacity-30',
                      pending && 'pointer-events-none',
                    )}
                    style={{ top, height }}
                  >
                    {/* Renk tonu — opak kâğıt üstünde yarı saydam katman */}
                    <span aria-hidden className={cn('pointer-events-none absolute inset-0', t.bg)} />
                    <span className={cn('absolute inset-y-1 left-0 w-[3px] rounded-r-full', t.bar)} />
                    <div className="relative flex items-center gap-1 pl-1.5">
                      <span className={cn('font-mono text-[10px] font-bold', t.text)}>{it.time}</span>
                      {height >= 56 && (
                        <span className="text-[9px] font-medium text-slate-400">· {it.durationMin}dk</span>
                      )}
                      <GripVertical className="ml-auto h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                    </div>
                    <p className={cn('sensitive relative truncate pl-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-100', dim && 'line-through')}>
                      {it.clientName}
                    </p>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-500/10 px-4 py-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <GripVertical className="h-3 w-3" /> Seansı sürükleyerek gün/saat değiştir · tıklayarak detayını aç
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <Clock className="h-3 w-3 text-rose-500/70" /> kırmızı çizgi = şu an
          </span>
        </div>
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
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', CLIENT_COLOR_DOT[it.colorTag] ?? CLIENT_COLOR_DOT.indigo)} />
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{it.time}</span>
                        <span className={cn('sensitive min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100', dim && 'line-through')}>
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

      {/* Çakışma uyarısı — geçici pil */}
      {conflict && (
        <div
          role="alert"
          className="surface fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2.5 text-sm font-semibold text-rose-700 shadow-xl dark:text-rose-300 lg:bottom-5"
        >
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-rose-500" />
          {/* Mesaj çakışan danışanın adını içerir → gizlilik modunda bulanmalı */}
          <span className="sensitive">{conflict}</span>
        </div>
      )}

      {/* ── Seans detay modalı ── */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={<span className="sensitive">{selected?.clientName ?? ''}</span>}
        description={
          selected ? (
            <span className="sensitive">
              {formatTRY(selected.fee)} · {selected.durationMin} dk
            </span>
          ) : undefined
        }
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
                template={reminderTemplate}
                therapist={therapist}
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
              <Field label="Tarih & Saat" className="flex-1">
                <Input
                  name="when"
                  type="datetime-local"
                  required
                  defaultValue={`${selected.dateKey}T${pad(Math.floor(selected.startMin / 60))}:${pad(selected.startMin % 60)}`}
                />
              </Field>
              <SubmitButton pending={pending} busyLabel="Taşınıyor…">
                Taşı
              </SubmitButton>
            </form>

            <div className="flex justify-end border-t border-slate-500/10 pt-3">
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" /> Seansı Sil
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={removeSession}
        title="Seans silinsin mi?"
        description={
          selected ? (
            <span className="sensitive">
              {selected.clientName} · {selected.time}
            </span>
          ) : undefined
        }
        confirmLabel="Seansı Sil"
      />
    </>
  )
}
