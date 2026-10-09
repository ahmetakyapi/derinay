'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowUpRight,
  CalendarRange,
  DatabaseBackup,
  EyeOff,
  FileText,
  Lock,
  StickyNote,
  Users,
} from 'lucide-react'
import { BrushSweep } from '@/components/brand/Brush'
import { BloomArt } from '@/components/art/BloomArt'
import { RevealText } from '@/components/motion/RevealText'
import { Magnetic } from '@/components/motion/Magnetic'
import { useIntroDone } from '@/components/motion/intro'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'

/**
 * Kahraman — iki sütun: solda manşet, sağda "galeri penceresi".
 *
 * NEDEN BÖYLE (Ekim 2026, ikinci tur): ekranı dolduran tek blok manşet
 * satırları birbirine yapıştırıyordu (leading 0.9, "ğ" kuyruğu alt satıra
 * değiyordu) ve sayfada görsel bir şey yoktu. Şimdi:
 *  - Manşet ÜÇ AYRI SATIR, satır aralığı 1.06 + satırlar arası pay; punto
 *    ekranı doldurmuyor, okunuyor.
 *  - Sağda kemerli pencere: koyu çam gökyüzü, ufka inen altın güneş, suda
 *    yansıyan çizgiler ve kendi kendine çizilen orkide — "kafanı dinlendir"
 *    vaadinin resmi. Etrafında panelin gerçek bölümlerini adlandıran cam
 *    çipler süzülür; uydurma rakam/isim YOK (bkz. CLAUDE.md §10/22).
 *  - Fare pencerenin üstünde gezinince katmanlar farklı derinlikte kayar.
 *
 * Metin kuralı: başlık, alt başlık ve düğmeler Title Case (sahibinin isteği).
 */

const CHIPS = [
  { icon: CalendarRange, label: 'Ajanda', pos: 'left-[-12%] top-[12%] sm:left-[-14%]', depth: 26, float: 'animate-float' },
  { icon: StickyNote, label: 'Seans Defteri', pos: 'right-[-14%] top-[46%] sm:right-[-16%] sm:top-[34%]', depth: 40, float: 'animate-float-slow' },
  // Telefonda yalnız ilk ikisi: dört çip dar pencerenin üstünü kapatıyordu
  { icon: Users, label: 'Danışan Dosyası', pos: 'hidden sm:block left-[-18%] top-[58%]', depth: 34, float: 'animate-float-slow' },
  { icon: FileText, label: 'Makbuz & Vergi', pos: 'hidden sm:block right-[-12%] bottom-[10%]', depth: 22, float: 'animate-float' },
] as const

const TRUST = [
  { icon: Lock, label: 'Şifreyle Korunur' },
  { icon: EyeOff, label: 'Gizlilik Modu' },
  { icon: DatabaseBackup, label: 'Tam Yedek' },
] as const

function useDepth(mx: MotionValue<number>, my: MotionValue<number>, depth: number) {
  const x = useTransform(mx, (v) => v * depth)
  const y = useTransform(my, (v) => v * depth)
  return { x, y }
}

