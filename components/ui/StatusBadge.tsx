import { cn } from '@/lib/utils'

type Tone = 'emerald' | 'amber' | 'slate' | 'sky' | 'red' | 'indigo' | 'violet'

const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-500/12 text-emerald-500 ring-emerald-500/25',
  amber:   'bg-amber-500/12 text-amber-500 ring-amber-500/25',
  slate:   'bg-slate-500/12 text-slate-400 ring-slate-400/25',
  sky:     'bg-sky-500/12 text-sky-500 ring-sky-500/25',
  red:     'bg-rose-500/12 text-rose-500 ring-rose-500/25',
  indigo:  'bg-indigo-500/12 text-indigo-400 ring-indigo-500/25',
  violet:  'bg-violet-500/12 text-violet-400 ring-violet-500/25',
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
