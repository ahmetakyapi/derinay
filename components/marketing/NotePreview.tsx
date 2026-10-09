import { MOODS, MOOD_BG, MOOD_LABEL, NOTE_KIND_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Seans Defteri kesiti — kodla çizilir, ekran görüntüsü değil.
 *
 * Rozet metinleri ve duygu renkleri uygulamanın KENDİ sözlüklerinden gelir
 * (`NOTE_KIND_LABEL`, `MOOD_LABEL`, `MOOD_BG`); landing ile panel aynı dili
 * konuşur ve sözlük değişirse bu kesit de birlikte değişir.
 *
 * Not metni uydurmadır ve gerçek bir danışana ait değildir — jenerik, klinik
 * olarak nötr bir örnek.
 */

/**
 * Duygu izleği — yükseklik duygunun SIRASINDAN türer, elle seçilmez.
 * `MOODS` zorludan iyiye doğru sıralı olduğu için çubuk yüksekliği o sırayı
 * takip eder; sözlük değişirse görsel de tutarlı kalır. Taban 14px: daha
 * kısası yuvarlak uçlar yüzünden çubuk değil nokta gibi okunuyor.
 */
const MOOD_H: Record<(typeof MOODS)[number], string> = {
  difficult: 'h-3.5',
  low: 'h-5',
  neutral: 'h-7',
  good: 'h-9',
  great: 'h-11',
}

const TRAIL: { mood: (typeof MOODS)[number]; day: string }[] = [
  { mood: 'low', day: '4 Nis' },
  { mood: 'neutral', day: '11 Nis' },
  { mood: 'difficult', day: '18 Nis' },
  { mood: 'neutral', day: '25 Nis' },
  { mood: 'good', day: '2 May' },
  { mood: 'good', day: '9 May' },
  { mood: 'great', day: '16 May' },
]

/** Not kartı izleğin SON günüdür — rozet ve tarih oradan okunur, elle yazılmaz.
    Aksi halde kart "16 May · İyi" derken izlek aynı günü "Çok İyi" gösteriyordu. */
const LATEST = TRAIL[TRAIL.length - 1]

export function NotePreview() {
  return (
    <div className="p-4 sm:p-5">
      {/* Not kartı */}
      <div className="rounded-xl border border-slate-500/12 bg-[rgba(var(--paper),0.72)] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-indigo-500/40 bg-indigo-500/12 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {NOTE_KIND_LABEL.session}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/15 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className={cn('h-2 w-2 rounded-full', MOOD_BG[LATEST.mood])} />
            {MOOD_LABEL[LATEST.mood]}
          </span>
          <span className="ml-auto font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">{LATEST.day} 14:00</span>
        </div>

        <p className="mt-2.5 font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Uyku düzeni üzerine
        </p>
        {/* Çizgili kâğıt hissi — panelin .note-paper dokusunun sade hâli */}
        <div className="mt-2 space-y-[7px]">
          {['w-full', 'w-[92%]', 'w-[97%]', 'w-[64%]'].map((w, i) => (
            <span key={i} className={cn('block h-[5px] rounded-full bg-slate-500/12', w)} />
          ))}
        </div>
      </div>

      {/* Duygu izleği */}
      <div className="mt-3 rounded-xl border border-slate-500/12 bg-[rgba(var(--paper),0.55)] p-3.5">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Duygu İzleği</p>
        <div className="mt-3 flex items-end gap-3">
          {TRAIL.map((t) => (
            <div key={t.day} className="flex flex-1 flex-col items-center gap-1.5">
              <span className={cn('block w-3 rounded-full', MOOD_BG[t.mood], MOOD_H[t.mood])} />
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{t.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hedef — tedavi planının hafif hâli */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-500/12 px-3 py-2.5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200">
          Uyku düzenini iyileştirmek
        </span>
        <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/12 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Tamamlandı
        </span>
      </div>
    </div>
  )
}
