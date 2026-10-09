'use client'

import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { PanelPreview } from '@/components/marketing/PanelPreview'
import { PreviewFrame } from '@/components/marketing/PreviewFrame'
import { RevealText } from '@/components/motion/RevealText'

/**
 * Doğru sayılar — uydurma metrik değil, panelin kendisinden:
 * 12 ekran (DashboardShell NAV_GROUPS), 3 bölüm (Klinik/Finans/Yaşam), 1 parola.
 */
const FACTS = [
  { n: 12, label: 'Sayfa, Tek Menüde' },
  { n: 3, label: 'Bölüm: Klinik, Finans, Kişisel' },
  { n: 1, label: 'Şifre, Başka Hesap Gerekmez' },
] as const

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  // Değer bir hareket değerinde akar; React her karede yeniden çizmez
  const v = useMotionValue(0)
  const text = useTransform(v, (x) => String(Math.round(x)).padStart(2, '0'))
  useEffect(() => {
    if (!inView) return
    const c = animate(v, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [inView, to, v])
  return <motion.span ref={ref}>{text}</motion.span>
}

/**
 * Vitrin — "gece galerisi" adası.
 *
 * Çam zemin kaydırdıkça kenarlardan genişleyip ekranı doldurur (clip-path
 * inset + köşe yarıçapı küçülür), panel kesiti ise yatık hâlden (rotateX)
 * düzleşerek büyür. Ada `dark` sınıfı taşır: içindeki kesit panelin KOYU
 * temasını gösterir — ziyaretçi iki temayı da sayfada görmüş olur.
 */
export function Showcase() {
  const ref = useRef<HTMLElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const inset = useTransform(scrollYProgress, [0, 1], [7, 0])
  const radius = useTransform(scrollYProgress, [0, 1], [56, 0])
  const clip = useMotionTemplate`inset(0% ${inset}% 0% ${inset}% round ${radius}px)`
  const scale = useTransform(scrollYProgress, [0.2, 1], [0.84, 1])
  const rotateX = useTransform(scrollYProgress, [0.2, 1], [26, 0])
  const y = useTransform(scrollYProgress, [0.2, 1], [80, 0])

  return (
    <section ref={ref} aria-label="Panelden bir kesit" className="dark relative z-10 text-[var(--ink)]">
      <motion.div style={still ? undefined : { clipPath: clip }} className="relative overflow-hidden bg-indigo-950">
        {/* Suluboya ışığı */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(var(--pine-soft),0.22),transparent)]" />
          <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] bg-[radial-gradient(closest-side,rgba(var(--gold),0.12),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 sm:px-10 sm:pb-32 sm:pt-36">
          <div className="grid items-end gap-8 md:grid-cols-12">
            <h2 className="font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.055em] text-slate-50 md:col-span-8">
              <RevealText text="Her Şey" />
              <br />
              <RevealText text="Tek Ekranda" delay={0.12} className="text-slate-400" />
            </h2>
            <p className="max-w-sm text-[15px] leading-[1.75] text-slate-300 md:col-span-4 md:justify-self-end">
              Danışanlar, Ajanda, Notlar ve Finans Aynı Menüde. Aradığın Her Şey Bir Tık Uzağında.
            </p>
          </div>

          <div className="mt-16 [perspective:1800px] sm:mt-20">
            <motion.div style={still ? undefined : { scale, rotateX, y, transformOrigin: 'center top' }}>
              <PreviewFrame caption="Derinay · Genel Bakış">
                <PanelPreview />
              </PreviewFrame>
            </motion.div>
          </div>

          <dl className="mt-20 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="font-mono text-[3.5rem] font-medium leading-none tracking-[-0.04em] text-slate-50 sm:text-[4.5rem]">
                  <CountUp to={f.n} />
                </dt>
                <dd className="mt-3 text-sm font-medium text-slate-300">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </section>
  )
}
