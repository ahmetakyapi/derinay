'use client'

import Link from 'next/link'
import { motion, useScroll, useSpring, MotionConfig } from 'framer-motion'
import { ArrowRight, ShieldCheck, DatabaseBackup, EyeOff, Lock, FileDown } from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { brushWipe, fadeUp, staggerContainer, EASE } from '@/lib/variants'
import { BloomMark } from '@/components/brand/BloomMark'
import { BloomArt } from '@/components/art/BloomArt'
import { BrushSweep, BrushPull } from '@/components/brand/Brush'
import { PanelPreview } from '@/components/marketing/PanelPreview'
import { PreviewFrame } from '@/components/marketing/PreviewFrame'
import { ReceiptPreview } from '@/components/marketing/ReceiptPreview'
import { calcMakbuz } from '@/lib/finance'
import { formatTRY } from '@/lib/format'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { cn } from '@/lib/utils'

/**
 * Landing — "Kanıt Defteri".
 *
 * TEZ: Ziyaretçi bir psikolog. Onu özellik listesi değil, KENDİ İŞİNİN iki anı
 * ikna eder: brüt ücretin stopaj ve KDV'ye ayrıldığı makbuz ekranı ve ay sonunun
 * üç rakama indiği vergi özeti. Bu yüzden sayfanın iskeleti kart ızgarası değil
 * SAHNE dizisidir.
 *
 * ÇİZİM BORCU BİLİNÇLİ SINIRLI: yalnızca İKİ kod-çizim var (hero'daki panel ve
 * makbuz kesiti). Vergi bölümü ekran çizmez, rakamı tipografiyle anlatır — dört
 * ayrı önizleme, panel değişince eskiyip "kanıt" iddiasını tersine çevirirdi.
 *
 * TEK YAZARLI HAREKET: sol kenardaki mürekkep omurgası kaydırma ilerlemesiyle
 * boyanır. Bölümlerin kendi giriş animasyonları YOK.
 */

// Kanıt şeridi — panelin KENDİ hesabından üretilir, elle yazılmaz
const DEMO_BRUT = 4000
const DEMO = calcMakbuz(DEMO_BRUT, 20, 20)

const PROOF_CELLS = [
  { value: formatTRY(DEMO_BRUT), label: 'Brüt Ücret', tone: 'text-slate-900 dark:text-white' },
  { value: `−${formatTRY(DEMO.stopajAmount)}`, label: 'Stopaj %20', tone: 'text-rose-600 dark:text-rose-400' },
  { value: formatTRY(DEMO.netUcret), label: 'Net Ücret', tone: 'text-slate-900 dark:text-white' },
  { value: `+${formatTRY(DEMO.kdvAmount)}`, label: 'KDV %20', tone: 'text-amber-600 dark:text-amber-400' },
  { value: formatTRY(DEMO.total), label: 'Tahsil Edilen', tone: 'text-indigo-700 dark:text-indigo-300' },
] as const

const DAY_MOMENTS = [
  {
    time: '08.40',
    title: 'Günü Açarken',
    body: 'Panel bugünün seanslarını, notu eksik kalan geçen haftaki kaydı ve bitmek üzere olan paketi kendiliğinden söyler. Aramaya gerek yok.',
  },
  {
    time: '15.10',
    title: 'Seanstan Çıkarken',
    body: 'Not, tür ve duygu ile birlikte defterine düşer. Duygu izleği zamanla bir eğriye dönüşür; ilerlemeyi anlatmak için hafıza gerekmez.',
  },
  {
    time: 'Ay Sonu',
    title: 'Hesap Kapanırken',
    body: 'Kesilen makbuzlar, toplanan KDV ve tahmini gelir vergisi tek sayfada. Muhasebeciye giden yıllık rapor tarayıcıdan çıkar.',
  },
] as const

const TRUST = [
  { icon: Lock, title: 'Parola Kilidi', body: 'Panel tek parolayla açılır. Danışan verisi giriş yapılmadan hiçbir yolla görünmez.' },
  { icon: EyeOff, title: 'Gizlilik Modu', body: 'Tek kısayolla isimler, iletişim ve tutarlar bulanır. Danışan karşı koltuktayken ekranı çevirebilirsin.' },
  { icon: DatabaseBackup, title: 'Tam Yedek ve Geri Yükleme', body: 'Tüm veri tek JSON dosyası olarak iner, on bir tablo ayrı CSV olarak alınır. Geri yükleme tek işlemdir: ya hepsi ya hiçbiri.' },
  { icon: FileDown, title: 'Belge Senin Deponda', body: 'Onam formu, test ve rapor dosyaları panele yüklenmez; yalnızca kendi bulutundaki bağlantısı tutulur.' },
] as const

