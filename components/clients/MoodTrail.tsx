import { MOOD_LABEL, MOOD_BG, MOODS, type Mood } from '@/lib/constants'
import { formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Duygu izleği — danışanın seans notlarındaki duygu durumlarının kronolojik dizisi.
 * Yükseklik duyguya göre değişir (çok iyi = yüksek, zorlu = alçak) → mini dalga formu.
 */
const MOOD_HEIGHT: Record<Mood, string> = {
  great: 'h-9',
  good: 'h-7',
  neutral: 'h-5',
  low: 'h-3.5',
  difficult: 'h-2',
}

export function MoodTrail({
  entries,
}: {
  entries: { mood: Mood; date: string }[]
}) {
  if (!entries.length) {
    return (
      <p className="py-3 text-center text-xs text-slate-500 dark:text-slate-400">
        Not eklerken duygu seçersen danışanın seyri burada görünür.
      </p>
    )
  }

  // Kronolojik (eski → yeni), son 16 kayıt
  const trail = entries.slice(0, 16).reverse()

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-500/10 bg-[rgba(var(--paper),0.42)] px-3 py-3">
        <div className="flex items-end gap-2 overflow-x-auto pb-1">
          {trail.map((e, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <span
                title={`${MOOD_LABEL[e.mood]} · ${formatDateShort(e.date)}`}
                className={cn(
                  'block w-4 cursor-default rounded-full transition-all hover:scale-y-110',
                  MOOD_BG[e.mood],
                  MOOD_HEIGHT[e.mood],
                )}
              />
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {formatDateShort(e.date)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {MOODS.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', MOOD_BG[m])} />
            {MOOD_LABEL[m]}
          </span>
        ))}
      </div>
    </div>
  )
}
