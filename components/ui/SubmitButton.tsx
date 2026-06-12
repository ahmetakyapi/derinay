'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Standart form gönder butonu — bekleme durumunda spinner gösterir,
 * `aria-busy` ile ekran okuyucuya işlemin sürdüğünü bildirir.
 * Dialoglardaki tekrarlanan indigo submit butonunun tek kaynağı.
 */
export function SubmitButton({
  pending,
  busyLabel = 'Kaydediliyor…',
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending: boolean
  busyLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? busyLabel : children}
    </button>
  )
}
