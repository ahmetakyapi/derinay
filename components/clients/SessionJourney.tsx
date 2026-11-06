import { Flag, Gauge, Package } from 'lucide-react'
import { MOOD_BG, MOOD_LABEL, SESSION_STATUS_LABEL, type Mood, type SessionStatus } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Seans yolculuğu — danışanın ilk seansından bugüne tek çizgi.
 *
 * Çizgi yaşanmış kısımda mürekkeple boyanır (`.brush-fill`), bugünden sonrası
 * soluk iz. Seans noktaları çizginin üstünde: tamamlanan dolu (o gün ruh hali
 * notu varsa onun rengiyle), planlanan içi boş halka, iptal/gelmedi küçük
 * kil noktası. Üstte kilometre taşları: ulaşılan hedef, ölçüm, paket alımı.
 *
 * SUNUCUDA ÇİZİLİR, JS yok. Konumlar tarih aralığına göre yüzde. Telefonda
 * şerit yatay kayar ve açılışta EN SONDA durur (`direction: rtl` kabı,
 * `ltr` içerik — scrollLeft ayarlamak için istemci kodu gerekmez).
 *
 * Erişilebilirlik: görsel `aria-hidden`; aynı bilgi `sr-only` listede.
 * Nokta `title`'larında yalnız tarih ve durum (danışan adı/tutar yok — §10).
 */

type Props = {
  sessions: { id: string; date: Date | string; status: SessionStatus }[]
  notes: { createdAt: Date | string; mood: Mood | null }[]
  goals: { id: string; title: string; achievedAt: string | null }[]
  scores: { id: string; date: string; label: string }[]
  packagePurchase?: string | null
  /** Sunucunun "şimdi"si — tek kaynak, hidrasyon farkı yok */
  now: string
}

const DAY = 86_400_000
const dkey = (d: Date | string) => new Date(d).toISOString().slice(0, 10)
const monthShort = new Intl.DateTimeFormat('tr-TR', { month: 'short' })

