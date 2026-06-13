'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { formatTRY } from '@/lib/format'

/**
 * Sayıyı 0'dan hedefe yumuşakça sayar (ease-out cubic).
 * Hareket azaltma açıksa anında hedef değeri gösterir.
 */
export function AnimatedNumber({
  to,
  kind = 'currency',
  duration = 950,
}: {
  to: number
  kind?: 'currency' | 'count'
  duration?: number
}) {
  const reduced = useReducedMotion()
  // Hydration güvenliği: SSR ve istemcinin İLK render'ı daima 0 olmalı.
  // (reduced-motion açıkken bile başlangıçta 0; effect içinde hedefe atlanır.)
  const [val, setVal] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    if (reduced) {
      setVal(to)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [to, duration, reduced])

  const display = kind === 'currency' ? formatTRY(Math.round(val)) : Math.round(val).toLocaleString('tr-TR')
  return <>{display}</>
}
