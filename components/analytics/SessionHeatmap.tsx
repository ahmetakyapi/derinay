'use client'

import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'

/**
 * Seans ritmi: sütunlar hafta, satırlar gün (Pazartesi başta), her kare o
 * günün seans sayısı (dev-starter `heatmap` uyarlaması). "Salı yoğun",
 * "Ağustos sakin" gibi ritmi tek bakışta gösterir; kesin sayı balonda.
 *
 * BEŞ BASAMAK, TEK AİLE (çam): renk değil açıklık sayar — gri baskıda da
 * sıra korunur. Tarihler UTC'de hesaplanır (yaz saati kaymasın); bitiş günü
 * PROP'tan gelir, `Date.now` değil: sunucu ve istemci aynı ızgarayı basar.
 *
 * Kare boyu kart genişliğinden (container query, 12–22 px); sığmayan geçmiş yatay
 * kayar ve açılışta en yeni haftaya kaydırılır. Ekrana girince kareler soldan
 * sağa dalga hâlinde belirir (tek gözlemci, CSS geçişi). Klavye: ← → hafta,
 * ↑ ↓ gün; seçilen gün canlı bölgede okunur, aylık toplamlar `sr-only` tabloda.
 */

type Day = { date: string; value: number }
type Cell = { date: string; value: number; level: 0 | 1 | 2 | 3 | 4; col: number; row: number }

const LEVEL = ['bg-slate-500/10', 'bg-indigo-500/25', 'bg-indigo-500/50', 'bg-indigo-500/75', 'bg-indigo-600 dark:bg-indigo-400'] as const
const DAY = 86_400_000
const ROWS = '1rem repeat(7, var(--cell))'

