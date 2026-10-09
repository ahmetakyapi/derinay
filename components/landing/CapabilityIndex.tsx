'use client'

import { motion } from 'framer-motion'
import { Users, CalendarRange, StickyNote, FileText, Wallet, PieChart } from 'lucide-react'
import { RevealText } from '@/components/motion/RevealText'
import { Reveal } from '@/components/motion/Reveal'
import { lineDraw } from '@/lib/variants'

/**
 * Panelin içindekiler — bir sergi DİZİNİ gibi numaralı satırlar.
 * Gruplar uydurma değil: `DashboardShell` NAV_GROUPS adlarını taşır.
 *
 * Etkileşim: satırın üstüne gelince çam mürekkep aşağıdan yükselip satırı
 * doldurur, başlık sağa kayar, ikon döner. Saç çizgileri görünüme girince
 * soldan çizilir. Sol sütun (başlık) masaüstünde yapışkandır.
 */
const ITEMS = [
  { group: 'klinik', icon: Users, title: 'Danışan Dosyası', body: 'İletişim, etiket, seans ücreti, onam durumu ve tüm geçmiş tek kartta.' },
  { group: 'klinik', icon: CalendarRange, title: 'Ajanda', body: 'Haftalık saat ızgarası. Seansı sürükleyip bırak; çakışmayı panel söyler.' },
  { group: 'klinik', icon: StickyNote, title: 'Seans Defteri', body: 'Tür ve duygu etiketli notlar, SOAP şablonları, zamanla çıkan duygu izleği.' },
  { group: 'finans', icon: Wallet, title: 'Gelir & Gider', body: 'Kategori bazlı hareketler; sabit kalemler tek tıkla sonraki aya kopyalanır.' },
  { group: 'finans', icon: FileText, title: 'Makbuz', body: 'Serbest meslek makbuzu tek ekranda kesilir; numara sıradan devam eder.' },
  { group: 'finans', icon: PieChart, title: 'Analiz & Rapor', body: 'Yıllık akış, biriken bakiye ve muhasebeciye giden tek dosyalık rapor.' },
] as const

export function CapabilityIndex() {
  return (
    <section id="panel" className="relative z-10 scroll-mt-24 px-6 py-28 sm:px-10 sm:py-40">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">(02) panelin içi</p>
            <h2 className="mt-5 font-display text-[clamp(2.3rem,4.6vw,3.8rem)] font-bold leading-[0.98] tracking-[-0.05em] text-slate-900 dark:text-white">
              <RevealText text="Bir Pratiğin Döndüğü Her Şey Burada" stagger={0.05} />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-sm text-[15.5px] leading-[1.75] text-slate-500 dark:text-slate-400">
                Ayrı defterler, tablolar ve klasörler yerine tek panel. Bir seansı tamamladığında takvim,
                danışan dosyası ve paket kullanımı aynı anda güncellenir.
              </p>
            </Reveal>
          </div>
        </div>

        <ol className="mt-16 lg:col-span-8 lg:mt-0">
          {ITEMS.map((c, i) => (
            <li key={c.title} className="group relative overflow-hidden">
              <motion.span
                aria-hidden
                variants={lineDraw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                className="absolute inset-x-0 top-0 h-px origin-left bg-slate-500/25"
              />
              {/* Hover mürekkebi */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-indigo-900 transition-transform duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
              />
              <Reveal
                delay={0.05}
                className="relative grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-4 px-1 py-8 sm:grid-cols-[3.5rem_1fr_6rem_auto] sm:px-4 sm:py-10"
              >
                <span className="pt-2 font-mono text-xs text-slate-500 transition-colors duration-500 group-hover:text-amber-300 dark:text-slate-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                  <h3 className="font-display text-[1.85rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-900 transition-colors duration-500 group-hover:text-slate-50 dark:text-white sm:text-[2.7rem]">
                    {c.title}
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-500 transition-colors duration-500 group-hover:text-slate-300 dark:text-slate-400">
                    {c.body}
                  </p>
                </div>
                <span className="hidden pt-3 font-mono text-[11px] text-slate-500 transition-colors duration-500 group-hover:text-slate-300 dark:text-slate-400 sm:block">
                  {c.group}
                </span>
                <c.icon
                  aria-hidden
                  className="mt-2 h-6 w-6 text-indigo-600 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-12 group-hover:scale-125 group-hover:text-amber-300 dark:text-indigo-400"
                />
              </Reveal>
            </li>
          ))}
          <motion.li
            aria-hidden
            variants={lineDraw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="h-px origin-left bg-slate-500/25"
          />
        </ol>
      </div>
    </section>
  )
}
