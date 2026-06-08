'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Genel silme butonu. action() bir server action sarmalayıcısıdır.
 */
export function DeleteButton({
  action,
  confirmText = 'Bu kaydı silmek istediğinize emin misiniz?',
  redirectTo,
  className,
}: {
  action: () => Promise<{ ok: boolean }>
  confirmText?: string
  redirectTo?: string
  className?: string
}) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onClick() {
    if (!window.confirm(confirmText)) return
    start(async () => {
      await action()
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    })
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-label="Sil"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50',
        className,
      )}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
