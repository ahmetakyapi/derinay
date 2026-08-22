'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, MotionConfig } from 'framer-motion'
import {
  Users,
  Wallet,
  FileText,
  Landmark,
  StickyNote,
  PieChart,
  ArrowRight,
  ShieldCheck,
  Calculator,
  HeartHandshake,
} from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { brushWipe, fadeUp, staggerContainer, EASE } from '@/lib/variants'
import { GlassCard } from '@/components/ui/GlassCard'
import { BloomMark } from '@/components/brand/BloomMark'
import { BloomArt } from '@/components/art/BloomArt'
import { BrushSweep } from '@/components/brand/Brush'
import { PanelPreview } from '@/components/marketing/PanelPreview'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function Home() {
  // Çam tonu spotlight — fare ile gezinen ışık
  const spotlight = useSpotlight(620, 'rgba(var(--pine), 0.08)')
  // Sayfa kaydırma ilerleme çubuğu — üstte ince altın şerit
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-amber-400 to-rose-400"
      />
      <Header />

      <main id="lp-main" tabIndex={-1} className="relative min-h-screen overflow-hidden outline-none">
        <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlight }} />

        {/* Suluboya lekeleri — galeri atmosferi */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute -left-24 top-32 h-72 w-72 animate-float rounded-full bg-indigo-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute right-[-80px] top-64 h-80 w-80 animate-float-slow rounded-full bg-amber-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-rose-500/8 blur-3xl" />
          {/* Dev orkide filigranı */}
          <BloomMark className="absolute -right-16 top-[38%] hidden h-[34rem] w-[34rem] -translate-y-1/2 -rotate-12 text-slate-900/[0.035] dark:text-white/[0.04] lg:block" />
          <BloomArt className="absolute -left-8 bottom-24 hidden h-72 w-56 opacity-70 lg:block" delay={0.6} />
        </div>

        {/* ── Hero ────────────────────────────────────────────────────────
            TASARIM NOTU: iddia ve ÜRÜN tek sahnede. Eskiden hero'da küçük
            soyut bir maket, sayfanın ortasında da ayrı bir "Panele Bir Bakış"
            bölümü vardı; ikisi de aynı şeyi yarım yamalak söylüyordu. Artık
            manşetin hemen altında geniş, gerçek panel duruyor — ziyaretçi ilk
            ekranda ürünü görüyor. Rozet/kicker yok: manşet kendi ağırlığını
            taşır. Tek yazarlı hareket: panel yükselip yerine oturur. */}
        <section className="relative z-10 px-6 pb-20 pt-28 sm:pt-32">
          <motion.div
            variants={staggerContainer(0.09)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-[2.75rem] font-bold leading-[1.04] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-6xl md:text-[4.25rem]"
            >
              Pratiğini yönet,
              <br />
              kafanı{' '}
              <span className="relative inline-block">
                {/* Boya sürüşü kelimenin ARKASINDA, taban hizasında — jest
                    manşetle aynı anda gelir; ayrı bir efekt değil, aynı an. */}
                <motion.span
                  aria-hidden
                  variants={brushWipe}
                  className="pointer-events-none absolute inset-x-[-4%] bottom-[0.1em] top-[0.44em] origin-left text-amber-500"
                >
                  <BrushSweep className="h-full w-full" />
                </motion.span>
                <span className="relative text-indigo-700 dark:text-indigo-300">dinlendir</span>
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-300 sm:text-lg"
            >
              Gelir-gider, serbest meslek makbuzu, KDV-stopaj, danışan notları ve ödemeler —
              hepsi tek, sakin bir panelde.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98]"
              >
                Panele Git
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
              >
                Özellikleri Gör
              </a>
            </motion.div>
          </motion.div>

          {/* Ürün — sahnenin ağırlık merkezi */}
          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            className="relative mx-auto mt-16 w-full max-w-5xl"
          >
            {/* Zemin ışıması — panelin altından yükselen kâğıt sıcaklığı */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-10 bottom-8 -z-10 bg-gradient-to-b from-indigo-500/10 via-amber-500/[0.06] to-transparent blur-3xl"
            />
            <div className="glass overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  derinay · genel bakış
                </span>
              </div>
              {/* Ekran görüntüsü DEĞİL — kodla çizilir (bkz. PanelPreview) */}
              <div className="overflow-hidden rounded-xl bg-[rgba(var(--paper),0.35)]">
                <PanelPreview />
              </div>
            </div>
            {/* Tuval gölgesi — paneli kâğıttan ayırır */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-[100%] bg-slate-900/10 blur-2xl dark:bg-black/50"
            />
          </motion.div>
        </section>

        {/* Serif marquee — galeri yazıtı */}
        <section className="relative z-10 border-y border-slate-500/10 py-5" aria-hidden>
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-10">
                  {[
                    'Danışan Takibi',
                    'Seans Defteri',
                    'Duygu Takibi',
                    'Makbuz & Stopaj',
                    'Seans Paketi',
                    'Vergi Özeti',
                    'Analiz & PDF Rapor',
                    'Kişisel Harcamalar',
                  ].map((w) => (
                    <span key={w} className="flex items-center gap-10 whitespace-nowrap">
                      <span className="font-display text-lg font-semibold text-slate-500/90 dark:text-slate-400">{w}</span>
                      <span className="text-amber-500/70">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Değer şeridi — ilke odaklı, özelliklerden farklı */}
        <section className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-4 sm:grid-cols-3"
          >
            {VALUES.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="flex items-start gap-3.5">
                <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${v.accent}`}>
                  <v.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Özellikler */}
        <section id="features" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-12 text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.5rem]"
            >
              Pratiğin İçin <span className="text-indigo-700 dark:text-indigo-300">Her Şey</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-slate-400">
              Finanstan danışan takibine kadar tüm iş yükünü tek yerde topla.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Numaralandırma YOK: sıra hiçbir bilgi taşımıyordu, yalnız süstü. */}
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <GlassCard glow className="group h-full p-6">
                  <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${f.accent}`}>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Nasıl çalışır — kesik çizgiyle bağlı üç adım */}
        <section id="how" className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-6 py-20">
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative grid gap-6 md:grid-cols-3"
          >
            {/* Bağlantı çizgisi */}
            <div
              className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-slate-500/20 md:block"
              aria-hidden
            />
            {STEPS.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} className="glass relative rounded-2xl p-6">
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/12 font-display text-base font-bold text-amber-600 dark:text-amber-400">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="surface relative overflow-hidden rounded-3xl px-8 py-14 text-center"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 animate-pulse-slow rounded-full bg-indigo-500/15 blur-3xl motion-reduce:animate-none" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 animate-pulse-slow rounded-full bg-amber-500/15 blur-3xl [animation-delay:2s] motion-reduce:animate-none" />
            <span className="pointer-events-none absolute left-6 top-5 select-none font-display text-6xl font-bold text-amber-500/15" aria-hidden>
              “
            </span>
            <h2 className="relative font-display text-2xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-4xl">
              Bugün <span className="text-indigo-700 dark:text-indigo-300">Düzeni</span> Kurmaya Başla
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-300">
              Danışanlarını ekle, ilk makbuzunu kes ve grafiklerin dolmasını izle.
            </p>
            <Link
              href="/dashboard"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95"
            >
              Panele Git <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </MotionConfig>
  )
}

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'KVKK Senin Kontrolünde',
    desc: 'Danışan onamı kayıt altında; fotoğraf ve belgeler senin kendi deponda kalır.',
    accent: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: Calculator,
    title: 'Vergi Kendiliğinden Hesaplanır',
    desc: 'KDV, stopaj ve tahmini gelir vergisi makbuzla birlikte otomatik çıkar.',
    accent: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  },
  {
    icon: HeartHandshake,
    title: 'Sakin, Odaklı Arayüz',
    desc: 'Galeri estetiğinde, gözü yormayan bir panel — işin değil, danışanın merkezde.',
    accent: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  },
] as const

