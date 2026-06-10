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
import { fadeUp, staggerContainer } from '@/lib/variants'
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
          <div className="absolute -left-24 top-32 h-72 w-72 animate-float rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute right-[-80px] top-64 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl [animation:float_8s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-rose-500/8 blur-3xl" />
          {/* Dev serif filigran */}
          <span className="absolute -right-10 top-1/2 hidden -translate-y-1/2 select-none font-display text-[26rem] font-semibold italic leading-none text-slate-900/[0.035] dark:text-white/[0.04] lg:block">
            D
          </span>
        </div>

        {/* Hero */}
        <section className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pt-16 text-center">
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
                {/* El çizimi fırça vurgusu */}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-500/70"
                  viewBox="0 0 200 9"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 6.5C40 2.5 120 1.5 198 5.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
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
        </section>

        {/* Özellikler */}
        <section id="features" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
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
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp}>
                <GlassCard tilt glow className="h-full p-6">
                  <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.accent}`}>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Nasıl çalışır */}
        <section id="how" className="relative z-10 mx-auto max-w-5xl scroll-mt-24 px-6 py-20">
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 md:grid-cols-3"
          >
            {STEPS.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} className="glass rounded-2xl p-6">
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
            className="surface relative overflow-hidden rounded-3xl px-8 py-14 text-center"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
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
  { icon: StickyNote, title: 'Danışan notları', desc: 'Her danışan için güvenli, serbest notlar ve seans geçmişi.', accent: 'bg-violet-500/12 text-violet-600 dark:text-violet-400' },
  { icon: FileText, title: 'Fatura & KDV', desc: 'Tek tıkla fatura kes; KDV otomatik hesaplanır, statüyü takip et.', accent: 'bg-amber-500/12 text-amber-600 dark:text-amber-400' },
  { icon: Landmark, title: 'Vergi göstergesi', desc: 'Toplanan KDV ve tahmini gelir vergisiyle ödenecek tutarı gör.', accent: 'bg-rose-500/12 text-rose-600 dark:text-rose-400' },
  { icon: PieChart, title: 'Görsel dashboard', desc: 'Akıcı grafiklerle gelir-gider trendin ve kategorilerin canlanır.', accent: 'bg-sky-500/12 text-sky-600 dark:text-sky-400' },
]

const STEPS = [
  { title: 'Danışanlarını ekle', desc: 'Birkaç saniyede danışan kartlarını oluştur, seans ücretlerini belirle.' },
  { title: 'Gelir ve gideri gir', desc: 'Her hareketi kategorize et; faturaları kes, ödemeleri kaydet.' },
  { title: 'Tabloyu izle', desc: 'Dashboard ve vergi sayfası senin yerine hesaplar ve görselleştirir.' },
]
