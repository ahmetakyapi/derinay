'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { BloomMark } from '@/components/brand/BloomMark'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'
import { INTRO_KEY, markIntroDone } from './intro'

/** Sayacın 0 → 100 arası süresi (ms) */
const COUNT_MS = 1700
const WORD = 'Derinay'

/**
 * Açılış perdesi — oturumda BİR kez, yalnız landing'de.
 *
 * Kâğıt zemin üstünde orkide yaprak yaprak açar, sayaç 100'e çıkar, sonra iki
 * katlı perde (kâğıt + çam) yukarı çekilir ve altından manşet yükselir.
 *
 * Görünürlük üç katmanda korunur:
 *  - SSR perdeyi HER ZAMAN çizer → içerik bir kare bile perdesiz görünmez.
 *  - Layout'taki engelleyici script `html.intro-seen` koyar; CSS perdeyi
 *    ilk boyamadan önce gizler (ikinci ziyaret flaşsız).
 *  - Hareket azaltma tercihinde CSS yine gizler, burada da hemen biter.
 */
export function Preloader() {
  const [phase, setPhase] = useState<'run' | 'exit' | 'gone'>('run')
  // Sayaç bir hareket değeri: her karede React yeniden çizmesin
  const count = useMotionValue(0)
  const countText = useTransform(count, (c) => String(Math.round(c)).padStart(3, '0'))
  const countScale = useTransform(count, (c) => c / 100)

  useEffect(() => {
    const html = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (html.classList.contains('intro-seen') || reduced) {
      setPhase('gone')
      markIntroDone()
      return
    }

    html.style.overflow = 'hidden'
    const start = performance.now()
    let raf = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = (now: number) => {
      const p = Math.min((now - start) / COUNT_MS, 1)
      // Sayaç düzgün değil, nefes alır gibi: başta hızlı, sonda yavaş
      count.set((1 - Math.pow(1 - p, 2.4)) * 100)
      if (p < 1) raf = requestAnimationFrame(tick)
      else timer = setTimeout(() => setPhase('exit'), 260)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      html.style.overflow = ''
    }
  }, [count])

  // Perde kalkmaya başlarken manşet de başlasın — üst üste binen iki hareket
  // tek bir sahne gibi okunur.
  useEffect(() => {
    if (phase !== 'exit') return
    const t = setTimeout(markIntroDone, 380)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'gone') return null

  const finish = () => {
    document.documentElement.style.overflow = ''
    document.documentElement.classList.add('intro-seen')
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {}
    setPhase('gone')
  }

  const exiting = phase === 'exit'

  return (
    <div className="preloader fixed inset-0 z-[400]" aria-hidden>
      {/* Arka kat: çam — kâğıttan bir an sonra kalkar, kenarda yeşil bir şerit bırakır */}
      <motion.div
        className="absolute inset-0 bg-indigo-800 dark:bg-indigo-900"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={exiting ? { clipPath: 'inset(0% 0% 100% 0%)' } : undefined}
        transition={{ duration: 1.05, ease: EASE_IN_OUT, delay: 0.12 }}
        onAnimationComplete={() => exiting && finish()}
      />

      {/* Ön kat: kâğıt */}
      <motion.div
        className="absolute inset-0 flex flex-col bg-[var(--bg)]"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={exiting ? { clipPath: 'inset(0% 0% 100% 0%)' } : undefined}
        transition={{ duration: 0.95, ease: EASE_IN_OUT }}
      >
        {/* Üst künye */}
        <div className="flex items-center justify-between px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] font-mono text-[11px] text-slate-500 dark:text-slate-400 sm:px-10">
          <span>Yükleniyor</span>
          <span>Danışan · Seans · Finans</span>
        </div>

        {/* Orkide — beş yaprak sırayla açar, yavaşça döner */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ rotate: -40, scale: 0.6 }}
            animate={{ rotate: exiting ? 30 : 0, scale: exiting ? 0.85 : 1 }}
            transition={{ duration: exiting ? 0.8 : 1.8, ease: EASE_OUT_EXPO }}
            className="relative h-24 w-24 text-indigo-700 dark:text-indigo-300 sm:h-28 sm:w-28"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <g key={deg} transform={`rotate(${deg} 12 12)`}>
                  <motion.ellipse
                    cx="12"
                    cy="6.3"
                    rx="2.45"
                    ry="5.1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.92 }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.16, ease: EASE_OUT_EXPO }}
                    style={{ transformOrigin: '12px 12px' }}
                  />
                </g>
              ))}
              <motion.circle
                cx="12"
                cy="12"
                r="2.35"
                className="text-amber-500"
                fill="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 1, ease: EASE_OUT_EXPO }}
                style={{ transformOrigin: '12px 12px' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Alt sıra: marka sözcüğü + sayaç */}
        <div className="flex items-end justify-between gap-6 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-10 sm:pb-10">
          <p className="flex overflow-hidden font-display text-[3.2rem] font-bold leading-[0.9] tracking-[-0.06em] text-slate-900 dark:text-white sm:text-[6rem]">
            {WORD.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: '105%' }}
                animate={{ y: exiting ? '-105%' : '0%' }}
                transition={{
                  duration: exiting ? 0.6 : 0.9,
                  delay: exiting ? i * 0.025 : 0.25 + i * 0.05,
                  ease: exiting ? EASE_IN_OUT : EASE_OUT_EXPO,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </p>
          <motion.p className="font-mono text-[2.4rem] font-medium leading-none tabular-nums text-slate-900 dark:text-white sm:text-[4.5rem]">
            {countText}
          </motion.p>
        </div>

        {/* İlerleme saç çizgisi */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-500/10">
          <motion.div className="nav-ink h-full origin-left" style={{ scaleX: countScale }} />
        </div>
      </motion.div>
    </div>
  )
}
