'use client'

import {
  LayoutDashboard,
  CalendarRange,
  Users,
  ArrowLeftRight,
  FileText,
  Landmark,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'
import { CHART } from '@/lib/palette'
import { cn } from '@/lib/utils'

/**
 * Landing'deki "Panele Bir Bakış" — KODLA çizilen panel önizlemesi.
 *
 * Neden ekran görüntüsü değil:
 *  1) Gizlilik — eski JPEG'ler gerçek kullanıcının adını, unvanını ve gelir
 *     rakamlarını public/ altında yayınlıyordu.
 *  2) Eskimezlik — tipografi/palet değişince görüntü yalan söylemeye başlıyor.
 *  3) Tema + ağırlık — tek bileşen her iki temada doğru render eder; iki ayrı
 *     dosya ve ~1.2 MB indirme gerekmez.
 *
 * Buradaki tüm veriler UYDURMA ve jeneriktir; gerçek kayıt yoktur.
 */

const NAV = [
  { icon: LayoutDashboard, label: 'Genel Bakış', active: true },
  { icon: CalendarRange, label: 'Ajanda', active: false },
  { icon: Users, label: 'Danışanlar', active: false },
  { icon: ArrowLeftRight, label: 'Gelir & Gider', active: false },
  { icon: FileText, label: 'Makbuzlar', active: false },
  { icon: Landmark, label: 'Vergiler', active: false },
] as const

const KPIS = [
  { label: 'Aylık Gelir', value: '₺48.250', icon: TrendingUp, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/12', delta: '%12 ↑', up: true },
  { label: 'Aylık Gider', value: '₺15.480', icon: TrendingDown, tone: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/12', delta: '%4 ↓', up: false },
  { label: 'Net Kâr', value: '₺32.770', icon: Wallet, tone: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-500/12', delta: '%18 ↑', up: true },
  { label: 'Ödenecek Vergi', value: '₺9.654', icon: Landmark, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/12', delta: null, up: false },
] as const

const WEEK = [
  { day: 'Pzt', n: 15, slots: 2, today: false },
  { day: 'Sal', n: 16, slots: 1, today: false },
  { day: 'Çar', n: 17, slots: 3, today: true },
  { day: 'Per', n: 18, slots: 2, today: false },
  { day: 'Cum', n: 19, slots: 1, today: false },
  { day: 'Cmt', n: 20, slots: 0, today: false },
  { day: 'Paz', n: 21, slots: 0, today: false },
] as const

const DOTS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500']

export function PanelPreview() {
  return (
    <div className="flex min-h-[400px] text-left">
      {/* Kenar çubuğu */}
      <aside className="hidden w-44 shrink-0 flex-col gap-4 border-r border-slate-500/10 bg-slate-500/[0.02] p-4 sm:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50">
            <BloomMark className="h-4 w-4 text-amber-50 dark:text-slate-900" />
          </span>
          <span className="font-display text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Derinay
          </span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <span
              key={n.label}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium',
                n.active
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                  // Pasif satır: açık temada 500, koyu temada 400 (aydınlanır).
                  // Ters yazım (400 → 500) koyuda kontrastı AA altına düşürüyordu.
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <n.icon className="h-3.5 w-3.5 shrink-0" />
              {n.label}
            </span>
          ))}
        </nav>
      </aside>

      {/* İçerik */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              ✦ Çarşamba, 17 Haziran
            </p>
            <p className="mt-1 font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Günaydın
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">6 Aktif Danışan · Bu Hafta 9 Seans</p>
          </div>
          <span className="hidden shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white sm:block">
            + Ekle
          </span>
        </div>

        {/* KPI şeridi */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-500/10 bg-[rgba(var(--paper),0.55)] p-2.5">
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{k.label}</p>
                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', k.bg, k.tone)}>
                  <k.icon className="h-3 w-3" />
                </span>
              </div>
              <p className="mt-1 font-mono text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
                {k.value}
              </p>
              {k.delta && (
                <p
                  className={cn(
                    'mt-0.5 font-mono text-xs font-semibold tabular-nums',
                    k.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  {k.delta}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Akış grafiği + hafta */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-500/10 bg-[rgba(var(--paper),0.55)] p-3 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                Gelir &amp; Gider Akışı
              </p>
              <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Gelir
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Gider
                </span>
              </span>
            </div>
            <svg className="h-24 w-full" viewBox="0 0 400 96" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="ppFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.income} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={CHART.income} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M0 74 C40 66, 62 44, 96 50 S152 72, 188 56 S242 16, 282 26 S352 44, 400 20 L400 96 L0 96 Z"
                fill="url(#ppFill)"
              />
              <path
                d="M0 74 C40 66, 62 44, 96 50 S152 72, 188 56 S242 16, 282 26 S352 44, 400 20"
                fill="none"
                stroke={CHART.income}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M0 86 C46 82, 70 76, 104 80 S168 88, 208 78 S262 70, 300 76 S358 82, 400 72"
                fill="none"
                stroke={CHART.expense}
                strokeWidth="1.6"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="rounded-xl border border-slate-500/10 bg-[rgba(var(--paper),0.55)] p-3">
            <p className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Bu Haftanın Seansları
            </p>
            <div className="grid grid-cols-7 gap-1">
              {WEEK.map((d, di) => (
                <div
                  key={d.day}
                  className={cn(
                    'rounded-md border px-0.5 py-1 text-center',
                    d.today ? 'border-indigo-500/40 bg-indigo-500/[0.07]' : 'border-slate-500/10',
                  )}
                >
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{d.day}</p>
                  <p
                    className={cn(
                      'font-mono text-[11px] font-bold tabular-nums',
                      d.today ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400',
                    )}
                  >
                    {d.n}
                  </p>
                  <div className="mt-1 flex flex-col items-center gap-0.5">
                    {d.slots > 0 ? (
                      Array.from({ length: d.slots }).map((_, si) => (
                        <span key={si} className={cn('h-1 w-1 rounded-full', DOTS[(di + si) % DOTS.length])} />
                      ))
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-slate-500/15" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-slate-500/10 pt-2.5">
              {['09:00', '13:00', '16:00'].map((t, i) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{t}</span>
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOTS[i % DOTS.length])} />
                  <span className="h-1.5 flex-1 rounded-full bg-slate-500/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
