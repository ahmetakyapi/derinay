'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { m, useScroll, useTransform } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'

/**
 * Landing altlığı — sayfanın imzası.
 *
 * Marka işareti + tek satır tanım + bağlantılar. İçerik kaydırmaya bağlı
 * hafif bir paralaksla aşağıdan "açılır" — sayfanın sonunda kapak kalkar gibi.
 *
 * Ekranı dolduran dev "Derinay" sözcüğü KALDIRILDI (Kasım 2026, sahibinin
 * isteği) — geri ekleme. Marka burada küçük damga + ad olarak durur.
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '0%'])

  return (
    <footer ref={ref} className="dark relative z-10 overflow-hidden bg-indigo-950 text-slate-100">
      {/* Hareket azaltmada durağanlık CSS'ten (bkz. Showcase.tsx notu) */}
      <m.div style={{ y }} className="motion-reduce:transform-none! mx-auto max-w-7xl px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-20 sm:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <BloomMark className="h-[22px] w-[22px] text-slate-900" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-indigo-950" />
              </span>
              <span className="font-display text-lg font-bold tracking-[-0.04em] text-slate-50">Derinay</span>
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-300">
              Psikologlar İçin Danışan, Seans ve Finans Takibi.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:col-span-6 sm:justify-self-end">
            {[
              ['Neler Var', '#panel'],
              ['Seans Defteri', '#defter'],
              ['Finans', '#finans'],
              ['Güvenlik', '#guven'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="group font-semibold text-slate-300 transition-colors hover:text-white">
                <span className="roll">
                  <span data-t={label}>{label}</span>
                </span>
              </a>
            ))}
            <Link href="/login" className="group font-semibold text-amber-300 transition-colors hover:text-amber-200">
              <span className="roll">
                <span data-t="Giriş Yap">Giriş Yap</span>
              </span>
            </Link>
            <a href="#lp-main" className="group inline-flex items-center gap-1.5 font-semibold text-slate-300 hover:text-white">
              <span className="roll">
                <span data-t="Başa Dön">Başa Dön</span>
              </span>
              <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" />
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 text-[13px] text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Derinay</span>
          <span>Tüm Hakları Saklıdır</span>
        </div>
      </m.div>
    </footer>
  )
}
