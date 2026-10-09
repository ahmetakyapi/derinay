'use client'

import { motion, useScroll, useSpring, MotionConfig } from 'framer-motion'
import { useSpotlight } from '@/hooks/useSpotlight'
import { BrushPull } from '@/components/brand/Brush'
import { BloomMark } from '@/components/brand/BloomMark'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Preloader } from '@/components/motion/Preloader'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { VelocityMarquee } from '@/components/motion/VelocityMarquee'
import { Hero } from '@/components/landing/Hero'
import { Showcase } from '@/components/landing/Showcase'
import { CapabilityIndex } from '@/components/landing/CapabilityIndex'
import { DayScroll } from '@/components/landing/DayScroll'
import { NotebookScene, FinanceScene, TrustScene, Closing } from '@/components/landing/Scenes'

/**
 * Landing — "Atölye Sahnesi" (görsel revizyon, Ekim 2026).
 *
 * Sayfa bir broşür değil, kaydırmayla oynanan bir sergi. Her bölüm kendi
 * HAREKETİNİ ve kendi DÜZENİNİ içeriğinden alır; hiçbiri tekrar etmez:
 *
 *   açılış    → oturumda bir kez: galeri penceresi kurulur, kemer açılıp sayfaya dönüşür
 *   kahraman  → ekranı dolduran manşet; iki satır kaydırmada zıt yönlere açılır
 *   bant      → kaydırma hızına duyarlı, dolu/kontur dönüşümlü kayan sözcükler
 *   vitrin    → gece adası: çam zemin kenarlardan genişler, kesit yatıktan düzleşir
 *   dizin     → numaralı sergi dizini; satır üstünde mürekkep yükselir
 *   gün       → yatay kayan sabit sahne; zaman çizgisi kaydırmayla dolar
 *   defter    → kesit perde gibi açılır, kendi hızında süzülür (metin sağda)
 *   finans    → ayna (metin solda) — üst üste en fazla İKİ bölünmüş düzen
 *   emanet    → ikinci gece adası; dev orkide mühür kaydırmayla döner
 *   kapanış   → dev çağrı + mıknatıslı yuvarlak düğme
 *   altlık    → ekranı dolduran marka sözcüğü, harfler sırayla yükselir
 *
 * Renk sözleşmesi DEĞİŞMEDİ: bej kâğıt + çam yeşili, altın yalnız vurgu.
 * Hareket azaltma tercihinde perde atlanır, Lenis kapanır, dönüşümler durur.
 */

const MARQUEE_A = ['Danışan Dosyası', 'Ajanda', 'Seans Defteri', 'Ruh Hali Takibi', 'Tedavi Hedefleri']
const MARQUEE_B = ['Makbuz', 'Gelir & Gider', 'Vergi', 'Analiz', 'Yedek']

function MarqueeRow({ words, velocity }: { words: string[]; velocity: number }) {
  return (
    <VelocityMarquee baseVelocity={velocity}>
      {words.map((w, i) => (
        <span key={w} className="flex items-center">
          <span
            className={
              i % 2
                ? 'px-6 text-transparent [-webkit-text-stroke:1.5px_rgba(var(--line),0.55)] sm:px-10'
                : 'px-6 text-slate-900 dark:text-white sm:px-10'
            }
          >
            {w}
          </span>
          <BloomMark className="h-[0.42em] w-[0.42em] shrink-0 text-amber-500" />
        </span>
      ))}
    </VelocityMarquee>
  )
}

export default function Home() {
  const spotlight = useSpotlight(620, 'rgba(var(--pine), 0.08)')
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <SmoothScroll />
      <Header />

      {/* overflow-x-CLIP, hidden DEĞİL: hidden bir kaydırma kabı kurar ve
          içerideki `position: sticky` (dizin başlığı, gün sahnesi) ölür. */}
      <main id="lp-main" tabIndex={-1} className="relative min-h-[100dvh] overflow-x-clip outline-none">
        <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlight }} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh]" aria-hidden>
          <div className="absolute -left-24 top-32 hidden h-80 w-80 animate-float rounded-full bg-indigo-500/10 blur-3xl motion-reduce:animate-none md:block" />
          <div className="absolute right-[-80px] top-64 hidden h-96 w-96 animate-float-slow rounded-full bg-amber-500/10 blur-3xl motion-reduce:animate-none md:block" />
        </div>

        {/* Mürekkep omurgası — sayfanın ilerleme göstergesi */}
        <motion.div
          aria-hidden
          style={{ scaleY: progress }}
          className="pointer-events-none fixed bottom-24 left-4 top-24 z-40 hidden w-[8px] origin-top text-slate-900/25 mix-blend-multiply dark:text-white/20 dark:mix-blend-screen 2xl:block"
        >
          <BrushPull className="h-full w-full" />
        </motion.div>

        <Hero />

        {/* Hız bandı — kaydırma hızlandıkça hızlanır, yön değişince döner */}
        <div
          className="relative z-10 space-y-2 border-y border-slate-500/15 py-8 font-display text-[clamp(2.6rem,7vw,6.5rem)] font-bold leading-none tracking-[-0.05em] sm:py-12"
        >
          <MarqueeRow words={MARQUEE_A} velocity={-1.6} />
          <MarqueeRow words={MARQUEE_B} velocity={1.6} />
        </div>

        <div className="relative z-10 pt-24 sm:pt-32">
          <Showcase />
        </div>

        <CapabilityIndex />
        <DayScroll />
        <NotebookScene />
        <FinanceScene />
        <TrustScene />
        <Closing />
      </main>

      <Footer />
    </MotionConfig>
  )
}
