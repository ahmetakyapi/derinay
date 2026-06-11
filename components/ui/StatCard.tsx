'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/lib/variants'
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
}) {
  const a = ACCENTS[accent]
  const positive = (change ?? 0) >= 0

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={cn(
        'glass group relative overflow-hidden rounded-2xl p-5',
        'before:pointer-events-none before:absolute before:-right-8 before:-top-8 before:h-28 before:w-28 before:rounded-full before:blur-2xl before:content-[""]',
        a.glow,
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-display text-[1.7rem] font-semibold leading-none tracking-tight text-slate-900 dark:text-white">
            {animateTo !== undefined ? <AnimatedNumber to={animateTo} kind={animateKind} /> : value}
          </p>
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', a.icon)}>
          {icon}
        </span>
      </div>

      {(change !== undefined && change !== null) || hint ? (
        <div className="relative z-10 mt-3.5 flex items-center gap-2 text-xs">
          {change !== undefined && change !== null && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono font-semibold tabular-nums',
                positive
                  ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change).toFixed(0)}%
            </span>
          )}
          {hint && <span className="text-slate-500 dark:text-slate-400">{hint}</span>}
        </div>
      ) : null}
    </motion.div>
  )
}
