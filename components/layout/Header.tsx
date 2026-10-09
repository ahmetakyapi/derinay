'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'
import { ThemeToggleButton } from '@/components/theme/ThemeToggleButton'
import { useIntroDone } from '@/components/motion/intro'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'

/** Başlığın cam zemine geçtiği kaydırma eşiği (px) */
const SCROLL_THRESHOLD = 10
/** Bu kadar aşağıdayken aşağı kaydırma başlığı gizler (px) */
const HIDE_AFTER = 480

// Landing bölümleriyle BİREBİR eşleşmeli — var olmayan bir çapaya bağlanan
// menü satırı sessizce hiçbir şey yapmaz (eski #features/#how böyleydi).
const NAV_LINKS = [
  { label: 'Neler Var', href: '#panel' },
  { label: 'Nasıl Çalışır', href: '#gun' },
  { label: 'Seans Defteri', href: '#defter' },
  { label: 'Finans', href: '#finans' },
  { label: 'Güvenlik', href: '#guven' },
]

/**
 * Landing başlığı.
 *  - Aşağı kaydırınca çekilir, yukarı kaydırınca geri gelir (okuma alanı açılır).
 *  - Bağlantılar "yuvarlanır": üzerine gelince metin yukarı kayar, kopyası
 *    alttan gelir (`.roll`, globals.css).
 *  - Telefonda menü tam ekran perdedir; düğmenin köşesinden daire olarak
 *    açılır, bağlantılar büyük puntoyla sırayla yükselir.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const introDone = useIntroDone()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /* Kaydırma durumu Motion'ın `scrollY` değerinden okunur.
     `window.addEventListener('scroll', ...)` KULLANILMAZ (bkz. CLAUDE.md §10). */
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const past = y > SCROLL_THRESHOLD
    setScrolled((prev) => (prev === past ? prev : past))
    const prev = scrollY.getPrevious() ?? 0
    const hide = y > HIDE_AFTER && y > prev
    setHidden((h) => (h === hide ? h : hide))
  })

  // Mobil menü modal gibi davranıyor: Esc ile kapansın, arka plan kilitlensin
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Arkadaki sayfa klavye ve ekran okuyucu için devre dışı: Tab menüden
    // kaçıp görünmeyen içeriğe düşmesin. Başlık (kapat düğmesi) erişilebilir kalır.
    const behind = [document.getElementById('lp-main'), document.querySelector('footer')]
    behind.forEach((el) => el?.setAttribute('inert', ''))
    const t = setTimeout(() => menuRef.current?.querySelector('a')?.focus(), 50)
    const toggle = toggleRef.current
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      behind.forEach((el) => el?.removeAttribute('inert'))
      toggle?.focus({ preventScroll: true })
    }
  }, [menuOpen])

  return (
    <>
      <a
        href="#lp-main"
        className="sr-only rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        İçeriğe Atla
      </a>

      {/* TELEFONDA KAYDIRMADAN ÖNCE DE OPAK (3 Ekim 2026). Saydam başlıkta iOS 26
          Safari durum çubuğunun altına kendi "kenar efektini" uyguluyor ve
          altından geçen içeriği bulanıklaştırıyordu. Masaüstünde saydam kalıyor. */}
      <motion.header
        initial={{ y: '-100%' }}
        // Gizliyken saydamlaşır da: `.glass` gölgesi ekranın üst kenarından
        // aşağı sızıp gri bir şerit bırakıyordu.
        animate={
          introDone && (!hidden || menuOpen) ? { y: '0%', opacity: 1 } : { y: '-100%', opacity: introDone ? 0 : 1 }
        }
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: introDone && !scrolled ? 0.5 : 0 }}
        className={`fixed inset-x-0 top-0 z-50 h-[calc(4.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,border-color] duration-500 ${
          scrolled && !menuOpen
            ? `glass ${hidden ? '' : 'shadow-xl shadow-black/5'}`
            : 'border-b border-slate-500/10 bg-[var(--bg)] md:border-transparent md:bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="group relative z-[70] flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            {/* Mürekkep damgası — orkide işareti + altın nokta */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-900/20 transition-transform duration-500 group-hover:rotate-[8deg] dark:bg-slate-50">
              <BloomMark className="h-5 w-5 text-amber-50 transition-transform duration-700 group-hover:rotate-[144deg] dark:text-slate-900" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-[var(--bg)]" />
            </div>
            <span className="font-display text-lg font-bold tracking-[-0.04em] text-slate-900 dark:text-slate-100">
              Derinay
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group text-[13px] font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <span className="roll">
                  <span data-t={link.label}>{link.label}</span>
                </span>
              </a>
            ))}
          </nav>

          <div className="relative z-[70] flex items-center gap-2">
            <ThemeToggleButton />

            <Link
              href="/login"
              className="group hidden items-center gap-1.5 rounded-full bg-slate-900 py-2 pl-4 pr-3 text-[13px] font-semibold text-slate-50 transition-colors hover:bg-indigo-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-indigo-200 sm:inline-flex"
            >
              <span className="roll">
                <span data-t="Giriş Yap">Giriş Yap</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45" />
            </Link>

            {/* Hamburger — iki çizgi çarpıya döner */}
            <button
              ref={toggleRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Menüyü kapat' : 'Menü'}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 lg:hidden"
            >
              <span
                className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  menuOpen ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-[1.5px] w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                  menuOpen ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            id="landing-mobile-menu"
            /* aria-modal YOK: kapatma düğmesi başlıkta, diyaloğun dışında;
               aria-modal onu VoiceOver'a erişilmez kılardı. Arka plan `inert`.
               data-lenis-prevent: Lenis tekerleği yakalayıp arkadaki sayfayı
               kaydırmasın (body overflow kilidi programatik kaydırmayı durdurmaz). */
            data-lenis-prevent
            role="dialog"
            aria-label="Gezinme menüsü"
            initial={{ clipPath: 'circle(0% at calc(100% - 2.6rem) 2.2rem)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 2.6rem) 2.2rem)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 2.6rem) 2.2rem)' }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT }}
            className="fixed inset-0 z-[45] flex flex-col bg-[var(--bg)] px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(6.5rem+env(safe-area-inset-top))] lg:hidden"
          >
            <nav className="flex flex-1 flex-col justify-center">
              {NAV_LINKS.map((link, i) => (
                <span key={link.href} className="block overflow-hidden border-b border-slate-500/15">
                  <motion.a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.25 + i * 0.06 }}
                    className="flex items-baseline justify-between py-4 font-display text-[2.4rem] font-bold leading-none tracking-[-0.05em] text-slate-900 dark:text-white"
                  >
                    {link.label}
                    <span className="font-mono text-xs font-medium tracking-normal text-slate-500 dark:text-slate-400">
                      0{i + 1}
                    </span>
                  </motion.a>
                </span>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: EASE_OUT_EXPO }}
            >
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-full bg-indigo-600 px-6 py-4 text-sm font-semibold text-white"
              >
                Giriş Yap
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
