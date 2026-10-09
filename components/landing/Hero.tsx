'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { BrushSweep } from '@/components/brand/Brush'
import { BloomArt } from '@/components/art/BloomArt'
import { RevealText } from '@/components/motion/RevealText'
import { Magnetic } from '@/components/motion/Magnetic'
import { useIntroDone } from '@/components/motion/intro'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'

/**
 * Kahraman — ekranı dolduran editoryal manşet.
 *
 * Manşet iki satır, iki ayrı kaydırma hızı: ilk satır sola, ikinci sağa
 * kayar; sayfa aşağı indikçe manşet "açılır". Kelimeler açılış perdesi
 * kalkarken maskeden yükselir, ardından altın fırça "Dinlendir"in altını
 * boyar. Vurgu sözcüğü landing'de YALNIZ burada (bkz. CLAUDE.md §7).
 */
export function Hero() {
  const play = useIntroDone()
  // Kaydırmaya bağlı değerler MotionConfig'ten etkilenmez; hareket azaltmada elle kapatılır
  const still = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['0vw', '-14vw'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['0vw', '12vw'])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', '45%'])

  return (
    <section
      ref={ref}
      className="relative z-10 flex min-h-[100svh] flex-col px-6 pb-8 pt-[calc(6.5rem+env(safe-area-inset-top))] sm:px-10 sm:pb-10"
    >
      {/* Üst künye */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: play ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mx-auto flex w-full max-w-7xl items-start justify-between gap-6 font-mono text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"
      >
        <span>
          (01)
          <br />
          klinik pratik yönetimi
        </span>
        <span className="text-right">
          tek kullanıcı
          <br />
          tek parola · tek masa
        </span>
      </motion.div>

      {/* Orkide dalı — manşetin arkasında, kaydırmayla aşağı süzülür */}
      <motion.div
        style={still ? undefined : { y: artY }}
        className="pointer-events-none absolute right-[4%] top-[16%] h-60 w-44 opacity-60 sm:h-80 sm:w-60 lg:right-[6%] lg:top-[18%] lg:h-[26rem] lg:w-[20rem] lg:opacity-80"
        aria-hidden
      >
        {play && <BloomArt className="h-full w-full" delay={0.9} />}
      </motion.div>

      <motion.h1
        style={still ? undefined : { opacity: fade }}
        className="mx-auto mt-auto w-full max-w-7xl pt-16 font-display text-[clamp(3.1rem,10.4vw,10.5rem)] font-bold leading-[0.9] tracking-[-0.06em] text-slate-900 dark:text-white"
      >
        <motion.span style={still ? undefined : { x: x1 }} className="block">
          <RevealText text="Pratiğini Yönet," play={play} stagger={0.08} duration={1.2} />
        </motion.span>
        <motion.span style={still ? undefined : { x: x2 }} className="block sm:pl-[14%]">
          <RevealText text="Kafanı" play={play} delay={0.16} duration={1.2} />{' '}
          <span className="relative inline-block">
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: play ? 1 : 0 }}
              transition={{ duration: 1, ease: EASE_IN_OUT, delay: 0.95 }}
              /* Konum ÖLÇÜLDÜ: fırça tabanın biraz üstünden başlayıp harflerin
                 altını yalar. Ortaya hizalanınca "üstü çizili" okunuyordu. */
              className="pointer-events-none absolute inset-x-[-4%] bottom-[0.02em] top-[0.62em] origin-left text-amber-500"
            >
              <BrushSweep className="h-full w-full" />
            </motion.span>
            <RevealText
              text="Dinlendir"
              play={play}
              delay={0.26}
              duration={1.2}
              className="relative text-indigo-700 dark:text-indigo-300"
            />
          </span>
        </motion.span>
      </motion.h1>

      {/* Alt sıra: açıklama + çağrı */}
      <div className="mx-auto mt-12 grid w-full max-w-7xl items-end gap-8 sm:mt-16 md:grid-cols-12">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: play ? 1 : 0, y: play ? 0 : 24 }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.7 }}
          className="max-w-md text-[1.0625rem] leading-[1.7] text-slate-600 dark:text-slate-300 md:col-span-5"
        >
          Danışanların, ajandan, seans defterin ve finansın tek yerde. Tek kişilik bir pratiğin
          ihtiyacı kadar sakin bir çalışma masası.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: play ? 1 : 0, y: play ? 0 : 24 }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.85 }}
          className="flex flex-wrap items-center gap-4 md:col-span-7 md:justify-end"
        >
          <Magnetic strength={0.25}>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-indigo-600 py-4 pl-7 pr-5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25"
            >
              {/* Altın dolgu aşağıdan yükselir */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-slate-900 transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 dark:bg-amber-500"
              />
              <span className="roll relative">
                <span data-t="Panele Git">Panele Git</span>
              </span>
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </Magnetic>
          <a
            href="#panel"
            className="group inline-flex items-center gap-2 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="roll">
              <span data-t="Neler Var">Neler Var</span>
            </span>
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-slate-500/30">
              <ArrowDown className="h-3.5 w-3.5 animate-[nudge_2.2s_ease-in-out_infinite]" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