function Chip({
  chip,
  i,
  play,
  mx,
  my,
}: {
  chip: (typeof CHIPS)[number]
  i: number
  play: boolean
  mx: MotionValue<number>
  my: MotionValue<number>
}) {
  const { x, y } = useDepth(mx, my, chip.depth)
  const Icon = chip.icon
  return (
    <motion.div style={{ x, y }} className={`absolute z-20 ${chip.pos}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 24 }}
        animate={play ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 1.1 + i * 0.12 }}
      >
        <div
          className={`glass flex items-center gap-2.5 rounded-2xl py-2.5 pl-2.5 pr-4 shadow-xl shadow-slate-900/10 motion-reduce:animate-none ${chip.float}`}
          style={{ animationDelay: `${i * -1.7}s` }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Icon className="h-4 w-4" />
          </span>
          <span className="whitespace-nowrap text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            {chip.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** Kemerli pencere: çam gökyüzü, inen altın güneş, ufuk çizgileri, orkide */
function GalleryWindow({ play }: { play: boolean }) {
  const still = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const mx = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.6 })
  const my = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.6 })
  const sun = useDepth(mx, my, 14)
  const bloom = useDepth(mx, my, -10)

  const onMove = (e: React.PointerEvent) => {
    if (still || e.pointerType !== 'mouse' || !box.current) return
    const r = box.current.getBoundingClientRect()
    rawX.set((e.clientX - r.left) / r.width - 0.5)
    rawY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <div
      ref={box}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto aspect-[4/5] w-full max-w-[19rem] sm:max-w-[25rem] lg:max-w-[28rem]"
    >
      {/* Pencerenin arkasındaki altın hâle */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={play ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.5 }}
        className="absolute -inset-[12%] bg-[radial-gradient(closest-side,rgba(var(--gold),0.22),transparent)]"
      />

      {/* Kemer — aşağıdan yukarı perde gibi açılır */}
      <motion.div
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={play ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: 1.4, ease: EASE_IN_OUT, delay: 0.35 }}
        /* Kemer yarıçapı ÖLÇÜYLE: rounded-t-full (9999px) yazınca tarayıcı tüm köşeleri
           orantılı küçültüyor ve alt köşeler kare kalıyordu. Kutu 4:5 → yatay %50, dikey %40. */
        className="dark absolute inset-0 overflow-hidden rounded-b-[2.5rem] rounded-t-[50%_40%] bg-gradient-to-b from-indigo-700 via-indigo-900 to-indigo-950 shadow-2xl shadow-indigo-950/30 ring-1 ring-white/10"
      >
        {/* Gökyüzü ışığı */}
        <div className="absolute inset-x-0 bottom-[30%] h-1/2 bg-[radial-gradient(60%_60%_at_50%_100%,rgba(var(--gold),0.35),transparent)]" />

        {/* Güneş — ufka doğru iner */}
        <motion.div style={still ? undefined : sun} className="absolute inset-0">
          <motion.div
            initial={{ y: '-60%', opacity: 0 }}
            animate={play ? { y: '0%', opacity: 1 } : undefined}
            transition={{ duration: 2.2, ease: EASE_OUT_EXPO, delay: 0.7 }}
            className="absolute left-[29%] top-[44%] h-[34%] w-[42%] rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_80px_rgba(var(--gold),0.55)]"
          />
        </motion.div>

        {/* Su — ufuk ve yansıma çizgileri */}
        <div className="absolute inset-x-0 bottom-0 top-[66%] bg-gradient-to-b from-indigo-950/90 to-indigo-950">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <motion.span
              key={n}
              aria-hidden
              initial={{ scaleX: 0, opacity: 0 }}
              animate={play ? { scaleX: 1, opacity: 1 } : undefined}
              transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 1.2 + n * 0.08 }}
              // Yatay ortalama `left` ile: Framer'ın scaleX transform'u translate sınıfını ezerdi
              style={{ top: `${10 + n * 14}%`, width: `${46 - n * 6}%`, left: `${27 + n * 3}%` }}
              className="absolute h-[2px] rounded-full bg-amber-300/50"
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-[66%] h-px bg-amber-200/60" />

        {/* Orkide — kendi kendine çizilir */}
        <motion.div style={still ? undefined : bloom} className="absolute bottom-[6%] left-[6%] h-[62%] w-[42%]">
          {play && <BloomArt tone="night" className="h-full w-full" delay={1} />}
        </motion.div>
      </motion.div>


      {CHIPS.map((c, i) => (
        <Chip key={c.label} chip={c} i={i} play={play} mx={mx} my={my} />
      ))}
    </div>
  )
}

export function Hero() {
  const play = useIntroDone()
  const still = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const artY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={ref}
      className="relative z-10 flex min-h-[100svh] items-center px-6 pb-20 pt-[calc(7rem+env(safe-area-inset-top))] sm:px-10 lg:pb-16"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-x-12 gap-y-20 lg:grid-cols-[1.15fr_1fr]">
        {/* ── Metin ─────────────────────────────────────────────── */}
        <motion.div style={still ? undefined : { y: textY, opacity: fade }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-slate-500/20 bg-[rgba(var(--paper),0.6)] py-1.5 pl-2 pr-4 text-[13px] font-semibold text-slate-700 backdrop-blur dark:text-slate-200"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            Psikologlar İçin Danışan ve Finans Takibi
          </motion.div>

          {/* İki satır, üç ses: kalın grotesk komut, ince soluk "Kafanı", serif
              italik çam rengi vurgu. Tek ailede dört satırlık blok tekdüze ve
              ağır duruyordu; ağırlık + yüz karşıtlığı manşeti zenginleştirir. */}
          {/* HER EKRANDA TAM İKİ SATIR. Satırlar `whitespace-nowrap` ve
              `text-wrap: wrap` (global balance kuralı kahramana uygulanmaz);
              punto sütuna sığacak şekilde vw ile ölçeklenir: en uzun satır
              ≈7em → telefonda (100vw-48px)/7, lg'de sütun genişliği/7. */}
          <h1 className="mt-8 font-display text-[clamp(2.2rem,10.5vw,5.25rem)] leading-[1.08] text-slate-900 [text-wrap:wrap] dark:text-white lg:text-[clamp(3rem,5.6vw,5.25rem)]">
            <span className="block whitespace-nowrap font-extrabold tracking-[-0.055em]">
              <RevealText text="İşini Düzenle," play={play} stagger={0.08} duration={1.1} delay={0.15} />
            </span>
            <span className="mt-[0.06em] block whitespace-nowrap">
              <RevealText
                text="Kafanı"
                play={play}
                delay={0.3}
                duration={1.1}
                className="font-normal tracking-[-0.05em] text-slate-500 dark:text-slate-400"
              />{' '}
              <span className="relative inline-block">
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: play ? 1 : 0 }}
                  transition={{ duration: 1, ease: EASE_IN_OUT, delay: 1.05 }}
                  /* Fırça serifin taban çizgisinin hemen altını yalar */
                  className="pointer-events-none absolute inset-x-[-3%] bottom-[-0.02em] top-[0.7em] origin-left text-amber-500"
                >
                  <BrushSweep className="h-full w-full" />
                </motion.span>
                <RevealText
                  text="Dinlendir"
                  play={play}
                  delay={0.42}
                  duration={1.1}
                  // İtalik çıkıntı kelime maskesinde kesilmesin: pay içteki kelimeye
                  wordClassName={() => 'pr-[0.1em]'}
                  className="relative font-serif text-[1.08em] font-normal italic tracking-[-0.02em] text-indigo-700 [font-variation-settings:'SOFT'_100] dark:text-indigo-300"
                />
              </span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.75 }}
            className="mt-8 max-w-[34rem] text-[1.125rem] [text-wrap:wrap] font-medium leading-[1.6] text-slate-600 dark:text-slate-300 sm:text-[1.25rem]"
          >
            <span className="text-slate-900 dark:text-white">Danışanların, Randevuların, Seans Notların ve Gelirlerin</span>{' '}
            Tek Bir Yerde. Sade, Hızlı ve Kullanması Kolay.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-4 sm:gap-4"
          >
            <Magnetic strength={0.25}>
              <Link
                href="/login"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-indigo-600 py-4 pl-6 pr-4 sm:pl-7 sm:pr-5 text-[15px] font-semibold text-white shadow-xl shadow-indigo-600/25"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-slate-900 transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 dark:bg-amber-500"
                />
                <span className="roll relative">
                  <span data-t="Panele Giriş Yap">Panele Giriş Yap</span>
                </span>
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </Link>
            </Magnetic>
            <a
              href="#panel"
              className="group inline-flex items-center gap-2.5 rounded-full px-2 py-4 text-[15px] font-semibold sm:px-3 text-slate-700 dark:text-slate-200"
            >
              <span className="roll">
                <span data-t="Neler Var">Neler Var</span>
              </span>
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-500/30">
                <ArrowDown className="h-3.5 w-3.5 animate-[nudge_2.2s_ease-in-out_infinite]" />
              </span>
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-slate-500/15 pt-6"
          >
            {TRUST.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <t.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                {t.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ── Görsel ────────────────────────────────────────────── */}
        <motion.div style={still ? undefined : { y: artY }} className="px-10 pb-10 sm:px-16 lg:px-8">
          <GalleryWindow play={play} />
        </motion.div>
      </div>
    </section>
  )
}
