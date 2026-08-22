'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, MotionConfig } from 'framer-motion'
import {
  ArrowRight,
  Users,
  CalendarRange,
  StickyNote,
  FileText,
  Wallet,
  PieChart,
  ShieldCheck,
  DatabaseBackup,
  EyeOff,
  Lock,
  FileDown,
} from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { brushWipe, fadeUp, staggerContainer, EASE } from '@/lib/variants'
import { BloomMark } from '@/components/brand/BloomMark'
import { BloomArt } from '@/components/art/BloomArt'
import { BrushSweep, BrushPull } from '@/components/brand/Brush'
import { PanelPreview } from '@/components/marketing/PanelPreview'
import { PreviewFrame } from '@/components/marketing/PreviewFrame'
import { ReceiptPreview } from '@/components/marketing/ReceiptPreview'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

/**
 * Landing.
 *
 * TON: Sayfa bir muhasebe broşürü değil, ÜRÜNÜN kendisini anlatır. Manşet
 * faydayı söyler ("kafanı dinlendir"), mevzuat detayı (KDV, stopaj, beyan)
 * öne çıkmaz — finans bölümünün içinde, sırası gelince geçer.
 *
 * NEFES: Bölümler geniş dikey boşlukla ayrılır (py-28 → py-36). Sayfanın
 * yarısı boşluktur; "sakin panel" vaadini sayfanın kendisi taşır.
 *
 * TEK YAZARLI HAREKET: sol kenardaki mürekkep omurgası kaydırmayla boyanır.
 * Bölümlerin ayrı giriş animasyonu YOK.
 */

/** Panelin içindekiler — kart ızgarası değil, editoryal liste */
const CAPABILITIES = [
  { icon: Users, title: 'Danışan Dosyası', body: 'İletişim, etiket, seans ücreti, onam durumu ve tüm geçmiş tek kartta.' },
  { icon: CalendarRange, title: 'Ajanda', body: 'Haftalık saat ızgarası. Seansı sürükleyip bırak; çakışmayı panel söyler.' },
  { icon: StickyNote, title: 'Seans Defteri', body: 'Tür ve duygu etiketli notlar, SOAP şablonları, zamanla çıkan duygu izleği.' },
  { icon: Wallet, title: 'Gelir & Gider', body: 'Kategori bazlı hareketler, sabit kalemleri tek tıkla sonraki aya kopyalama.' },
  { icon: FileText, title: 'Makbuz', body: 'Serbest meslek makbuzu bir ekranda kesilir, tarayıcıdan PDF çıkar.' },
  { icon: PieChart, title: 'Analiz & Rapor', body: 'Yıllık akış, kümülatif birikim, muhasebeciye giden tek dosya.' },
] as const

const DAY_MOMENTS = [
  {
    time: 'Sabah',
    title: 'Günü Açarken',
    body: 'Bugünün seansları, notu eksik kalan geçen haftaki kayıt, bitmek üzere olan paket ve sessizleşen danışan — hepsi karşılama ekranında. Aramana gerek yok.',
  },
  {
    time: 'Seans Arası',
    title: 'Defteri Tutarken',
    body: 'Not, tür ve duygu ile birlikte düşer. Yarım kalırsa taslak korunur. Duygu izleği zamanla bir eğriye dönüşür; ilerlemeyi anlatmak için hafıza gerekmez.',
  },
  {
    time: 'Ay Sonu',
    title: 'Hesabı Kapatırken',
    body: 'Makbuzlar, tahsilat ve vergi tek sayfada toplanır. Muhasebeciye giden yıllık rapor tarayıcıdan çıkar; kurulacak bir program yok.',
  },
] as const

