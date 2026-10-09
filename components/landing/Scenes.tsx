'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'
import { PreviewFrame } from '@/components/marketing/PreviewFrame'
import { NotePreview } from '@/components/marketing/NotePreview'
import { ReceiptPreview } from '@/components/marketing/ReceiptPreview'
import { RevealText } from '@/components/motion/RevealText'
import { Reveal } from '@/components/motion/Reveal'
import { Magnetic } from '@/components/motion/Magnetic'
import { lineDraw } from '@/lib/variants'

const H2_SCENE =
  'font-display text-[clamp(2.2rem,3.6vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.05em] text-slate-900 dark:text-white'

/**
 * Kesit kaydırmayla kendi hızında süzülür. DÖNMEZ: döndürülen kesitteki
 * küçük metin dinlenme hâlinde bile yumuşak/bulanık rasterleşiyordu.
 */
function FloatingFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [90, -90])
  const still = useReducedMotion()
  return (
    <motion.div ref={ref} style={still ? undefined : { y }}>
      <Reveal variant="clip">{children}</Reveal>
    </motion.div>
  )
}

/** Seans Defteri — kesit solda, metin sağda */
export function NotebookScene() {
  return (
    <section id="defter" className="relative z-10 scroll-mt-24 px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-20">
        <div className="lg:col-span-6">
          <FloatingFrame>
            <PreviewFrame caption="Derinay · Seans Defteri">
              <NotePreview />
            </PreviewFrame>
          </FloatingFrame>
        </div>

        <div className="mt-16 lg:col-span-6 lg:mt-0">
          <h2 className={H2_SCENE}>
            <RevealText text="Her Seansın Bir Sayfası Var" />
          </h2>
          <Reveal delay={0.15} className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-600 dark:text-slate-400">
            <p>
              Her nota türünü ve danışanın ruh halini eklersin. SOAP, ilk görüşme ve BDT şablonları hazır; yarım kalan not otomatik kaydedilir, sayfayı kapatsan bile kaybolmaz.
            </p>
            <p>
              Haftalar geçtikçe ruh hali notları bir grafiğe dönüşür. Tedavi hedefleri ve test puanları da aynı sayfada. Danışanın nasıl ilerlediğini aklında tutmak zorunda kalmazsın.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** Finans — ayna: metin solda, kesit sağda */
export function FinanceScene() {
  return (
    <section id="finans" className="band-sand relative z-10 scroll-mt-24 px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-20">
        <div className="lg:col-span-6">
          <h2 className={H2_SCENE}>
            <RevealText text="Hesapları Panel Yapar" />
          </h2>
          <Reveal delay={0.15} className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-600 dark:text-slate-400">
            <p>
              Danışanı seç, ücreti yaz. Makbuz tek ekranda hazırlanır, numarası otomatik verilir; Yazdır’a bastığında PDF olarak iner. Ayrıca bir program kurman gerekmez.
            </p>
            <p>
              KDV, stopaj ve tahmini gelir vergisi arka planda kendiliğinden hesaplanır. Ödemesi geciken makbuzlar otomatik işaretlenir; ayrıca takip etmen gerekmez.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 lg:col-span-6 lg:mt-0">
          <FloatingFrame>
            <PreviewFrame caption="Derinay · Yeni Makbuz">
              <ReceiptPreview />
            </PreviewFrame>
          </FloatingFrame>
        </div>
      </div>
    </section>
  )
}

const TRUST = [
  { title: 'Şifre Koruması', body: 'Panel şifreyle açılır. Giriş yapılmadan danışan bilgilerine hiçbir şekilde ulaşılamaz.' },
  { title: 'Gizlilik Modu', body: 'Tek tuşla isimler, iletişim bilgileri ve tutarlar bulanıklaşır. Yanında biri varken ekranı rahatça gösterebilirsin.' },
  { title: 'Yedek ve Geri Yükleme', body: 'Tüm verilerini tek dosya olarak ya da Excel’de açılan CSV dosyaları olarak indirebilirsin. Geri yükleme yarım kalmaz: ya hepsi yüklenir ya hiçbiri.' },
  { title: 'Belgeler Senin Elinde', body: 'Onam formları ve raporlar panele yüklenmez; yalnızca Google Drive veya iCloud’daki bağlantıları saklanır.' },
] as const

/**
 * Emanet — ikinci gece adası. Taahhüt satırları: terim solda, karşılığı
 * sağda. Arkada dev orkide kaydırmayla döner — imzalanmış bir mühür gibi.
 */
export function TrustScene() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-30, 60])
  const still = useReducedMotion()

  return (
    <section
      id="guven"
      ref={ref}
      className="dark relative z-10 scroll-mt-0 overflow-hidden bg-indigo-950 px-6 py-28 text-[var(--ink)] sm:px-10 sm:py-40"
    >
      <motion.div
        aria-hidden
        // y: '-50%' style İÇİNDE: Framer satır içi transform yazınca Tailwind'in
        // -translate-y-1/2 sınıfı eziliyor, mühür 23rem aşağı kayıyordu.
        style={still ? { y: '-50%' } : { rotate, y: '-50%' }}
        className="pointer-events-none absolute -right-40 top-1/2 h-[46rem] w-[46rem] text-white/[0.035]"
      >
        <BloomMark className="h-full w-full" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl">
        <h2 className="max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[1] tracking-[-0.06em] text-slate-50">
          <RevealText text="Bilgilerin Güvende" />
        </h2>
        <Reveal delay={0.15}>
          <p className="mt-7 max-w-xl text-[15.5px] leading-[1.75] text-slate-300">
            Danışan Bilgileri En Hassas Bilgilerdir. Derinay Onları Korumak İçin Tasarlandı.
          </p>
        </Reveal>

        <dl className="mt-20">
          {TRUST.map((t, i) => (
            <div key={t.title} className="relative grid gap-3 py-9 sm:grid-cols-12 sm:gap-10">
              {/* <dl> satırında yalnız dt/dd olabilir: çizgi ve numara dt'nin içinde */}
              <dt className="flex items-baseline gap-6 font-display text-[1.6rem] font-bold leading-tight tracking-[-0.04em] text-slate-50 sm:col-span-5 sm:gap-10 sm:text-[1.9rem]">
                <motion.span
                  aria-hidden
                  variants={lineDraw}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-white/15"
                />
                <span aria-hidden className="w-6 shrink-0 font-mono text-xs font-normal tracking-normal text-amber-300/80">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <RevealText text={t.title} />
              </dt>
              <dd className="text-[15.5px] leading-[1.75] text-slate-300 sm:col-span-7">
                <Reveal delay={0.1}>{t.body}</Reveal>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** Kapanış — dev çağrı + mıknatıslı yuvarlak düğme */
export function Closing() {
  return (
    <section className="relative z-10 px-6 py-32 sm:px-10 sm:py-48">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="max-w-4xl font-display text-[clamp(2.8rem,7.4vw,7.2rem)] font-bold leading-[1] tracking-[-0.06em] text-slate-900 dark:text-white">
            <RevealText text="Düzenini Kurmaya" />
            <br />
            <RevealText text="Bugün Başla" delay={0.12} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-[15.5px] leading-[1.75] text-slate-600 dark:text-slate-400">
              Danışanlarını Ekle, İlk Seansını Planla; Gerisini Panel Halleder.
            </p>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={0.25} className="shrink-0">
          <Magnetic strength={0.4}>
            <Link
              href="/login"
              className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 sm:h-48 sm:w-48"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-amber-500 transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
              />
              <span className="relative flex flex-col items-center gap-2 text-sm font-semibold transition-colors duration-500 group-hover:text-slate-900">
                <ArrowUpRight className="h-6 w-6 transition-transform duration-700 group-hover:rotate-45" />
                Giriş Yap
              </span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}
