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
} from 'lucide-react'
import { useSpotlight } from '@/hooks/useSpotlight'
import { brushWipe, fadeUp, staggerContainer, EASE } from '@/lib/variants'
import { BloomMark } from '@/components/brand/BloomMark'
import { BloomArt } from '@/components/art/BloomArt'
import { BrushSweep, BrushPull } from '@/components/brand/Brush'
import { PanelPreview } from '@/components/marketing/PanelPreview'
import { PreviewFrame } from '@/components/marketing/PreviewFrame'
import { ReceiptPreview } from '@/components/marketing/ReceiptPreview'
import { NotePreview } from '@/components/marketing/NotePreview'
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
 * Bölümlerin ayrı giriş animasyonu YOK. Sayfanın tepesindeki üç renkli
 * degrade ilerleme çubuğu KALDIRILDI: aynı bilgiyi omurga zaten taşıyordu
 * (iki ilerleme göstergesi) ve çok duraklı degrade tek vurgu rengi kuralını
 * deliyordu.
 *
 * BÖLÜM DÜZENİ TEKRAR ETMEZ (taste-skill denetimi). Her bölüm kendi
 * yapısını içeriğinden alır:
 *   panel  → panelin KENDİ gezinme gruplarına (Klinik / Finans) bölünmüş liste
 *   gün    → zaman çizgisi; sıra gerçek bilgi taşır (sabah → ay sonu)
 *   defter → kesit solda, metin sağda
 *   finans → metin solda, kesit sağda
 *   güven  → taahhüt satırları; terim solda, karşılığı sağda
 * Eskiden panel/gün/güven ÜÇÜ de aynı "saç çizgisi + ızgara" düzeniydi.
 *
 * VURGU TEK YERDE: indigo vurgu sözcüğü yalnız manşette, fırça sürüşüyle
 * birlikte. Eskiden yedi başlığın hepsinde vardı; yedi kez tekrarlanan vurgu
 * vurgu olmaktan çıkıp tik hâline geliyordu.
 */

/** Bölüm açılış başlığı — tam genişlik, sayfanın en büyük ikinci sesi */
const H2_SECTION =
  'font-display text-[2.25rem] font-bold leading-[1.02] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3.25rem]'
/** Sahne başlığı — kesitin yanındaki dar sütun; açılışlardan bir kademe küçük */
const H2_SCENE =
  'font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[2.5rem]'

/**
 * Panelin içindekiler — panelin KENDİ kenar çubuğu gruplarına göre ayrılmış.
 * Gruplar uydurma değil: `DashboardShell` içindeki NAV_GROUPS ile aynı adları
 * taşır, yani ziyaretçi panele girdiğinde aynı ikiliyi bulur.
 */
const CAPABILITY_GROUPS = [
  {
    group: 'Klinik',
    items: [
      { icon: Users, title: 'Danışan Dosyası', body: 'İletişim, etiket, seans ücreti, onam durumu ve tüm geçmiş tek kartta.' },
      { icon: CalendarRange, title: 'Ajanda', body: 'Haftalık saat ızgarası. Seansı sürükleyip bırak; çakışmayı panel söyler.' },
      { icon: StickyNote, title: 'Seans Defteri', body: 'Tür ve duygu etiketli notlar, SOAP şablonları, zamanla çıkan duygu izleği.' },
    ],
  },
  {
    group: 'Finans',
    items: [
      { icon: Wallet, title: 'Gelir & Gider', body: 'Kategori bazlı hareketler; kira, abonelik gibi sabit kalemler tek tıkla sonraki aya kopyalanır.' },
      { icon: FileText, title: 'Makbuz', body: 'Serbest meslek makbuzu tek ekranda kesilir; numara sıradan devam eder.' },
      { icon: PieChart, title: 'Analiz & Rapor', body: 'Yıllık akış, biriken bakiye ve muhasebeciye giden tek dosyalık rapor.' },
    ],
  },
] as const

