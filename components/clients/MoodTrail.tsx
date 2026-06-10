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
      <p className="py-3 text-center text-xs text-slate-400">
        Not eklerken duygu seçersen danışanın izleği burada belirir.
      </p>
    )
  }

  // Kronolojik (eski → yeni), son 16 kayıt
  const trail = entries.slice(0, 16).reverse()

  return (
    <div>
      <div className="flex h-12 items-end gap-1.5">
        {trail.map((e, i) => (
          <span
            key={i}
            title={`${MOOD_LABEL[e.mood]} · ${formatDateShort(e.date)}`}
            className={cn(
              'w-3 flex-1 cursor-default rounded-full transition-all hover:scale-y-110',
              MOOD_BG[e.mood],
              MOOD_HEIGHT[e.mood],
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        {MOODS.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <span className={cn('h-1.5 w-1.5 rounded-full', MOOD_BG[m])} />
            {MOOD_LABEL[m]}
          </span>
        ))}
      </div>
    </div>
  )
}
