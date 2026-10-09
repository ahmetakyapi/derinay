'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeTransition } from '@/hooks/useThemeTransition'
import { EASE_OUT_EXPO } from '@/lib/variants'

/**
 * Tema düğmesi — landing başlığı ve panel kabuğunun ortak düğmesi.
 * İkon döner-solarak değişir; tema tıklanan noktadan daire olarak yayılır.
 */
export function ThemeToggleButton({ className, iconClassName = 'h-4 w-4' }: { className?: string; iconClassName?: string }) {
  const { isDark, mounted, toggle } = useThemeTransition()
  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      title={isDark ? 'Açık Tema' : 'Koyu Tema'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-500/20 text-slate-500 transition-colors hover:border-amber-500/50 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ y: 14, rotate: -90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -14, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="flex"
          >
            {isDark ? <Sun className={iconClassName} /> : <Moon className={iconClassName} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
