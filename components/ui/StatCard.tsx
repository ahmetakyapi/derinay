'use client'

import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

type Accent = 'emerald' | 'rose' | 'indigo' | 'amber' | 'sky'

const ACCENTS: Record<Accent, { icon: string; glow: string }> = {
  emerald: {
    icon: 'text-emerald-600 bg-emerald-500/12 dark:text-emerald-400',
    glow: 'before:bg-emerald-500/10',
  },
  rose: {
    icon: 'text-rose-600 bg-rose-500/12 dark:text-rose-400',
    glow: 'before:bg-rose-500/10',
  },
  indigo: {
    icon: 'text-indigo-600 bg-indigo-500/12 dark:text-indigo-400',
    glow: 'before:bg-indigo-500/10',
  },
  amber: {
    icon: 'text-amber-600 bg-amber-500/12 dark:text-amber-400',
    glow: 'before:bg-amber-500/10',
  },
  sky: {
    icon: 'text-sky-600 bg-sky-500/12 dark:text-sky-400',
    glow: 'before:bg-sky-500/10',
  },
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'indigo',
  change,
  hint,
  animateTo,
  animateKind = 'currency',
  goodDirection = 'up',
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent?: Accent
  change?: number | null
  hint?: string
  /** Verilirse büyük rakam 0'dan bu değere sayılır (value yine fallback) */
  animateTo?: number
  animateKind?: 'currency' | 'count'
  /** Hangi yön "iyi"dir — gelir/net için 'up', gider için 'down'.
   *  Ok yönü artış/azalışı, renk ise iyi/kötü olduğunu gösterir. */
  goodDirection?: 'up' | 'down'
}) {
  const a = ACCENTS[accent]
  // Ok = değişimin yönü; renk = bu yönün "iyi" mi kötü mü olduğu.
  const rising = (change ?? 0) > 0
  const isGood = change == null || change === 0 ? null : goodDirection === 'up' ? change > 0 : change < 0

  return (
    // Giriş CSS ile (`.stat-rise`, kardeş sırasına göre kademeli). Framer
    // KULLANILMAZ: bittiğinde satır içi `transform: none` bırakıyor ve
    // aşağıdaki hover kalkışını eziyordu.
    <div
      className={cn(
        'stat-rise glass group relative overflow-hidden rounded-2xl p-4 sm:p-5',
        // Üstüne gelince kart hafifçe kalkar, köşedeki renk hâlesi büyür
        'transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-2xl',
        'before:pointer-events-none before:absolute before:-right-8 before:-top-8 before:h-28 before:w-28 before:rounded-full before:blur-2xl before:content-[""]',
        'before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-[2.2]',
        a.glow,
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          {/* sensitive: gizlilik modunda tutarlar da bulanır */}
          {/* font-mono ŞART: display ailesinin ₺ glifi yanlış (bkz. globals.css) */}
          <p className="sensitive mt-2 font-mono text-[1.3rem] font-bold leading-none tracking-tight tabular-nums text-slate-900 dark:text-white sm:text-[1.6rem]">
            {animateTo !== undefined ? <AnimatedNumber to={animateTo} kind={animateKind} /> : value}
          </p>
        </div>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-110 sm:h-10 sm:w-10',
            a.icon,
          )}
        >
          {icon}
        </span>
      </div>

      {(change !== undefined && change !== null) || hint ? (
        <div className="relative z-10 mt-3.5 flex items-center gap-2 text-xs">
          {change !== undefined && change !== null && (
            <span
              aria-label={`Geçen döneme göre %${Math.abs(change).toFixed(0)} ${rising ? 'arttı' : change === 0 ? 'değişmedi' : 'azaldı'}`}
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono font-semibold tabular-nums',
                isGood === null
                  ? 'bg-slate-500/12 text-slate-500 dark:text-slate-400'
                  : isGood
                    ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
              )}
            >
              {change === 0 ? <Minus className="h-3 w-3" /> : rising ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              %{Math.abs(change).toFixed(0)}
            </span>
          )}
          {hint && <span className="text-slate-500 dark:text-slate-400">{hint}</span>}
        </div>
      ) : null}
    </div>
  )
}
