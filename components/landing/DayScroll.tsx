'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { Sunrise, NotebookPen, MoonStar } from 'lucide-react'
import { RevealText } from '@/components/motion/RevealText'
import { Reveal } from '@/components/motion/Reveal'

/**
 * Gün — YATAY KAYAN SAHNE.
 *
 * Sabah → seans arası → ay sonu gerçek bir sıradır; dikey kaydırma burada
 * yatay bir yolculuğa çevrilir: bölüm ekrana sabitlenir, duraklar soldan
 * sağa akar, alttaki zaman çizgisi ilerledikçe dolar.
 *
 * Bölümün yüksekliği ÖLÇÜLÜR (izin uzunluğu + ekran yüksekliği): tahmini bir
 * `300vh` ya fazla boşluk ya erken bitiş üretirdi.
 *
 * Telefonda (<768px) sabitleme yok: yatay sabit sahne dokunmatikte kafa
 * karıştırır, duraklar alt alta dizilir.
 */
const MOMENTS = [
  {
    time: 'Sabah',
    icon: Sunrise,
    title: 'Güne Başlarken',
    body: 'Bugünün seansları, notu eksik kalan görüşmeler, bitmek üzere olan paketler ve bir süredir gelmeyen danışanlar. Hepsi ana ekranda; aramana gerek yok.',
    wash: 'rgba(var(--gold), 0.16)',
  },
  {
    time: 'Seans Arası',
    icon: NotebookPen,
    title: 'Not Alırken',
    body: 'Danışan çıkar çıkmaz notunu yazarsın, iki dakika sürer. Aklındakiler unutulmadan kaydedilmiş olur.',
    wash: 'rgba(var(--pine), 0.16)',
  },
  {
    time: 'Ay Sonu',
    icon: MoonStar,
    title: 'Hesap Zamanı',
    body: 'Kimin ödediği, kimin geciktiği ve ne kadar vergi ödeyeceğin tek sayfada. Muhasebecine göndereceğin rapor tek tıkla hazır.',
    wash: 'rgba(var(--clay), 0.14)',
  },
] as const

function MomentCard({
  m,
  i,
  progress,
}: {
  m: (typeof MOMENTS)[number]
  i: number
  progress: MotionValue<number>
}) {
  // Kart içindeki dev numara kendi hızında kayar — katmanlı derinlik
  const numX = useTransform(progress, [0, 1], [60 + i * 30, -60 - i * 30])
  const Icon = m.icon
  return (
    <article
      className="glass glass-static relative flex h-[min(34rem,70vh)] w-[min(34rem,78vw)] shrink-0 flex-col overflow-hidden rounded-[2rem] p-8 max-md:h-auto max-md:w-full sm:p-10"
      style={{ backgroundImage: `radial-gradient(120% 90% at 100% 0%, ${m.wash}, transparent 60%)` }}
    >
      <motion.span
        aria-hidden
        style={{ x: numX }}
        className="pointer-events-none absolute right-4 top-[20%] font-display text-[13rem] font-bold leading-none tracking-[-0.08em] text-slate-900/[0.05] dark:text-white/[0.05] max-md:hidden"
      >
        0{i + 1}
      </motion.span>
      <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
        <span>0{i + 1} / 03</span>
        <span className="rounded-full border border-slate-500/25 px-3 py-1">{m.time}</span>
      </div>
      <Icon aria-hidden strokeWidth={1.25} className="mt-10 h-16 w-16 text-indigo-600 dark:text-indigo-300 sm:h-20 sm:w-20" />
      <div className="relative mt-auto pt-10">
        <h3 className="font-display text-[1.85rem] font-bold leading-[1.05] tracking-[-0.05em] text-slate-900 dark:text-white sm:text-[2.6rem]">
          {m.title}
        </h3>
        <p className="mt-4 max-w-sm text-[15px] leading-[1.7] text-slate-600 dark:text-slate-400">{m.body}</p>
      </div>
    </article>
  )
}

export function DayScroll() {
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 768px)')
    const measure = () => setDist(mq.matches ? Math.max(0, el.scrollWidth - window.innerWidth) : 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    mq.addEventListener('change', measure)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])

  return (
    <section
      id="gun"
      ref={section}
      className="band-sand relative z-10 scroll-mt-0"
      style={dist ? { height: `calc(100vh + ${dist}px)` } : undefined}
    >
      <div className="md:sticky md:top-0 md:flex md:h-screen md:flex-col md:justify-center md:overflow-hidden">
        <motion.div
          ref={track}
          style={{ x }}
          className="flex flex-col gap-6 px-6 py-24 md:w-max md:flex-row md:items-center md:gap-8 md:px-10 md:py-0"
        >
          {/* Giriş levhası */}
          <div className="shrink-0 md:w-[min(40rem,70vw)] md:pr-12">
            <h2 className="font-display text-[clamp(2.4rem,4.4vw,4.3rem)] font-bold leading-[1.02] tracking-[-0.055em] text-slate-900 dark:text-white">
              <RevealText text="Günün Her Anında" />
              <br />
              <RevealText text="Yanında" delay={0.12} />
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-md text-[15.5px] leading-[1.75] text-slate-600 dark:text-slate-400">
                Sabahtan Ay Sonuna Kadar Panel Seninle Birlikte Çalışır.
              </p>
            </Reveal>
          </div>

          {MOMENTS.map((m, i) => (
            <MomentCard key={m.time} m={m} i={i} progress={scrollYProgress} />
          ))}

          {/* Kapanış nefesi — son kart ekranın ortasında dursun */}
          <div aria-hidden className="hidden shrink-0 md:block md:w-[12vw]" />
        </motion.div>

        {/* Zaman çizgisi */}
        <div className="pointer-events-none absolute inset-x-10 bottom-10 hidden md:block" aria-hidden>
          <div className="relative h-px bg-slate-500/20">
            <motion.div style={{ scaleX: scrollYProgress }} className="nav-ink absolute inset-0 origin-left" />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>Sabah</span>
            <span>Seans Arası</span>
            <span>Ay Sonu</span>
          </div>
        </div>
      </div>
    </section>
  )
}
