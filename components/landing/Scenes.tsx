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
  'font-display text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-slate-900 dark:text-white'

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
        <div className="lg:col-span-7">
          <FloatingFrame>
            <PreviewFrame caption="Derinay · Seans Defteri">
              <NotePreview />
            </PreviewFrame>
          </FloatingFrame>
        </div>

        <div className="mt-16 lg:col-span-5 lg:mt-0">
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">(04) Seans Defteri</p>
          <h2 className={`mt-5 ${H2_SCENE}`}>
            <RevealText text="Defter Önce, Fatura Sonra" />
          </h2>
          <Reveal delay={0.15} className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
            <p>
              Her not bir tür ve bir duyguyla kaydedilir. SOAP, ilk görüşme ve BDT şablonları hazır
              bekler; yazarken yarım kalırsa taslak korunur, sekmeyi kapatsan bile kaybolmaz.
            </p>
            <p>
              Haftalar biriktikçe duygu izleği bir eğriye dönüşür. Tedavi hedefleri ve ölçek puanları
              aynı sayfada durur. İlerlemeyi anlatmak için hafızana yüklenmen gerekmez.
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
    <section id="finans" className="relative z-10 scroll-mt-24 px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-20">
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">(05) Finans</p>
          <h2 className={`mt-5 ${H2_SCENE}`}>
            <RevealText text="Hesap Kendiliğinden Çıkar" />
          </h2>
          <Reveal delay={0.15} className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
            <p>
              Danışanı seç, ücreti yaz. Makbuz bir ekranda kesilir; numara sıradan devam eder,
              önizleme açılır, Yazdır dediğinde PDF çıkar. Kurulacak ek bir program yok.
            </p>
            <p>
              Arkada KDV, stopaj ve tahmini gelir vergisi sen istemeden hesaplanır. Vadesi geçen bir
              makbuz sen sayfayı açtığın anda kendini gecikmiş işaretler; takip etmen gerekmez.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 lg:col-span-7 lg:mt-0">
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
  { title: 'Parola Kilidi', body: 'Panel tek parolayla açılır. Danışan verisi giriş yapılmadan hiçbir yolla görünmez.' },
  { title: 'Gizlilik Modu', body: 'Tek kısayolla isimler, iletişim ve tutarlar bulanır. Danışan karşı koltuktayken ekranı çevirebilirsin.' },
  { title: 'Yedek ve Geri Yükleme', body: 'Tüm veri tek dosyada iner, on bir tablo ayrı CSV olarak alınır. Geri yükleme tek işlemdir: ya hepsi ya hiçbiri.' },
  { title: 'Belge Senin Deponda', body: 'Onam formu, test ve rapor dosyaları panele yüklenmez; yalnızca kendi bulutundaki bağlantısı tutulur.' },
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
        <p className="font-mono text-[11px] text-slate-400">(06) Emanet</p>
        <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.06em] text-slate-50">
          <RevealText text="Veri Sende Kalır" />
        </h2>
        <Reveal delay={0.15}>
          <p className="mt-7 max-w-xl text-[15.5px] leading-[1.75] text-slate-300">
            Bir Psikoloğun Tuttuğu Kayıt, Tuttuğu En Hassas Kayıttır. Derinay Bunu Vaatle Değil,
            Arayüzün Kendisiyle Çözer.
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
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">(07) Başlangıç</p>
          <h2 className="mt-5 max-w-4xl font-display text-[clamp(2.8rem,7.4vw,7.2rem)] font-bold leading-[0.92] tracking-[-0.06em] text-slate-900 dark:text-white">
            <RevealText text="Bugün Düzeni" />
            <br />
            <RevealText text="Kurmaya Başla" delay={0.12} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
              Danışanlarını Ekle, İlk Seansını Yaz, Gerisini Panel Tutsun.
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