const TAX_CELLS = [
  { k: 'Toplanan KDV', v: '₺3.200,00', h: 'taslak hariç makbuzlardan', tone: 'text-amber-600 dark:text-amber-400' },
  { k: 'Gelir Vergisi', v: '₺6.554,00', h: 'net kârın tahmini payı', tone: 'text-rose-600 dark:text-rose-400' },
  { k: 'Toplam Yük', v: '₺9.754,00', h: 'bu ay ödenecek', tone: 'text-indigo-700 dark:text-indigo-300' },
  { k: 'Kesilen Stopaj', v: '₺3.200,00', h: 'yıllık gelir vergisinden mahsup', tone: 'text-emerald-600 dark:text-emerald-400' },
] as const

export default function Home() {
  const spotlight = useSpotlight(620, 'rgba(var(--pine), 0.08)')
  // Kaydırma ilerlemesi hem üstteki şeridi hem mürekkep omurgasını sürer
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

        {/* Mürekkep omurgası — sayfanın TEK yazarlı hareketi, kaydırmayla boyanır */}
        <motion.div
          aria-hidden
          style={{ scaleY: progress }}
          className="pointer-events-none fixed bottom-24 left-6 top-24 z-10 hidden w-[10px] origin-top text-slate-900/25 dark:text-white/20 xl:block"
        >
          <BrushPull className="h-full w-full" />
        </motion.div>

        {/* ── Hero ── */}
        <section className="relative z-10 px-6 pb-20 pt-28 sm:pt-32">
          <motion.div
            variants={staggerContainer(0.09)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-[2.6rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.4rem] md:text-[4rem]"
            >
              Brüt ücreti yaz — stopaj, KDV ve makbuz{' '}
              <span className="relative inline-block">
                <motion.span
                  aria-hidden
                  variants={brushWipe}
                  className="pointer-events-none absolute inset-x-[-4%] bottom-[0.08em] top-[0.46em] origin-left text-amber-500"
                >
                  <BrushSweep className="h-full w-full" />
                </motion.span>
                <span className="relative text-indigo-700 dark:text-indigo-300">kendiliğinden</span>
              </span>{' '}
              gelsin.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-[1.0625rem] leading-[1.7] text-slate-500 dark:text-slate-300"
            >
              Derinay, Türkiye&apos;de kendi pratiğini yürüten bir klinik psikoloğun defterini tutar:
              serbest meslek makbuzu, KDV ve stopaj, seans defteri, ajanda ve muhasebeciye giden yıllık
              rapor. Tek panel, tek kişi için.
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
                href="#makbuz"
                className="inline-flex items-center rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
              >
                Makbuz Nasıl Kesiliyor
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            className="relative mx-auto mt-16 w-full max-w-5xl"
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
            {/* Dürüstlük beyanı — KVKK sözünü daha ilk ekranda kanıtlar */}
            <p className="mt-6 text-center text-xs text-slate-400">
              Ekran görüntüsü değil — panelin kendisi, örnek verilerle çizildi.
            </p>
          </motion.div>
        </section>

        {/* ── Kanıt şeridi ── */}
        <section className="relative z-10 border-y border-slate-500/10 bg-[rgba(var(--paper),0.4)] py-8">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 divide-y divide-slate-500/10 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
              {PROOF_CELLS.map((c, i) => (
                <div
                  key={c.label}
                  className={cn('px-1 py-3 sm:px-3 sm:text-center', i === PROOF_CELLS.length - 1 && 'col-span-2 sm:col-span-1')}
                >
                  <p className={cn('font-mono text-[1.375rem] font-bold tabular-nums', c.tone)}>{c.value}</p>
                  <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Stopaj oranını makbuzu keserken sen seçersin; sıfır da olabilir %20 de. Aynı oranlarda
              tahsil ettiğin tutar brüt ücrete eşit çıkar — ama o paranın{' '}
              <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">{formatTRY(DEMO.kdvAmount)}</span>
              &apos;si KDV,{' '}
              <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">{formatTRY(DEMO.stopajAmount)}</span>
              &apos;si kesilen vergidir. Derinay bu ayrımı sen hesaplamadan yapar.
            </p>
          </div>
        </section>

        {/* ── Sahne 1: Makbuz ── */}
        <section id="makbuz" className="relative z-10 mx-auto max-w-6xl scroll-mt-24 px-6 py-24 lg:py-28">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-16">
            <div className="lg:sticky lg:top-28 lg:col-span-5">
              <h2 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.6rem]">
                Makbuz Kesmek Bir Ekran Sürer
              </h2>
              <div className="mt-6 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                <p>
                  Danışanı seç, brüt ücreti yaz. KDV eklenir, stopaj düşülür; net ücret ve danışandan
                  tahsil edeceğin tutar sen alanı bırakmadan aşağıda belirir. Oranları makbuz başına
                  değiştirebilirsin — KDV&apos;de %0, %1, %10 ve %20, stopajda &ldquo;yok&rdquo; ya da %20.
                </p>
                <p>
                  Kaydettiğinde numara sıradan devam eder. Önizleme açılır, Yazdır dediğinde tarayıcı
                  PDF&apos;i üretir — ayrıca kurulacak bir program yok. Sonrasında makbuz kendi hâlini
                  taşır: Taslak, Gönderildi, Ödendi. Vadesi geçmiş bir &ldquo;Gönderildi&rdquo; makbuzu
                  sen sayfayı açtığın anda &ldquo;Gecikmiş&rdquo;e döner; takip etmen gerekmez.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:col-span-7 lg:mt-0">
              <PreviewFrame caption="derinay · yeni makbuz">
                <ReceiptPreview />
              </PreviewFrame>
            </div>
          </div>
        </section>

        {/* ── Sahne 2: Vergi — bilinçli olarak ekran ÇİZMEZ, rakamı tipografiyle anlatır ── */}
        <section id="vergi" className="relative z-10 scroll-mt-24 border-y border-slate-500/10 bg-gradient-to-b from-amber-500/[0.05] to-transparent py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-12 lg:items-center lg:gap-x-16">
            <div className="lg:col-span-5">
              <h2 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.6rem]">
                Ay Sonunda Ne Ödeyeceğini Bilmek
              </h2>
              <div className="mt-6 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                <p>
                  Vergiler sayfası üç rakamdan ibarettir: kestiğin makbuzlardan toplanan KDV, net kârın
                  üzerinden tahmini gelir vergisi ve ikisinin toplamı. Taslak makbuzlar bu hesaba
                  girmez — kesilmemiş belge tahsilat değildir.
                </p>
                <p>
                  Senden kesilen stopaj ayrı bir satırda durur, çünkü o ödediğin bir masraf değil; yıl
                  sonunda gelir vergisinden mahsup edeceğin tutardır. Oranlar Ayarlar&apos;dan değişir
                  ve panelin tamamı aynı oranı okur.
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-500/12 bg-slate-500/10 lg:col-span-7">
              {TAX_CELLS.map((c) => (
                <div key={c.k} className="bg-[rgba(var(--paper),0.72)] p-5">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{c.k}</dt>
                  <dd className={cn('mt-1.5 font-mono text-xl font-bold tabular-nums sm:text-2xl', c.tone)}>{c.v}</dd>
                  <p className="mt-1 text-[11px] text-slate-400">{c.h}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Gün bandı ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-2xl font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.6rem]">
            Panel Günü Okur, Sen Aramazsın
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {DAY_MOMENTS.map((m) => (
              <div key={m.time} className="border-t border-slate-500/15 pt-5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
                  {m.time}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Emanet ── */}
        <section id="emanet" className="relative z-10 scroll-mt-24 border-t border-slate-500/10 bg-[rgba(var(--paper),0.35)] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.6rem]">
                Veri Sende Kalır
              </h2>
              <p className="mt-5 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                Bir psikoloğun tuttuğu kayıt, tuttuğu en hassas kayıttır. Derinay bunu bir vaat olarak
                değil, arayüzün kendisi olarak çözer.
              </p>
            </div>
            <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {TRUST.map((t) => (
                <div key={t.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-700 dark:text-indigo-300">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
                      {t.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kapanış ── */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center sm:py-32">
          <ShieldCheck aria-hidden className="mx-auto h-6 w-6 text-amber-500/70" />
          <h2 className="mt-6 font-display text-[1.9rem] font-bold leading-[1.1] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-4xl">
            Üç danışan, bir makbuz, bir ay.
            <br />
            Gerisini panel tutar.
          </h2>
          <Link
            href="/dashboard"
            className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.98]"
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
