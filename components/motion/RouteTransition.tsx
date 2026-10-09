'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { BloomMark } from '@/components/brand/BloomMark'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'

/**
 * Rota geçişleri — iki ölçek, tek dil.
 *
 * 1) BÖLGE DEĞİŞİMİ (landing ↔ giriş ↔ panel): tam ekran PERDE. İki katlı
 *    çam perde aşağıdan yükselir, ortasında varılan yerin adı yazar; yeni
 *    sayfa hazır olunca yukarı çekilir. Ödüllü sitelerin "sahne değişimi".
 *
 * 2) PANEL İÇİ gezinme: perde YOK — günde yüz kez tıklanan bir araçta perde
 *    sabır sınar. Onun yerine ekranın tepesinde mürekkep çizgisi akar,
 *    içerik `.page-enter` ile kademeli yükselir (PageTransition).
 *
 * Nasıl: belge düzeyinde YAKALAMA evresinde tıklamayı dinleriz. Bölge
 * değişiyorsa `preventDefault()` — next/link `defaultPrevented` gördüğünde
 * kendi gezinmesini yapmaz (next/dist/client/link.js) — perdeyi kapatır,
 * sonra `router.push` ile gideriz. Yol adı değişince perde açılır.
 */

type Zone = 'home' | 'auth' | 'app' | 'other'

function zoneOf(path: string): Zone {
  if (path === '/') return 'home'
  if (path.startsWith('/login')) return 'auth'
  if (path.startsWith('/dashboard')) return 'app'
  return 'other'
}

const ZONE_LABEL: Record<Zone, string> = {
  home: 'Atölye',
  auth: 'Giriş',
  app: 'Panel',
  other: 'Derinay',
}

/** Perde açılmazsa (ağ hatası, aynı yola yönlendirme) en geç bu sürede kalkar */
const SAFETY_MS = 7000

export function RouteTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const [stage, setStage] = useState<'idle' | 'cover' | 'covered' | 'reveal'>('idle')
  const [label, setLabel] = useState('')
  const target = useRef<string | null>(null)
  const fromPath = useRef(pathname)
  const ink = useAnimationControls()
  const inkActive = useRef(false)

  // ── Tıklama yakalayıcı ───────────────────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return // çapa / aynı sayfa

      const from = zoneOf(window.location.pathname)
      const to = zoneOf(url.pathname)
      if (to === 'other') return // yazdırma sayfaları vb. — dokunma

      if (from !== to && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        e.preventDefault()
        target.current = url.pathname + url.search + url.hash
        fromPath.current = window.location.pathname
        setLabel(ZONE_LABEL[to])
        setStage('cover')
      } else {
        // Panel içi: mürekkep çizgisi
        inkActive.current = true
        ink.set({ scaleX: 0, opacity: 1 })
        ink.start({ scaleX: 0.82, transition: { duration: 3.2, ease: [0.1, 0.7, 0.2, 1] } })
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [ink])

  // ── Yol değişti: perdeyi kaldır, çizgiyi tamamla ─────────────────────
  useEffect(() => {
    if (inkActive.current) {
      inkActive.current = false
      ink
        .start({ scaleX: 1, transition: { duration: 0.28, ease: EASE_OUT_EXPO } })
        .then(() => ink.start({ opacity: 0, transition: { duration: 0.35 } }))
    }
    if (stage === 'covered' && pathname !== fromPath.current) {
      // Yeni sayfa ilk karesini boyasın, sonra perde kalksın
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setStage('reveal')))
      return () => cancelAnimationFrame(id)
    }
  }, [pathname, stage, ink])

  // ── Emniyet: perde asla takılı kalmasın ──────────────────────────────
  useEffect(() => {
    if (stage !== 'covered') return
    const t = setTimeout(() => setStage('reveal'), SAFETY_MS)
    return () => clearTimeout(t)
  }, [stage])

  const onCovered = () => {
    if (stage !== 'cover') return
    setStage('covered')
    if (target.current) router.push(target.current)
  }

  const visible = stage !== 'idle'
  const closing = stage === 'reveal'

  return (
    <>
      {/* Mürekkep gezinti çizgisi */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        animate={ink}
        className="nav-ink pointer-events-none fixed inset-x-0 top-0 z-[350] h-[2px] origin-left print:hidden"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-[380]"
            aria-live="polite"
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <span className="sr-only">{label} açılıyor</span>
            {/* Arka kat — öncü şerit */}
            <motion.div
              className="absolute inset-0 bg-indigo-600"
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: closing ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.75, ease: EASE_IN_OUT, delay: closing ? 0.12 : 0 }}
              onAnimationComplete={() => closing && setStage('idle')}
            />
            {/* Ön kat — derin çam, yazı burada */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-indigo-950"
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: closing ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 0.75, ease: EASE_IN_OUT, delay: closing ? 0 : 0.1 }}
              onAnimationComplete={onCovered}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <motion.span
                  initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                  animate={{ rotate: closing ? 90 : 0, scale: 1, opacity: closing ? 0 : 1 }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: closing ? 0 : 0.35 }}
                  className="text-amber-400"
                >
                  <BloomMark className="h-10 w-10 sm:h-14 sm:w-14" />
                </motion.span>
                <span className="overflow-hidden pb-[0.1em]">
                  <motion.span
                    className="block font-display text-[3rem] font-bold leading-none tracking-[-0.05em] text-slate-50 sm:text-[5.5rem]"
                    initial={{ y: '110%' }}
                    animate={{ y: closing ? '-110%' : '0%' }}
                    transition={{ duration: 0.8, ease: closing ? EASE_IN_OUT : EASE_OUT_EXPO, delay: closing ? 0 : 0.4 }}
                  >
                    {label}
                  </motion.span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
