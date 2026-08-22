'use client'

import { useEffect } from 'react'
import { useMotionTemplate, useMotionValue } from 'framer-motion'

/**
 * Mouse takip eden radial gradient spotlight.
 * Hero bölümü veya sayfa arka planına uygulanır.
 *
 * const spotlight = useSpotlight()
 * <motion.div style={{ background: spotlight }} />
 */
// Varsayılan renk palet token'ından gelir — hardcoded rgba yasağı (CLAUDE.md §7)
export function useSpotlight(radius = 620, color = 'rgba(var(--pine), 0.08)') {
  const mx = useMotionValue(-600)
  const my = useMotionValue(-600)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mx, my])

  return useMotionTemplate`radial-gradient(${radius}px circle at ${mx}px ${my}px, ${color}, transparent 78%)`
}
