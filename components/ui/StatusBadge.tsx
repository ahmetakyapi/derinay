import { cn } from '@/lib/utils'

type Tone = 'emerald' | 'amber' | 'slate' | 'sky' | 'red' | 'indigo' | 'violet'

// Metin tonu ÇİFT: açık temada 600 (kâğıt üstünde AA kontrast), koyu temada 400.
// Tek tonda (500) açık tema kontrastı AA altına düşüyordu.
const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400',
  amber:   'bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400',
  slate:   'bg-slate-500/12 text-slate-600 ring-slate-400/25 dark:text-slate-300',
  sky:     'bg-sky-500/12 text-sky-600 ring-sky-500/25 dark:text-sky-400',
  red:     'bg-rose-500/12 text-rose-600 ring-rose-500/25 dark:text-rose-400',
  indigo:  'bg-indigo-500/12 text-indigo-700 ring-indigo-500/25 dark:text-indigo-300',
  violet:  'bg-violet-500/12 text-violet-600 ring-violet-500/25 dark:text-violet-300',
}

export function StatusBadge({
  label,
  tone = 'slate',
  className,
}: {
  label: string
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  )
}
