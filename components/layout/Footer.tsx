'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'
import { EASE_OUT_EXPO } from '@/lib/variants'

const WORD = 'Derinay'

/**
 * Landing altlığı — sayfanın imzası.
 *
 * Dev marka sözcüğü ekran genişliğini doldurur; harfler görünüme girince
 * sırayla yükselir. İçerik kaydırmaya bağlı hafif bir paralaksla aşağıdan
 * "açılır" — sayfanın sonunda bir kapak kalkıyormuş gibi.
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const wordRef = useRef<HTMLParagraphElement>(null)
  const inView = useInView(wordRef, { once: true, margin: '0px 0px -5% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '0%'])

  return (
    <footer ref={ref} className="relative z-10 overflow-hidden bg-indigo-950 text-slate-100">
      <motion.div style={{ y }} className="mx-auto max-w-7xl px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-20 sm:px-10">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <BloomMark className="h-8 w-8 text-amber-400" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-300">
              Tek kişilik bir klinik pratiğin sakin çalışma masası. Danışan, ajanda, defter ve finans tek yerde.
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

        {/* Dev imza — genişliği dolduran sözcük */}
        <p
          ref={wordRef}
          aria-label={WORD}
          className="mt-8 flex select-none overflow-hidden pb-[0.16em] font-display text-[22vw] font-bold leading-[0.85] tracking-[-0.07em] text-slate-50 xl:text-[19.5rem]"
        >
          {WORD.split('').map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={{ y: '100%' }}
              animate={{ y: inView ? '0%' : '100%' }}
              transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: i * 0.06 }}
            >
              {ch}
            </motion.span>
          ))}
        </p>

        <div className="mt-6 flex flex-col justify-between gap-2 font-mono text-[11px] text-slate-400 sm:flex-row">
          <span>© {new Date().getFullYear()} derinay</span>
          <span>psikologlar için finans ve danışan takibi</span>
        </div>
      </motion.div>
    </footer>
  )
}
