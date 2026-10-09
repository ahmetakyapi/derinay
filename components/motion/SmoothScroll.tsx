'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { isIntroDone, subscribeIntro } from './intro'

/**
 * Atalet kaydırma (Lenis) — YALNIZ landing'de.
 *
 * Panelde KULLANILMAZ: orada kaydırılabilir iç alanlar (ajanda ızgarası,
 * modal, komut paleti) çok; yerel kaydırma daha öngörülebilir. Landing ise
 * bir sahne — kaydırmaya bağlı hareketler ataletle akıcı okunur.
 *
 * Lenis pencerenin KENDİ kaydırmasını sürer (sanal kap yok), bu yüzden
 * Framer'ın `useScroll()` değerleri aynen çalışır. Çapa bağlantıları
 * (`#panel` …) `anchors` ile başlığın altına yumuşakça iner.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -88 },
      autoRaf: true,
    })

    // Açılış perdesi sürerken sahne kımıldamasın
    if (!isIntroDone()) lenis.stop()
    const unsub = subscribeIntro(() => lenis.start())

    return () => {
      unsub()
      lenis.destroy()
    }
  }, [])

  return null
}
