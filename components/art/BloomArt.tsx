'use client'

import { motion } from 'framer-motion'
import { EASE } from '@/lib/variants'
import { cn } from '@/lib/utils'

/**
 * El çizimi orkide dalı — ince bir sapta iki açmış, bir tomurcuk çiçek.
 * Mürekkeple çizilir gibi belirir (pathLength). Çok düşük opaklıkta,
 * göze batmadan sanatsal bir doku katar.
 */
export function BloomArt({
  className,
  delay = 0.4,
  tone = 'paper',
}: {
  className?: string
  delay?: number
  /** 'night': koyu çam zemin üstü — sap ve yapraklar açık çam tonuna geçer */
  tone?: 'paper' | 'night'
}) {
  const leaf = tone === 'night' ? 'var(--pine-soft)' : 'var(--pine)'
  const k = tone === 'night' ? 1.9 : 1
  const draw = (i: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 1.3, delay: delay + i * 0.16, ease: EASE },
  })

  // 5 yapraklı açmış çiçek — merkez (cx,cy) etrafında elips taç yaprakları
  const bloom = (cx: number, cy: number, r: number, i0: number, stroke: string) =>
    [0, 72, 144, 216, 288].map((deg, k) => (
      <motion.ellipse
        key={`${cx}-${deg}`}
        cx={cx}
        cy={cy - r * 0.62}
        rx={r * 0.3}
        ry={r * 0.62}
        stroke={stroke}
        strokeWidth="1.4"
        transform={`rotate(${deg} ${cx} ${cy})`}
        {...draw(i0 + k * 0.04)}
      />
    ))

  return (
    <svg viewBox="0 0 140 180" fill="none" aria-hidden className={cn('pointer-events-none select-none', className)}>
      {/* Sap */}
      <motion.path
        d="M70 176 C66 140 78 116 72 86 C68 64 80 40 92 18"
        stroke={`rgba(${leaf}, ${0.42 * k})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        {...draw(0)}
      />
      {/* Yapraklar */}
      <motion.path
        d="M71 132 C54 130 44 120 41 106 C56 109 67 118 71 132 Z"
        stroke={`rgba(${leaf}, ${0.36 * k})`}
        strokeWidth="1.5"
        strokeLinejoin="round"
        {...draw(1)}
      />
      <motion.path
        d="M73 100 C88 95 95 84 95 71 C82 77 74 87 73 100 Z"
        stroke={`rgba(${leaf}, ${0.32 * k})`}
        strokeWidth="1.5"
        strokeLinejoin="round"
        {...draw(2)}
      />
      {/* Açmış çiçek — üst */}
      {bloom(93, 18, 12, 3, `rgba(var(--gold), ${0.5 * k})`)}
      <motion.circle cx="93" cy="18" r="2.4" fill={`rgba(var(--gold), ${0.5 * k})`} {...draw(4)} />
      {/* Açmış çiçek — orta */}
      {bloom(58, 64, 9, 5, `rgba(var(--clay), ${0.4 * k})`)}
      <motion.circle cx="58" cy="64" r="1.9" fill={`rgba(var(--clay), ${0.42 * k})`} {...draw(6)} />
      {/* Tomurcuk */}
      <motion.path
        d="M70 108 C66 102 67 95 72 90 C77 95 76 103 70 108 Z"
        stroke={`rgba(${leaf}, ${0.4 * k})`}
        strokeWidth="1.4"
        strokeLinejoin="round"
        {...draw(7)}
      />
    </svg>
  )
}
