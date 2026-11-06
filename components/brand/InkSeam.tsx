import { inkWave } from '@/lib/ink'
import { cn } from '@/lib/utils'

/**
 * Dikey suluboya dikişi — iki yan yana yüzeyin (giriş: gece paneli | kâğıt)
 * düz sınırını boya kenarına çevirir. `InkEdge`in durağan, dikey kardeşi:
 * kaydırma yok, JS yok; sunucuda çizilir.
 *
 * Yatay dalga 90° döndürülür: kutu yüksekliği SVG'nin genişliği olur.
 * Renk `currentColor` (çağıran `text-indigo-950`). Giriş animasyonu
 * çağırandan (`.ink-fill` ile gecikmeli belirir; panel perdesi açıldıktan sonra).
 */
export function InkSeam({ seed = 23, className }: { seed?: number; className?: string }) {
  const id = `seam-${seed}`
  return (
    <svg aria-hidden viewBox="0 0 120 1440" preserveAspectRatio="none" className={cn('overflow-visible', className)}>
      <defs>
        <filter id={id} x="-40%" y="-2%" width="180%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.012" numOctaves="3" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {/* Yatay yol, dolgu altta (y→120). 90° dönünce y → 120−x: dolgu SOLDA
          (paneli sürdürür), dalga sağda kâğıda sızar. */}
      <g transform="translate(120 0) rotate(90)" filter={`url(#${id})`}>
        <path d={inkWave(seed * 31 + 3, 30, 14, 1440, 120)} fill="currentColor" opacity={0.18} />
        <path d={inkWave(seed, 62, 12, 1440, 120)} fill="currentColor" />
        <path d={inkWave(seed, 62, 12, 1440, 120)} fill="none" stroke="black" strokeWidth={3} strokeOpacity={0.07} />
      </g>
    </svg>
  )
}
