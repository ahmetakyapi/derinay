'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { modalBackdrop, modalPanel } from '@/lib/variants'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'

// İç içe modallarda body kaydırma kilidini doğru yönet (ref-count).
let scrollLockCount = 0
function lockBodyScroll() {
  if (scrollLockCount === 0) document.body.style.overflow = 'hidden'
  scrollLockCount++
}
function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) document.body.style.overflow = ''
}

const SIZE_MAX: Record<'md' | 'lg' | 'xl' | '2xl', string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-5xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  /** ReactNode — danışan adı geçen başlıkları <span className="sensitive"> ile sar */
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  size?: 'md' | 'lg' | 'xl' | '2xl'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return

    // Açılışta odağı modala taşı; kapanışta tetikleyen öğeye geri ver.
    const prevFocus = document.activeElement as HTMLElement | null
    const focusFirst = () => {
      const panel = panelRef.current
      if (!panel) return
      const first = panel.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel).focus()
    }
    const raf = requestAnimationFrame(focusFirst)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      // Focus-trap — Tab odağı modal içinde döndürür.
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null || el === document.activeElement,
        )
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    lockBodyScroll()
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      unlockBodyScroll()
      prevFocus?.focus?.()
    }
  }, [open, onClose])

  // Portal — modal her zaman document.body'ye render edilir. Aksi halde
  // backdrop-filter'lı .glass ataları fixed konumu hapseder (popup kartın
  // içinde/arkasında kalır — bilinen CSS containing-block tuzağı).
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-4"
        >
          {/* Mobil: alttan açılan sayfa (bottom sheet) · sm+: ortalanmış kart */}
          <motion.div
            ref={panelRef}
            variants={modalPanel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`surface w-full ${SIZE_MAX[size]} max-h-[92dvh] overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none sm:my-8 sm:max-h-none sm:rounded-3xl sm:p-6`}
          >
            {/* Sürükleme tutamacı — yalnızca mobil */}
            <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-slate-500/25 sm:hidden" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
