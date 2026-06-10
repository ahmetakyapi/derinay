'use client'

import { motion } from 'framer-motion'
import { EASE } from '@/lib/variants'
import { cn } from '@/lib/utils'

/**
 * El çizimi okaliptüs dalı — terapi odalarının vazgeçilmezi.
 * Sayfa açılınca mürekkeple çizilir gibi belirir (pathLength animasyonu).
 */
export function BranchArt({ className, delay = 0.3 }: { className?: string; delay?: number }) {
  const draw = (i: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 1.1, delay: delay + i * 0.18, ease: EASE },
  })

  return (
    <svg
      viewBox="0 0 120 170"
      fill="none"
      aria-hidden
      className={cn('pointer-events-none select-none', className)}
    >
      {/* Gövde */}
      <motion.path
        d="M62 165 C56 130 66 95 58 62 C54 42 60 22 66 8"
        stroke="rgba(var(--pine), 0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        {...draw(0)}
      />
      {/* Yapraklar — sol */}
      <motion.path
        d="M59 140 C42 138 30 128 26 112 C42 116 54 126 59 140 Z"
        stroke="rgba(var(--pine), 0.45)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        {...draw(1)}
      />
      <motion.path
        d="M60 96 C45 92 36 80 35 66 C49 72 58 82 60 96 Z"
        stroke="rgba(var(--pine), 0.4)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        {...draw(3)}
      />
      <motion.path
        d="M63 52 C51 46 46 36 47 24 C58 30 64 40 63 52 Z"
        stroke="rgba(var(--gold), 0.45)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        {...draw(5)}
      />
      {/* Yapraklar — sağ */}
      <motion.path
        d="M61 118 C77 114 88 103 90 88 C75 93 64 104 61 118 Z"
        stroke="rgba(var(--gold), 0.4)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        {...draw(2)}
      />
      <motion.path
        d="M60 74 C74 68 81 57 81 44 C68 50 61 61 60 74 Z"
        stroke="rgba(var(--pine), 0.42)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        {...draw(4)}
      />
      {/* Tepe filizi + altın tohum */}
      <motion.path
        d="M66 8 C70 14 70 20 67 26"
        stroke="rgba(var(--gold), 0.5)"
        strokeWidth="1.8"
        strokeLinecap="round"
        {...draw(6)}
      />
      <motion.circle
        cx="67"
        cy="6"
        r="2.5"
        fill="rgba(var(--gold), 0.55)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 1.4, ease: EASE }}
      />
    </svg>
  )
}
