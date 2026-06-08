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
import CustomCursor from '@/components/CustomCursor'

export default function Home() {
  const spotlight = useSpotlight()

  return (
    <>
      <CustomCursor />
      <Header />

      <main className="relative min-h-screen overflow-hidden">
        <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlight }} />

        {/* Hero */}
        <section className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 pt-16 text-center">
          <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="max-w-3xl">
            <motion.div variants={fadeUp} className="mb-6 flex justify-center">
              <span className="chip">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Psikologlar için sakin finans yönetimi
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl"
            >
              Pratiğini yönet,{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                kafanı dinlendir
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
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95"
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
            <motion.h2 variants={fadeUp} className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pratiğin için her şey
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
                  <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{f.title}</h3>
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
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/12 text-sm font-bold text-indigo-400">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-bold text-slate-900 dark:text-white">{s.title}</h3>
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
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
            <h2 className="relative text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Bugün düzeni kurmaya başla
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-300">
              Danışanlarını ekle, ilk faturanı kes ve grafiklerin dolmasını izle.
            </p>
            <Link
              href="/dashboard"
              className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-95"
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
  { icon: Wallet, title: 'Gelir & gider takibi', desc: 'Kategori bazlı hareketler, aylık kırılım ve net kâr — tek bakışta.', accent: 'bg-emerald-500/12 text-emerald-500' },
  { icon: Users, title: 'Danışan yönetimi', desc: 'Danışan ekle, statü ve devam süresini izle, geçmişi tek yerde tut.', accent: 'bg-indigo-500/12 text-indigo-400' },
  { icon: StickyNote, title: 'Danışan notları', desc: 'Her danışan için güvenli, serbest notlar ve seans geçmişi.', accent: 'bg-violet-500/12 text-violet-400' },
  { icon: FileText, title: 'Fatura & KDV', desc: 'Tek tıkla fatura kes; KDV otomatik hesaplanır, statüyü takip et.', accent: 'bg-amber-500/12 text-amber-500' },
  { icon: Landmark, title: 'Vergi göstergesi', desc: 'Toplanan KDV ve tahmini gelir vergisiyle ödenecek tutarı gör.', accent: 'bg-rose-500/12 text-rose-500' },
  { icon: PieChart, title: 'Görsel dashboard', desc: 'Akıcı grafiklerle gelir-gider trendin ve kategorilerin canlanır.', accent: 'bg-sky-500/12 text-sky-500' },
]

const STEPS = [
  { title: 'Danışanlarını ekle', desc: 'Birkaç saniyede danışan kartlarını oluştur, seans ücretlerini belirle.' },
  { title: 'Gelir ve gideri gir', desc: 'Her hareketi kategorize et; faturaları kes, ödemeleri kaydet.' },
  { title: 'Tabloyu izle', desc: 'Dashboard ve vergi sayfası senin yerine hesaplar ve görselleştirir.' },
]
