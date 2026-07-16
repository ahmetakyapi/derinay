'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

// globals.css --bg değerleriyle senkron (kâğıt galeri / gece galerisi)
const THEME_COLOR = { light: '#f6f2e9', dark: '#04070d' } as const

/**
 * Tarayıcı çubuğu rengini UYGULAMA temasıyla eşler. Tema class-tabanlı
 * (next-themes, enableSystem kapalı) olduğundan viewport'taki statik
 * prefers-color-scheme meta'sı yanlış kalabiliyordu — ör. sistemi koyu olan
 * kullanıcı light panelde koyu çubuk görüyordu. Bu bileşen render etmez,
 * yalnızca <meta name="theme-color"> içeriğini günceller.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = THEME_COLOR[resolvedTheme]
  }, [resolvedTheme])

  return null
}