const toUTC = (iso: string) => {
  const [y, mo, d] = iso.split('-').map(Number)
  return Date.UTC(y, mo - 1, d)
}
const toISO = (t: number) => new Date(t).toISOString().slice(0, 10)
const monthShort = new Intl.DateTimeFormat('tr-TR', { month: 'short', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long', timeZone: 'UTC' })
const monthLong = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

function grid(data: readonly Day[], end: string, weeks: number) {
  const byDate = new Map(data.map((d) => [d.date, d.value]))
  const last = toUTC(end)
  const row = (t: number) => (new Date(t).getUTCDay() + 6) % 7
  const start = last - row(last) * DAY - (weeks - 1) * 7 * DAY
  const max = Math.max(...data.map((d) => d.value), 1)
  const b = [max * 0.25, max * 0.5, max * 0.75]
  const level = (v: number): Cell['level'] => (v <= 0 ? 0 : v <= b[0] ? 1 : v <= b[1] ? 2 : v <= b[2] ? 3 : 4)
  const cells: Cell[] = []
  const months: { col: number; label: string }[] = []
  for (let t = start; t <= last; t += DAY) {
    const i = Math.round((t - start) / DAY)
    const date = toISO(t)
    const value = byDate.get(date) ?? 0
    const col = Math.floor(i / 7)
    cells.push({ date, value, level: level(value), col, row: i % 7 })
    if (new Date(t).getUTCDate() === 1 || i === 0) {
      if (i === 0 && new Date(t + 14 * DAY).getUTCMonth() !== new Date(t).getUTCMonth()) continue
      months.push({ col, label: monthShort.format(t).replace('.', '') })
    }
  }
  return { cells, months }
}

export function SessionHeatmap({ data, end, weeks = 26, className }: { data: readonly Day[]; end: string; weeks?: number; className?: string }) {
  const { cells, months } = grid(data, end, weeks)
  const wrap = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const shown = useInView(scroller, { once: true, amount: 0.3 }) || reduce === true
  const [active, setActive] = useState<number | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const [live, setLive] = useState('')

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  function place(index: number) {
    const cell = scroller.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)
    const box = wrap.current?.getBoundingClientRect()
    if (!cell || !box) return
    const r = cell.getBoundingClientRect()
    setActive(index)
    setTip({ x: r.left + r.width / 2 - box.left, y: r.top - box.top })
  }
  function onPointer(e: PointerEvent<HTMLDivElement>) {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-i]')
    if (t) place(Number(t.dataset.i))
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step: Record<string, number> = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }
    if (e.key === 'Escape') return setActive(null)
    let next: number | null = null
    if (e.key in step) next = Math.min(cells.length - 1, Math.max(0, (active ?? cells.length - 1) + (active === null ? 0 : step[e.key])))
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = cells.length - 1
    if (next === null) return
    e.preventDefault()
    scroller.current?.querySelector(`[data-i="${next}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    place(next)
    setLive(`${longDate.format(toUTC(cells[next].date))}: ${cells[next].value} seans`)
  }

  const monthTotals = new Map<string, number>()
  for (const c of cells) monthTotals.set(c.date.slice(0, 7), (monthTotals.get(c.date.slice(0, 7)) ?? 0) + c.value)
  const monthAt = new Map(months.map((m) => [m.col, m.label]))
  const current = active !== null ? cells[active] : null
  const dayLabel = ['Pzt', '', 'Çar', '', 'Cum', '', '']

  return (
    <figure ref={wrap} className={cn('@container relative w-full', className)}>
      <div className="sr-only">
        <table>
          <caption>Seans ritmi: aylık toplam</caption>
          <tbody>
            {[...monthTotals].map(([k, total]) => (
              <tr key={k}>
                <th scope="row">{monthLong.format(toUTC(`${k}-01`))}</th>
                <td>{total} seans</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kare boyu kartın genişliğinden (cqw): geniş ekranda yıl tam sığar,
          dar ekranda 12 px'te durur ve geçmiş yatay kayar. */}
      <div className="flex gap-1.5" style={{ '--cell': `clamp(12px, calc((100cqw - 2.5rem) / ${weeks} - 3px), 22px)` } as CSSProperties}>
        <div aria-hidden className="grid shrink-0 gap-[3px] text-xs leading-none text-slate-500 dark:text-slate-400" style={{ gridTemplateRows: ROWS }}>
          <span />
          {dayLabel.map((d, i) => (
            <span key={i} className="flex items-center">{d}</span>
          ))}
        </div>
        <div
          ref={scroller}
          role="group"
          aria-label="Seans ritmi: oklarla gün gün gezin"
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
          onPointerOver={onPointer}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded-sm p-0.5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-indigo-500/60"
        >
          <div aria-hidden className="grid w-max grid-flow-col gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks}, var(--cell))`, gridTemplateRows: ROWS }}>
            {Array.from({ length: weeks }, (_, col) => {
              const label = monthAt.get(col)
              const delay = `${Math.round((col / weeks) * 620)}ms`
              return (
                <Week key={col} col={col} label={label} cells={cells} active={active} shown={shown} delay={delay} />
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400" aria-hidden>
        <span>Az</span>
        {LEVEL.map((c) => (
          <span key={c} className={cn('h-2.5 w-2.5 rounded-[3px]', c)} />
        ))}
        <span>Çok</span>
      </div>

      {current && tip ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-slate-500/15 bg-[rgb(var(--paper))] px-2.5 py-1.5 shadow-xl"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          <p className="font-mono text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
            {current.value} seans
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{longDate.format(toUTC(current.date))}</p>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">{live}</p>
    </figure>
  )
}

function Week({ col, label, cells, active, shown, delay }: { col: number; label?: string; cells: readonly Cell[]; active: number | null; shown: boolean; delay: string }) {
  return (
    <>
      <span className="relative min-w-0">
        {label ? <span className="absolute bottom-1 left-0 whitespace-nowrap text-xs leading-none text-slate-500 dark:text-slate-400">{label}</span> : null}
      </span>
      {Array.from({ length: 7 }, (_, row) => {
        const i = col * 7 + row
        const cell = cells[i]
        if (!cell) return <span key={row} />
        return (
          <span
            key={row}
            data-i={i}
            className={cn(
              'rounded-[3px] transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              LEVEL[cell.level],
              shown ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
              active === i && 'ring-2 ring-slate-900 ring-offset-1 ring-offset-[rgb(var(--paper))] dark:ring-white',
            )}
            style={{ transitionDelay: shown ? delay : '0ms' }}
          />
        )
      })}
    </>
  )
}
