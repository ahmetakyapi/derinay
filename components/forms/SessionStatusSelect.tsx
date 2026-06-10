'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSessionStatus } from '@/app/actions/notes'
import { SESSION_STATUSES, SESSION_STATUS_LABEL, type SessionStatus } from '@/lib/constants'

/**
 * Seans durumunu satır içinde değiştir — "Geldi mi?" sorusunun tek tık cevabı.
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
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value as SessionStatus
        start(async () => {
          await updateSessionStatus(id, clientId, status)
          router.refresh()
        })
      }}
      className="field !w-auto !py-1 !pl-2 !pr-6 !text-xs"
    >
      {SESSION_STATUSES.map((s) => (
        <option key={s} value={s}>{SESSION_STATUS_LABEL[s]}</option>
      ))}
    </select>
  )
}
