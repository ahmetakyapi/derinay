'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

type Tone = 'danger' | 'default'

/**
 * Estetik onay diyaloğu — window.confirm yerine. Modal üzerine kurulu,
 * bu sayede portal + focus-trap + ARIA otomatik gelir.
 * onConfirm bir Promise döndürebilir; çözülene kadar buton spinner gösterir.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgeç',
  tone = 'danger',
  icon,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<unknown>
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
  icon?: React.ReactNode
}) {
  const [pending, setPending] = useState(false)

  async function confirm() {
    try {
      setPending(true)
      await onConfirm()
      onClose()
    } finally {
      setPending(false)
    }
  }

  const danger = tone === 'danger'

  return (
    <Modal open={open} onClose={pending ? () => {} : onClose} title={title} description={description}>
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            danger ? 'bg-rose-500/12 text-rose-600 dark:text-rose-400' : 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
          )}
        >
          {icon ?? <AlertTriangle className="h-5 w-5" />}
        </span>
        <p className="pt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {danger ? 'Bu işlem geri alınamaz.' : 'Devam etmek istediğine emin misin?'}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50 dark:hover:text-slate-300"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          aria-busy={pending}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60',
            danger
              ? 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-500'
              : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-500',
          )}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