/** Günün üç durağı. SIRA bilgi taşır, o yüzden zaman çizgisi olarak çizilir. */
const DAY_MOMENTS = [
  {
    time: 'Sabah',
    title: 'Günü Açarken',
    body: 'Bugünün seansları, notu eksik kalan kayıt, bitmek üzere olan paket ve sessizleşen danışan. Hepsi karşılama ekranında; aramana gerek yok.',
  },
  {
    time: 'Seans Arası',
    title: 'Defteri Tutarken',
    body: 'Danışan çıkar çıkmaz not düşersin, iki dakika sürer. Aklında kalan cümle, kapıdan çıkmadan yerine geçmiş olur.',
  },
  {
    time: 'Ay Sonu',
    title: 'Hesabı Kapatırken',
    body: 'Kimin ödediği, kimin geciktiği ve ne kadar vergi biriktiği tek sayfada durur. Muhasebeciye gidecek yıllık rapor bir tuşla çıkar.',
  },
] as const

/** Veri taahhütleri. Sıra taşımaz, sayım taşımaz: ikon almazlar, satır olurlar. */
const TRUST = [
  { title: 'Parola Kilidi', body: 'Panel tek parolayla açılır. Danışan verisi giriş yapılmadan hiçbir yolla görünmez.' },
  { title: 'Gizlilik Modu', body: 'Tek kısayolla isimler, iletişim ve tutarlar bulanır. Danışan karşı koltuktayken ekranı çevirebilirsin.' },
  { title: 'Yedek ve Geri Yükleme', body: 'Tüm veri tek dosyada iner, on bir tablo ayrı CSV olarak alınır. Geri yükleme tek işlemdir: ya hepsi ya hiçbiri.' },
  { title: 'Belge Senin Deponda', body: 'Onam formu, test ve rapor dosyaları panele yüklenmez; yalnızca kendi bulutundaki bağlantısı tutulur.' },
] as const

