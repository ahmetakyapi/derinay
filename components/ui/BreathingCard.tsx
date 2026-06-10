'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Wind } from 'lucide-react'
import { EASE } from '@/lib/variants'

/**
 * Nefes Köşesi — 4-4-4-4 kutu nefesi rehberi.
 * Psikologların seans aralarında kendine dönmesi için küçük bir ritüel:
 * halka nefesle büyür, tutuşta durur, verişte söner.
 */
const PHASES = [
  { label: 'Nefes al', scale: 1.28 },
  { label: 'Tut', scale: 1.28 },
  { label: 'Nefes ver', scale: 1 },
  { label: 'Tut', scale: 1 },
] as const

const PHASE_MS = 4000

export function BreathingCard() {
  const [phase, setPhase] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), PHASE_MS)
    return () => clearInterval(t)
  }, [reduced])

  const current = PHASES[phase]

  return (
    <section className="glass relative flex flex-col items-center overflow-hidden rounded-2xl p-5 text-center">
      <h2 className="mb-1 flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
        <Wind className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Nefes Köşesi
      </h2>
      <p className="mb-5 self-start text-[11px] text-slate-400">
        Seans aralarında 1 dakikalık kutu nefesi (4-4-4-4)
      </p>

      <div className="relative flex h-36 w-36 items-center justify-center">
        {/* Dış halkalar — suluboya halesi */}
        <motion.span
          animate={reduced ? undefined : { scale: current.scale * 1.12, opacity: phase < 2 ? 0.5 : 0.25 }}
          transition={{ duration: PHASE_MS / 1000, ease: EASE }}
          className="absolute h-28 w-28 rounded-full bg-indigo-500/10"
        />
        <motion.span
          animate={reduced ? undefined : { scale: current.scale }}
          transition={{ duration: PHASE_MS / 1000, ease: EASE }}
          className="absolute h-24 w-24 rounded-full border border-amber-500/30 bg-gradient-to-br from-indigo-500/15 to-emerald-500/10"
        />
        {/* Merkez */}
        <span className="relative z-10 font-display text-sm font-semibold italic text-slate-700 dark:text-slate-200">
          {reduced ? 'Nefes al…' : current.label}
        </span>
      </div>

      <p className="mt-4 font-display text-xs italic leading-relaxed text-slate-400">
        &ldquo;Nefes, şimdiki ana açılan kapıdır.&rdquo;
      </p>
    </section>
  )
}
