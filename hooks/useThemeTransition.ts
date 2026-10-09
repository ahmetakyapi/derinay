'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> }
}

/**
 * Tema değiştirici — tıklanan noktadan dışa açılan mürekkep dairesi.
 *
 * View Transitions API varsa: eski ekranın anlık görüntüsü üstünde yeni tema
 * bir daire olarak büyür. Yoksa (eski tarayıcı) ya da hareket azaltma
 * açıksa: düz geçiş.
 *
 * Sınıf geri çağrının İÇİNDE elle değiştirilir: next-themes `setTheme`'i
 * bir efektte uygular, anlık görüntü alınırken DOM henüz eski temada
 * olurdu ve daire boş açılırdı.
 */
export function useThemeTransition() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === 'dark' : false

  const toggle = useCallback(
    (e?: React.MouseEvent) => {
      const next = isDark ? 'light' : 'dark'
      const doc = document as DocWithVT
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!doc.startViewTransition || reduced) {
        setTheme(next)
        return
      }

      const x = e?.clientX ?? window.innerWidth - 40
      const y = e?.clientY ?? 40
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      const vt = doc.startViewTransition(() => {
        const root = document.documentElement
        root.classList.toggle('dark', next === 'dark')
        root.classList.toggle('light', next === 'light')
        root.style.colorScheme = next
        setTheme(next)
      })
      vt.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 750, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {})
    },
    [isDark, setTheme],
  )

  return { isDark, mounted, toggle }
}