export function SessionJourney({ sessions, notes, goals, scores, packagePurchase, now }: Props) {
  if (!sessions.length) return null

  const nowMs = new Date(now).getTime()
  const times = sessions.map((s) => new Date(s.date).getTime())
  const start = Math.min(...times) - 3 * DAY
  const end = Math.max(nowMs, ...times) + 5 * DAY
  const span = end - start
  const pos = (d: Date | string) => ((new Date(d).getTime() - start) / span) * 100
  const todayPct = pos(now)

  const moodByDay = new Map<string, Mood>()
  for (const n of notes) if (n.mood) moodByDay.set(dkey(n.createdAt), n.mood)

  const ordered = [...sessions].sort((a, b) => +new Date(a.date) - +new Date(b.date))
  const completed = ordered.filter((s) => s.status === 'completed').length
  const months = Math.max(1, Math.round((nowMs - Math.min(...times)) / (30 * DAY)))

  // Ay etiketleri: aralıktaki her ayın ilk günü
  const ticks: { pct: number; label: string }[] = []
  const first = new Date(start)
  for (let d = new Date(first.getFullYear(), first.getMonth() + 1, 1); d.getTime() < end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    ticks.push({ pct: pos(d), label: monthShort.format(d).replace('.', '') })
  }

  const milestones = [
    ...goals.filter((g) => g.achievedAt).map((g) => ({ key: `g${g.id}`, date: g.achievedAt!, kind: 'goal' as const, label: `Hedefe ulaşıldı: ${g.title}` })),
    ...scores.map((s) => ({ key: `s${s.id}`, date: s.date, kind: 'score' as const, label: `Ölçüm: ${s.label}` })),
    ...(packagePurchase ? [{ key: 'pkg', date: packagePurchase, kind: 'package' as const, label: 'Paket alındı' }] : []),
  ].filter((m) => new Date(m.date).getTime() >= start && new Date(m.date).getTime() <= end)

  const MS_ICON = { goal: Flag, score: Gauge, package: Package }
  const MS_TONE = {
    goal: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    score: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    package: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  }

  return (
    <section className="glass mb-6 rounded-2xl p-5">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">Seans Yolculuğu</h2>
        <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
          İlk seans {formatDate(String(ordered[0].date))} · <span className="font-mono tabular-nums">{completed}</span> tamamlanan ·{' '}
          <span className="font-mono tabular-nums">{months}</span> ay
        </p>
      </div>

      <ol className="sr-only">
        {ordered.map((s) => (
          <li key={s.id}>
            {formatDate(String(s.date))}: {SESSION_STATUS_LABEL[s.status]}
            {moodByDay.get(dkey(s.date)) ? `, ruh hali ${MOOD_LABEL[moodByDay.get(dkey(s.date))!]}` : ''}
          </li>
        ))}
        {milestones.map((m) => (
          <li key={m.key}>
            {formatDate(m.date)}: {m.label}
          </li>
        ))}
      </ol>

      {/* rtl kap + ltr içerik: telefonda şerit açılışta en yeni uçta durur */}
      <div aria-hidden className="-mx-5 overflow-x-auto px-5 [direction:rtl] [scrollbar-width:none]">
        <div className="relative h-36 min-w-160 [direction:ltr]">
          {/* Kilometre taşları — üst bant, sapla çizgiye bağlanır */}
          {milestones.map((m, i) => {
            const Icon = MS_ICON[m.kind]
            return (
              <span
                key={m.key}
                title={`${formatDate(m.date)} · ${m.kind === 'goal' ? 'Hedefe ulaşıldı' : m.kind === 'score' ? 'Ölçüm' : 'Paket alındı'}`}
                className="dot-in absolute top-2 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${pos(m.date)}%`, '--i': i + 6 } as React.CSSProperties}
              >
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', MS_TONE[m.kind])}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="h-8 w-px bg-linear-to-b from-slate-500/30 to-transparent" />
              </span>
            )
          })}

          {/* Çizgi: soluk iz + bugüne dek boyanmış mürekkep */}
          <div className="absolute inset-x-0 top-[72px] h-px bg-slate-500/20" />
          <div
            className="brush-fill absolute left-0 top-[71px] h-[3px] rounded-full bg-linear-to-r from-indigo-500/40 via-indigo-500 to-indigo-600 dark:to-indigo-400"
            style={{ width: `${todayPct}%` }}
          />

          {/* Bugün */}
          <span className="absolute top-[52px] h-10 w-px border-l border-dashed border-amber-500/70" style={{ left: `${todayPct}%` }} />

          {/* Seans noktaları */}
          {ordered.map((s, i) => {
            const mood = moodByDay.get(dkey(s.date))
            const done = s.status === 'completed'
            const planned = s.status === 'scheduled'
            return (
              <span
                key={s.id}
                title={`${formatDate(String(s.date))} · ${SESSION_STATUS_LABEL[s.status]}${mood ? ` · ${MOOD_LABEL[mood]}` : ''}`}
                className={cn(
                  'dot-in absolute top-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                  done && cn('h-3 w-3 ring-[3px] ring-[rgb(var(--paper))]', mood ? MOOD_BG[mood] : 'bg-indigo-600 dark:bg-indigo-400'),
                  planned && 'h-3 w-3 border-2 border-indigo-500 bg-[rgb(var(--paper))]',
                  !done && !planned && 'h-2 w-2 bg-rose-500/60',
                )}
                style={{ left: `${pos(s.date)}%`, '--i': i } as React.CSSProperties}
              />
            )
          })}

          {/* Ay etiketleri + bugün etiketi */}
          {ticks.map((t) => (
            <span key={t.pct} className="absolute top-[92px] -translate-x-1/2 text-xs text-slate-500 dark:text-slate-400" style={{ left: `${t.pct}%` }}>
              {t.label}
            </span>
          ))}
          <span
            className="absolute top-[114px] -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-amber-700 dark:text-amber-300"
            style={{ left: `${todayPct}%` }}
          >
            Bugün
          </span>
        </div>
      </div>

      {/* Lejant: hareket tek kanal değil — şekil + renk + ad */}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" /> Tamamlandı</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border-2 border-indigo-500" /> Planlandı</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500/60" /> İptal / Gelmedi</span>
        <span className="flex items-center gap-1.5"><Flag className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Hedef</span>
        <span className="flex items-center gap-1.5"><Gauge className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Ölçüm</span>
        {packagePurchase && <span className="flex items-center gap-1.5"><Package className="h-3 w-3 text-sky-600 dark:text-sky-400" /> Paket</span>}
        <span className="flex items-center gap-1.5">Renkli nokta = o günün ruh hali</span>
      </div>
    </section>
  )
}