const FEATURES = [
  { icon: Wallet, title: 'Gelir & Gider Takibi', desc: 'Kategori bazlı hareketler, aylık kırılım ve net kâr — tek bakışta.', accent: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' },
  { icon: Users, title: 'Danışan Yönetimi', desc: 'Danışan ekle, statü ve devam süresini izle, geçmişi tek yerde tut.', accent: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400' },
  { icon: StickyNote, title: 'Seans Defteri', desc: 'Tür ve duygu etiketli notlar; danışanın duygu izleği gözünün önünde.', accent: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
  { icon: FileText, title: 'Makbuz & Stopaj', desc: 'Tek tıkla serbest meslek makbuzu kes; KDV ve stopaj otomatik hesaplanır.', accent: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  { icon: Landmark, title: 'Vergi Göstergesi', desc: 'Toplanan KDV, kesilen stopaj ve tahmini gelir vergisini tek bakışta gör.', accent: 'bg-rose-500/12 text-rose-600 dark:text-rose-400' },
  { icon: PieChart, title: 'Analiz & PDF Rapor', desc: 'Yıllık akış, kümülatif birikim ve muhasebeci dostu PDF raporlar.', accent: 'bg-sky-500/12 text-sky-600 dark:text-sky-400' },
]

const STEPS = [
  { title: 'Danışanlarını Ekle', desc: 'Birkaç saniyede danışan kartlarını oluştur, seans ücretlerini belirle.' },
  { title: 'Gelir ve Gideri Gir', desc: 'Her hareketi kategorize et; makbuzları kes, ödemeleri kaydet.' },
  { title: 'Tabloyu İzle', desc: 'Genel Bakış ve Vergiler sayfası senin yerine hesaplar ve görselleştirir.' },
]
