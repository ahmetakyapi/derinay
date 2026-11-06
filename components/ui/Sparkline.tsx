import { cn } from '@/lib/utils'

/**
 * Mürekkep eğrisi: eksensiz, ızgarasız mini seri (dev-starter `sparkline`
 * uyarlaması). Eğri bir EĞİLİM işareti; okunacak sayı yanındaki KPI.
 *
 * Renk `currentColor` (çağıran `text-emerald-500` vb. verir). Çizgi kalemle
 * çekilir gibi gelir (`.ink-draw`), alan sonra yıkanır (`.ink-fill`); son
 * nokta zeminden halkayla ayrılır. Yumuşak eğri: kontrol noktaları komşu
 * eğimden (Catmull-Rom → Bézier), keskin kırık çizgi kâğıt diline uymuyor.
 */
export function Sparkline({
  values,
  title,
  width = 120,
  height = 34,
  delay = 0.4,
  className,
}: {
  values: readonly number[]
  /** Ekran okuyucu adı: "Son 6 Ay Gelir" */
  title: string
  width?: number
  height?: number
  /** Çizimin başlama gecikmesi (sn) — kademeli KPI'lar için */
  delay?: number
  className?: string
}) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pad = 4
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (width - pad * 2),
    pad + (1 - (v - min) / span) * (height - pad * 2),
  ])
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  const [lx, ly] = pts[pts.length - 1]
  const style = { '--d': `${delay}s` } as React.CSSProperties

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={title}
      className={cn('block overflow-visible', className)}
      style={style}
    >
      <path d={`${d} L ${lx.toFixed(1)} ${height} L ${pts[0][0].toFixed(1)} ${height} Z`} fill="currentColor" opacity={0.1} className="ink-fill" />
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ink-draw"
      />
      <g className="ink-fill">
        <circle cx={lx} cy={ly} r={4.5} fill="rgb(var(--paper))" />
        <circle cx={lx} cy={ly} r={2.6} fill="currentColor" />
      </g>
    </svg>
  )
}