const TRUST = [
  { icon: Lock, title: 'Parola Kilidi', body: 'Panel tek parolayla açılır. Danışan verisi giriş yapılmadan hiçbir yolla görünmez.' },
  { icon: EyeOff, title: 'Gizlilik Modu', body: 'Tek kısayolla isimler, iletişim ve tutarlar bulanır. Danışan karşı koltuktayken ekranı çevirebilirsin.' },
  { icon: DatabaseBackup, title: 'Yedek ve Geri Yükleme', body: 'Tüm veri tek dosyada iner, on bir tablo ayrı CSV olarak alınır. Geri yükleme tek işlemdir: ya hepsi ya hiçbiri.' },
  { icon: FileDown, title: 'Belge Senin Deponda', body: 'Onam formu, test ve rapor dosyaları panele yüklenmez; yalnızca kendi bulutundaki bağlantısı tutulur.' },
] as const

export default function Home() {
  const spotlight = useSpotlight(620, 'rgba(var(--pine), 0.08)')
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

        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute -left-24 top-32 h-72 w-72 animate-float rounded-full bg-indigo-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute right-[-80px] top-64 h-80 w-80 animate-float-slow rounded-full bg-amber-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute bottom-40 left-1/3 h-64 w-64 rounded-full bg-rose-500/8 blur-3xl" />
          <BloomMark className="absolute -right-16 top-[38%] hidden h-[34rem] w-[34rem] -translate-y-1/2 -rotate-12 text-slate-900/[0.035] dark:text-white/[0.04] lg:block" />
          <BloomArt className="absolute -left-8 bottom-24 hidden h-72 w-56 opacity-70 lg:block" delay={0.6} />
        </div>

        {/* Mürekkep omurgası — sayfanın tek yazarlı hareketi */}
        <motion.div
          aria-hidden
          style={{ scaleY: progress }}
          className="pointer-events-none fixed bottom-24 left-6 top-24 z-10 hidden w-[10px] origin-top text-slate-900/25 dark:text-white/20 xl:block"
        >
          <BrushPull className="h-full w-full" />
        </motion.div>

        {/* ── Hero ─────────────────────────────────────────────────────────
            Manşet FAYDAYI söyler. Mevzuat sözcüğü (KDV, stopaj) burada geçmez;
            onların yeri finans bölümü. */}
        <section className="relative z-10 px-6 pb-24 pt-32 sm:pb-32 sm:pt-40">
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-[3rem] font-bold leading-[0.98] tracking-[-0.05em] text-slate-900 dark:text-white sm:text-[4.25rem] md:text-[5.25rem]"
            >
              Pratiğini yönet,
              <br />
              kafanı{' '}
              <span className="relative inline-block">
                <motion.span
                  aria-hidden
                  variants={brushWipe}
                  /* Konum ÖLÇÜLDÜ, tahmin edilmedi: span kutusunda taban çizgisi
                     0.853em'de (yarım-leading -0.135em + ascent 0.988em). Fırça
                     tabanın 0.10em üstünden 0.14em altına iner — harflerin altını
                     yalar. Ortaya hizalanırsa "üstü çizili" gibi okunuyor. */
                  className="pointer-events-none absolute inset-x-[-5%] bottom-[-0.02em] top-[0.75em] origin-left text-amber-500"
                >
                  <BrushSweep className="h-full w-full" />
                </motion.span>
                <span className="relative text-indigo-700 dark:text-indigo-300">dinlendir</span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-xl text-[1.0625rem] leading-[1.75] text-slate-500 dark:text-slate-300 sm:text-lg"
            >
              Danışanların, ajandan, seans defterin ve tüm finansın tek yerde. Sakin, sade ve
              yalnızca senin için kurulmuş bir çalışma masası.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 active:scale-[0.98]"
              >
                Panele Git
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#panel"
                className="inline-flex items-center rounded-xl px-5 py-4 text-sm font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
              >
                Neler Var
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            className="relative mx-auto mt-20 w-full max-w-5xl sm:mt-24"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-10 bottom-8 -z-10 bg-gradient-to-b from-indigo-500/10 via-amber-500/[0.06] to-transparent blur-3xl"
            />
            <PreviewFrame caption="derinay · genel bakış">
              <PanelPreview />
            </PreviewFrame>
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-[100%] bg-slate-900/10 blur-2xl dark:bg-black/50"
            />
            <p className="mt-7 text-center text-xs text-slate-400">
              Ekran görüntüsü değil — panelin kendisi, örnek verilerle çizildi.
            </p>
          </motion.div>
        </section>

        {/* ── Panelde ne var ──────────────────────────────────────────────
            Kart ızgarası DEĞİL: saç çizgisiyle ayrılmış editoryal liste. */}
        <section id="panel" className="relative z-10 scroll-mt-24 px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.25rem]">
              Bir pratiğin döndüğü{' '}
              <span className="text-indigo-700 dark:text-indigo-300">her şey</span> burada
            </h2>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
              Ayrı ayrı defterler, tablolar ve klasörler yerine tek panel. Hepsi birbirini bilir:
              seansı kaydettiğinde takvim, gelir ve danışan dosyası birlikte güncellenir.
            </p>

            <div className="mt-16 grid gap-x-14 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((c) => (
                <div key={c.title} className="border-t border-slate-500/15 pt-6">
                  <c.icon aria-hidden className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gün ─────────────────────────────────────────────────────── */}
        <section className="relative z-10 border-y border-slate-500/10 bg-[rgba(var(--paper),0.4)] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.25rem]">
              Panel günü okur,
              <br />
              sen <span className="text-indigo-700 dark:text-indigo-300">aramazsın</span>
            </h2>
            <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
              {DAY_MOMENTS.map((m) => (
                <div key={m.time} className="border-t border-slate-500/15 pt-6">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                    {m.time}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {m.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Finans ──────────────────────────────────────────────────────
            Mevzuat detayı YALNIZCA burada ve gövde metninin içinde geçer;
            başlık faydayı söyler. */}
        <section id="finans" className="relative z-10 scroll-mt-24 px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-16">
            <div className="lg:col-span-5">
              <h2 className="font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.25rem]">
                Hesap <span className="text-indigo-700 dark:text-indigo-300">kendiliğinden</span> çıkar
              </h2>
              <div className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                <p>
                  Danışanı seç, ücreti yaz. Makbuz bir ekranda kesilir; numara sıradan devam eder,
                  önizleme açılır, Yazdır dediğinde PDF çıkar. Ayrıca kurulacak bir program yok.
                </p>
                <p>
                  Arkada KDV, stopaj ve tahmini gelir vergisi sen istemeden hesaplanır. Vadesi geçen
                  bir makbuz sen sayfayı açtığın anda kendini gecikmiş işaretler; takip etmen gerekmez.
                </p>
              </div>
            </div>

            <div className="mt-14 lg:col-span-7 lg:mt-0">
              <PreviewFrame caption="derinay · yeni makbuz">
                <ReceiptPreview />
              </PreviewFrame>
            </div>
          </div>
        </section>

        {/* ── Emanet ──────────────────────────────────────────────────── */}
        <section id="guven" className="relative z-10 scroll-mt-24 border-t border-slate-500/10 bg-[rgba(var(--paper),0.35)] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.25rem]">
              Veri <span className="text-indigo-700 dark:text-indigo-300">sende</span> kalır
            </h2>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
              Bir psikoloğun tuttuğu kayıt, tuttuğu en hassas kayıttır. Derinay bunu bir vaat olarak
              değil, arayüzün kendisi olarak çözer.
            </p>
            <div className="mt-16 grid gap-x-14 gap-y-12 sm:grid-cols-2">
              {TRUST.map((t) => (
                <div key={t.title} className="border-t border-slate-500/15 pt-6">
                  <t.icon aria-hidden className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kapanış ─────────────────────────────────────────────────── */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center sm:py-40">
          <ShieldCheck aria-hidden className="mx-auto h-6 w-6 text-amber-500/70" />
          <h2 className="mt-8 font-display text-[2.25rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3rem]">
            Bugün <span className="text-indigo-700 dark:text-indigo-300">düzeni</span> kurmaya başla
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
            Danışanlarını ekle, ilk seansını yaz, gerisini panel tutsun.
          </p>
          <Link
            href="/dashboard"
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.98]"
          >
            Panele Git
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>

      <Footer />
    </MotionConfig>
  )
}
