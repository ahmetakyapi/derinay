'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Genel silme butonu. action() bir server action sarmalayıcısıdır.
 * Onay artık estetik ConfirmDialog ile alınır (window.confirm değil).
 */
export function DeleteButton({
  action,
  confirmText = 'Bu kaydı silmek istediğinize emin misiniz?',
  confirmLabel = 'Sil',
  redirectTo,
  className,
}: {
  action: () => Promise<{ ok: boolean }>
  confirmText?: string
  confirmLabel?: string
  redirectTo?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function onConfirm() {
    await action()
    if (redirectTo) router.push(redirectTo)
    else router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Sil"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500',
          className,
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        title="Silinsin mi?"
        description={confirmText}
        confirmLabel={confirmLabel}
      />
    </>
  )
}
