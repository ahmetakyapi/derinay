'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Wallet,
  FileText,
  Landmark,
  StickyNote,
  PieChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { fadeUp, staggerContainer, EASE } from '@/lib/variants'
import { GlassCard } from '@/components/ui/GlassCard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function Home() {
  // Çam tonu spotlight — fare ile gezinen ışık
  const spotlight = useSpotlight(620, 'rgba(63,124,114,0.08)')

  return (
    <>
      <Header />

      <main className="relative min-h-screen overflow-hidden">
        <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlight }} />

        {/* Suluboya lekeleri — galeri atmosferi */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute -left-24 top-32 h-72 w-72 animate-float rounded-full bg-indigo-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute right-[-80px] top-64 h-80 w-80 animate-float-slow rounded-full bg-amber-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-rose-500/8 blur-3xl" />
          {/* Dev serif filigran */}
          <span className="absolute -right-10 top-[38%] hidden -translate-y-1/2 select-none font-display text-[26rem] font-semibold italic leading-none text-slate-900/[0.035] dark:text-white/[0.04] lg:block">
            D
          </span>
        </div>

        {/* Hero */}
        <section className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
          <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex justify-center">
              <span className="chip">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Psikologlar için sakin finans yönetimi
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-6 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl"
            >
              Pratiğini yönet,{' '}
              <span className="relative inline-block italic text-indigo-700 dark:text-indigo-300">
                kafanı dinlendir
                {/* El çizimi fırça vurgusu — çizilerek belirir */}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-500/70"
                  viewBox="0 0 200 9"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 6.5C40 2.5 120 1.5 198 5.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 0.9, ease: EASE }}
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-300 sm:text-lg"
            >
              Gelir-gider, faturalar, KDV ve gelir vergisi, danışan notları ve ödemeler —
              hepsi tek, huzurlu bir panelde. Danışanlarına odaklan, gerisini Derinay&apos;a bırak.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-95"
              >
                Panele git
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="glass rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:text-slate-900 dark:text-slate-300 dark:hover:text-white active:scale-95"
              >
                Özellikleri gör
              </a>
            </motion.div>
          </motion.div>

          {/* Soyut panel önizlemesi — yüzen tuval */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="relative z-10 mt-16 w-full max-w-xl"
          >
            <div className="animate-float-slow motion-reduce:animate-none">
              <GlassCard tilt glow className="p-5 text-left sm:p-6">
                {/* Pencere başlığı */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    derinay · genel bakış
                  </span>
                </div>

                {/* Mini KPI'lar */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Gelir', value: '₺48,2B', bar: 'from-emerald-500/80' },
                    { label: 'Gider', value: '₺15,5B', bar: 'from-rose-500/80' },
                    { label: 'Net', value: '₺32,7B', bar: 'from-indigo-500/80' },
                  ].map((k) => (
                    <div key={k.label} className="relative overflow-hidden rounded-xl border border-slate-500/10 bg-slate-500/[0.04] p-3">
                      <span className={`absolute left-3 top-0 h-[2.5px] w-8 rounded-b-full bg-gradient-to-r ${k.bar} to-transparent`} />
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
                      <p className="mt-1 font-display text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                        {k.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini akış grafiği — çizilerek belirir */}
                <div className="relative h-24 overflow-hidden rounded-xl border border-slate-500/10 bg-slate-500/[0.03] px-2">
                  <svg className="h-full w-full" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden>
                    <defs>
                      <linearGradient id="lpFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3f7c72" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3f7c72" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0 70 C40 62, 60 44, 95 48 S150 70, 185 56 S240 18, 280 26 S350 42, 400 22"
                      fill="none"
                      stroke="#3f7c72"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, delay: 0.4, ease: EASE }}
                    />
                    <path
                      d="M0 70 C40 62, 60 44, 95 48 S150 70, 185 56 S240 18, 280 26 S350 42, 400 22 L400 90 L0 90 Z"
                      fill="url(#lpFill)"
                    />
                  </svg>
                  <span className="absolute right-3 top-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-400">
                    12 aylık akış
                  </span>
                </div>

                {/* Mini hafta şeridi */}
                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
                    <div
                      key={d}
                      className={`rounded-lg border px-1 py-1.5 text-center ${
                        i === 2
                          ? 'border-indigo-500/40 bg-indigo-500/[0.07]'
                          : 'border-slate-500/10'
                      }`}
                    >
                      <p className="text-[8px] font-bold uppercase text-slate-400">{d}</p>
                      <div className="mt-1 flex justify-center gap-0.5">
                        {Array.from({ length: [2, 1, 3, 2, 1, 0, 0][i] }).map((_, j) => (
                          <span
                            key={j}
                            className={`h-1 w-1 rounded-full ${['bg-indigo-400', 'bg-emerald-400', 'bg-amber-400'][j % 3]}`}
                          />
                        ))}
                        {[2, 1, 3, 2, 1, 0, 0][i] === 0 && <span className="h-1 w-1 rounded-full bg-slate-500/20" />}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
            {/* Tuval gölgesi */}
            <div className="pointer-events-none absolute -bottom-8 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[100%] bg-slate-900/10 blur-2xl dark:bg-black/40" />
          </motion.div>
        </section>

        {/* Serif marquee — galeri yazıtı */}
        <section className="relative z-10 border-y border-slate-500/10 py-5" aria-hidden>
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center gap-10">
                  {[
                    'Danışan takibi',
                    'Seans Defteri',
                    'Duygu izleği',
                    'Fatura & KDV',
                    'Vergi özeti',
                    'Analiz & PDF rapor',
                    'Kişisel harcamalar',
                  ].map((w) => (
                    <span key={w} className="flex items-center gap-10 whitespace-nowrap">
                      <span className="font-display text-lg italic text-slate-500/90 dark:text-slate-400">{w}</span>
                      <span className="text-amber-500/70">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
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
              className="font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
            >
              Pratiğin için <span className="italic text-indigo-700 dark:text-indigo-300">her şey</span>
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
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}>
                <GlassCard tilt glow className="group h-full p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${f.accent}`}>
                      <f.icon className="h-5 w-5" />
                    </span>
                    {/* Galeri plaketi numarası */}
                    <span className="font-display text-sm italic text-slate-300 transition-colors group-hover:text-amber-500 dark:text-slate-600 dark:group-hover:text-amber-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
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
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/12 font-display text-base font-semibold italic text-amber-600 dark:text-amber-400">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
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
            <span className="pointer-events-none absolute left-6 top-5 select-none font-display text-6xl italic text-amber-500/15" aria-hidden>
              “
            </span>
            <h2 className="relative font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Bugün <span className="italic">düzeni</span> kurmaya başla
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-300">
              Danışanlarını ekle, ilk faturanı kes ve grafiklerin dolmasını izle.
            </p>
            <Link
              href="/dashboard"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95"
            >
              Panele git <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  )
}

const FEATURES = [
  { icon: Wallet, title: 'Gelir & gider takibi', desc: 'Kategori bazlı hareketler, aylık kırılım ve net kâr — tek bakışta.', accent: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' },
  { icon: Users, title: 'Danışan yönetimi', desc: 'Danışan ekle, statü ve devam süresini izle, geçmişi tek yerde tut.', accent: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400' },
  { icon: StickyNote, title: 'Seans Defteri', desc: 'Tür ve duygu etiketli notlar; danışanın duygu izleği gözünün önünde.', accent: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
  { icon: FileText, title: 'Fatura & KDV', desc: 'Tek tıkla fatura kes; KDV otomatik hesaplanır, statüyü takip et.', accent: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  { icon: Landmark, title: 'Vergi göstergesi', desc: 'Toplanan KDV ve tahmini gelir vergisiyle ödenecek tutarı gör.', accent: 'bg-rose-500/12 text-rose-600 dark:text-rose-400' },
  { icon: PieChart, title: 'Analiz & PDF rapor', desc: 'Yıllık akış, kümülatif birikim ve muhasebeci dostu PDF raporlar.', accent: 'bg-sky-500/12 text-sky-600 dark:text-sky-400' },
]

const STEPS = [
  { title: 'Danışanlarını ekle', desc: 'Birkaç saniyede danışan kartlarını oluştur, seans ücretlerini belirle.' },
  { title: 'Gelir ve gideri gir', desc: 'Her hareketi kategorize et; faturaları kes, ödemeleri kaydet.' },
  { title: 'Tabloyu izle', desc: 'Dashboard ve vergi sayfası senin yerine hesaplar ve görselleştirir.' },
]
