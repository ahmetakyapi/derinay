'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSessionStatus } from '@/app/actions/notes'
import { SESSION_STATUSES, SESSION_STATUS_LABEL, type SessionStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Durum → renkli rozet stili (bir bakışta anlaşılır)
const STATUS_STYLE: Record<SessionStatus, string> = {
  scheduled: '!border-sky-500/40 !bg-sky-500/10 !text-sky-700 dark:!text-sky-300',
  completed: '!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300',
  cancelled: '!border-slate-500/30 !bg-slate-500/10 !text-slate-500 dark:!text-slate-400',
  no_show: '!border-rose-500/40 !bg-rose-500/10 !text-rose-700 dark:!text-rose-300',
}

/**
 * Seans durumunu satır içinde değiştir — durum rengiyle boyalı rozet select.
 */
export function SessionStatusSelect({
  id,
  clientId,
  value,
}: {
  id: string
  clientId: string
  value: SessionStatus
}) {
  const [current, setCurrent] = useState<SessionStatus>(value)
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value as SessionStatus
        setCurrent(status)
        start(async () => {
          await updateSessionStatus(id, clientId, status)
          router.refresh()
        })
      }}
      className={cn(
        'field !w-auto cursor-pointer !rounded-full !py-1 !pl-3 !pr-7 text-xs !font-semibold transition-colors',
        STATUS_STYLE[current],
      )}
    >
      {SESSION_STATUSES.map((s) => (
        <option key={s} value={s}>{SESSION_STATUS_LABEL[s]}</option>
      ))}
    </select>
  )
}