export default function Home() {
  const spotlight = useSpotlight(620, 'rgba(var(--pine), 0.08)')
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <MotionConfig reducedMotion="user">
      <Header />

      <main id="lp-main" tabIndex={-1} className="relative min-h-[100dvh] overflow-hidden outline-none">
        <motion.div className="pointer-events-none fixed inset-0 z-0" style={{ background: spotlight }} />

        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute -left-24 top-32 hidden h-72 w-72 animate-float md:block rounded-full bg-indigo-500/10 blur-3xl motion-reduce:animate-none" />
          <div className="absolute right-[-80px] top-64 hidden h-80 w-80 animate-float-slow md:block rounded-full bg-amber-500/10 blur-3xl motion-reduce:animate-none" />
          <BloomMark className="absolute -right-16 top-[38%] hidden h-[34rem] w-[34rem] -translate-y-1/2 -rotate-12 text-slate-900/[0.035] dark:text-white/[0.04] lg:block" />
          <BloomArt className="absolute -left-8 bottom-24 hidden h-72 w-56 opacity-70 lg:block" delay={0.6} />
        </div>

        {/* Mürekkep omurgası — sayfanın tek yazarlı hareketi ve tek ilerleme göstergesi */}
        <motion.div
          aria-hidden
          style={{ scaleY: progress }}
          className="pointer-events-none fixed bottom-24 left-6 top-24 z-10 hidden w-[10px] origin-top text-slate-900/25 dark:text-white/20 xl:block"
        >
          <BrushPull className="h-full w-full" />
        </motion.div>

        {/* ── Hero ─────────────────────────────────────────────────────────
            Manşet FAYDAYI söyler. Mevzuat sözcüğü (KDV, stopaj) burada geçmez;
            onların yeri finans bölümü.

            ORTALI DÜZEN BİLİNÇLİ: taste-skill ortalı kahramanı `DESIGN_VARIANCE > 4`
            için genel olarak elemeyi söyler ama "mesajın kendisi tasarım olan"
            manifesto kahramanını istisna tutar. Burada durum bu: tek jest fırça
            sürüşü, tek ses manşet. Ayrıca mod "Redesign · Preserve" — tanınan
            kahramanı bozmak yeniden tasarım değil, kimlik silme olurdu.

            ÜST PAY: pt-24 (skill tavanı). Eski pt-40 manşeti ekranın ortasına
            düşürüyor, ilk bakışta düğmeyi kırpıyordu. */}
        <section className="relative z-10 px-6 pb-24 pt-24 sm:pb-32">
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
              Pratiğini Yönet,
              <br />
              Kafanı{' '}
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
                <span className="relative text-indigo-700 dark:text-indigo-300">Dinlendir</span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-8 max-w-xl text-[1.0625rem] leading-[1.75] text-slate-500 dark:text-slate-300 sm:text-lg"
            >
              Danışanların, ajandan, seans defterin ve finansın tek yerde. Tek kişilik bir
              pratiğin ihtiyacı kadar sakin bir çalışma masası.
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
            {/* "Örnek veri" damgası çerçevenin kendi plaketinde duruyor; eskiden
                burada ayrı bir satırdı ve kahramanın metin öğesi sayısını taşırıyordu. */}
            <PreviewFrame caption="derinay · genel bakış">
              <PanelPreview />
            </PreviewFrame>
          </motion.div>
        </section>

        {/* ── Panelde ne var ──────────────────────────────────────────────
            Panelin kendi gezinme grupları: Klinik ve Finans. Altı maddelik düz
            bir ızgara yerine iki anlamlı küme; ziyaretçi panele girdiğinde aynı
            ikiliyi kenar çubuğunda bulur. */}
        <section id="panel" className="relative z-10 scroll-mt-24 px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className={`max-w-3xl ${H2_SECTION}`}>Bir Pratiğin Döndüğü Her Şey Burada</h2>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
              Ayrı defterler, tablolar ve klasörler yerine tek panel. Bir seansı tamamladığında
              takvim, danışan dosyası ve paket kullanımı aynı anda güncellenir.
            </p>

            <div className="mt-16 grid gap-x-16 gap-y-14 lg:grid-cols-2">
              {CAPABILITY_GROUPS.map((g) => (
                <div key={g.group}>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{g.group}</p>
                  <ul className="mt-5 space-y-7">
                    {g.items.map((c) => (
                      <li key={c.title} className="flex gap-4">
                        <c.icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                            {c.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{c.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gün ───────────────────────────────────────────────────────────
            ZAMAN ÇİZGİSİ. Sabah → seans arası → ay sonu gerçek bir sıradır, o
            yüzden düğümlü sürekli bir çizgi olarak çizilir ve <ol> ile işaretlenir.
            Duraklar mürekkep tonunda: altın vurgu manşetin fırçasına ayrıldı. */}
        <section className="relative z-10 border-y border-slate-500/10 bg-[rgba(var(--paper),0.4)] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className={`max-w-3xl ${H2_SECTION}`}>
              Panel Günü Okur,
              <br />
              Sen Aramazsın
            </h2>

            <div className="relative mt-16">
              {/* Durakları birbirine bağlayan sürekli çizgi (sm+) */}
              <div aria-hidden className="absolute inset-x-0 top-0 hidden h-px bg-slate-500/20 sm:block" />
              <ol className="grid gap-12 sm:grid-cols-3 sm:gap-10">
                {DAY_MOMENTS.map((m) => (
                  <li
                    key={m.time}
                    className="relative border-t border-slate-500/15 pt-6 sm:border-t-0 sm:pt-9"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-slate-900/45 dark:bg-white/40 sm:block"
                    />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m.time}</p>
                    <h3 className="mt-2.5 font-display text-xl font-bold tracking-[-0.03em] text-slate-900 dark:text-white">
                      {m.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{m.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Seans Defteri ───────────────────────────────────────────────
            Ürünün klinik ağırlık merkezi. Finans bölümünün karşı ağırlığı:
            panel bir faturalama aracı değil, önce bir defter. */}
        <section id="defter" className="relative z-10 scroll-mt-24 px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-16">
            <div className="lg:col-span-7">
              <PreviewFrame caption="derinay · seans defteri">
                <NotePreview />
              </PreviewFrame>
            </div>

            <div className="mt-14 lg:col-span-5 lg:mt-0">
              <h2 className={H2_SCENE}>Defter Önce, Fatura Sonra</h2>
              <div className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                <p>
                  Her not bir tür ve bir duyguyla kaydedilir. SOAP, ilk görüşme ve BDT şablonları
                  hazır bekler; yazarken yarım kalırsa taslak korunur, sekmeyi kapatsan bile kaybolmaz.
                </p>
                <p>
                  Haftalar biriktikçe duygu izleği bir eğriye dönüşür. Tedavi hedefleri ve ölçek
                  puanları aynı sayfada durur. İlerlemeyi anlatmak için hafızana yüklenmen gerekmez.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Finans ──────────────────────────────────────────────────────
            Mevzuat detayı YALNIZCA burada ve gövde metninin içinde geçer;
            başlık faydayı söyler. Kesit bu kez sağda: aynı bölünmüş düzenin
            üst üste üçüncü kez tekrarı yasak, ikincisi ayna olarak serbest. */}
        <section id="finans" className="relative z-10 scroll-mt-24 px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-16">
            <div className="lg:col-span-5">
              <h2 className={H2_SCENE}>Hesap Kendiliğinden Çıkar</h2>
              <div className="mt-7 space-y-4 text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                <p>
                  Danışanı seç, ücreti yaz. Makbuz bir ekranda kesilir; numara sıradan devam eder,
                  önizleme açılır, Yazdır dediğinde PDF çıkar. Kurulacak ek bir program yok.
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

        {/* ── Emanet ────────────────────────────────────────────────────────
            TAAHHÜT SATIRLARI: terim solda, karşılığı sağda. Kart da değil,
            ikonlu ızgara da değil — imzalanmış bir taahhüt gibi okunsun diye.
            Saç çizgisi yalnız grubun ÜSTÜNDE; her satırın altına çizgi çekmek
            bunu bir şartname tablosuna çevirirdi. */}
        <section id="guven" className="relative z-10 scroll-mt-24 border-t border-slate-500/10 bg-[rgba(var(--paper),0.35)] px-6 py-28 sm:py-36">
          <div className="mx-auto max-w-6xl">
            <h2 className={`max-w-3xl ${H2_SECTION}`}>Veri Sende Kalır</h2>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
              Bir psikoloğun tuttuğu kayıt, tuttuğu en hassas kayıttır. Derinay bunu bir vaat olarak
              değil, arayüzün kendisi olarak çözer.
            </p>

            <dl className="mt-16 border-t border-slate-500/15">
              {TRUST.map((t) => (
                <div key={t.title} className="grid gap-2 py-8 sm:grid-cols-12 sm:gap-10">
                  <dt className="font-display text-lg font-bold tracking-[-0.03em] text-slate-900 dark:text-white sm:col-span-4">
                    {t.title}
                  </dt>
                  <dd className="text-[15px] leading-[1.7] text-slate-500 dark:text-slate-400 sm:col-span-8">
                    {t.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Kapanış ───────────────────────────────────────────────────────
            Başlığın üstündeki kalkan ikonu KALDIRILDI: güvenlik bölümünün
            işaretiydi, kapanış çağrısında hiçbir şey söylemiyordu. */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-32 text-center sm:py-40">
          <h2 className="font-display text-[2.25rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[3rem]">
            Bugün Düzeni Kurmaya Başla
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
