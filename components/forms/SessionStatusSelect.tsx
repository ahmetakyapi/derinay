'use client'

import { StatusPillSelect } from '@/components/ui/StatusPillSelect'
import { updateSessionStatus } from '@/app/actions/notes'
import { SESSION_STATUSES, SESSION_STATUS_LABEL, type SessionStatus } from '@/lib/constants'

// Durum → renkli rozet stili (bir bakışta anlaşılır)
const STATUS_STYLE: Record<SessionStatus, string> = {
  scheduled: '!border-sky-500/40 !bg-sky-500/10 !text-sky-700 dark:!text-sky-300',
  completed: '!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700 dark:!text-emerald-300',
  cancelled: '!border-slate-500/30 !bg-slate-500/10 !text-slate-500 dark:!text-slate-400',
  no_show: '!border-rose-500/40 !bg-rose-500/10 !text-rose-700 dark:!text-rose-300',
}

/** Seans durumunu satır içinde değiştir. */
export function SessionStatusSelect({
  id,
  clientId,
  value,
}: {
  id: string
  clientId: string
  value: SessionStatus
}) {
  return (
    <StatusPillSelect
      value={value}
      options={SESSION_STATUSES}
      labels={SESSION_STATUS_LABEL}
      styles={STATUS_STYLE}
      ariaLabel="Seans durumu"
      onSelect={(next) => updateSessionStatus(id, clientId, next)}
    />
  )
}
