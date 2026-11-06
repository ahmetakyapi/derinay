'use client'

import { useId, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Suluboya kenarı — iki bölüm arasındaki düz çizgiyi kâğıda sızan boya
 * kenarına çevirir. Landing'de renk değişen her sınırda (kâğıt → kum,
 * kum → gece adası, kapanış → altlık) bir tane; aynı bölümde ikinci kez yok.
 *
 * NASIL:
 *  - Sıfır yükseklikli kardeş öğe; SVG ondan yukarı (`edge="top"`: sonraki
 *    bölümün rengi öncekinin içine sızar) ya da aşağı (`edge="bottom"`:
 *    biten bölümün rengi sonrakine taşar) uzanır. Bölümlerin kendisine
 *    konmaz: gece adaları `overflow-hidden` taşıdığı için kırpılırdı.
 *  - Dalga sabit tohumdan türer (sunucu = istemci, hidrasyon farkı yok).
 *  - `feTurbulence` + `feDisplacementMap` kenarı lifli kâğıt gibi yırtar;
 *    filtre DURAĞAN, yalnız sarmalayıcıların `transform`u oynar (her karede
 *    yeniden filtre hesaplanmaz).
 *  - Üç katman: arkada soluk "sızıntı" (kaydırdıkça boya yayılır gibi
 *    yükselir), önde tam renk gövde, gövdenin kenarında pigment birikintisi
 *    (suluboyada boya kurudukça kenarda koyulaşır).
 *  - Renk `currentColor`: çağıran `text-[rgb(var(--sand))]` ya da
 *    `text-indigo-950` verir; iki temada da token'dan gelir.
 *
 * Hareket azaltma: stil her zaman verilir, durağanlık CSS'ten
 * (`motion-reduce:transform-none!`, bkz. Showcase.tsx notu).
 */

const W = 1440
const H = 120

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Yumuşak dalga + küçük titreşim; tabanı kapalı dolgu yolu. */
function wave(seed: number, base: number, amp: number) {
  const rnd = seeded(seed)
  const phase = rnd() * Math.PI * 2
  const steps = 36
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W
    const y =
      base +
      Math.sin((i / steps) * Math.PI * 2.2 + phase) * amp +
      Math.sin((i / steps) * Math.PI * 5.3 + phase * 1.7) * amp * 0.35 +
      (rnd() - 0.5) * amp * 0.5
    pts.push([x, y])
  }
  let d = `M -20 ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const mx = (x0 + x1) / 2
    d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  d += ` L ${W + 20} ${pts[pts.length - 1][1].toFixed(1)} L ${W + 20} ${H + 10} L -20 ${H + 10} Z`
  return d
}

export function InkEdge({
  edge = 'top',
  seed = 7,
  className,
}: {
  /** `top`: sonraki bölümün rengi yukarı sızar. `bottom`: biten bölümün rengi aşağı taşar. */
  edge?: 'top' | 'bottom'
  /** Her sınır kendi dalgasını alsın diye farklı tohum */
  seed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const fid = `ink-${useId().replace(/:/g, '')}`
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 35%'] })
  // Sızıntı katmanı: sınır ekrana girerken aşağıdan yükselip yerine oturur
  const bleedY = useTransform(scrollYProgress, [0, 1], ['55%', '0%'])
  const bleedX = useTransform(scrollYProgress, [0, 1], ['-2%', '0%'])
  const bodyY = useTransform(scrollYProgress, [0, 1], ['28%', '0%'])

  return (
    <div ref={ref} aria-hidden className={cn('pointer-events-none relative z-20 h-0', className)}>
      <div
        className={cn(
          'absolute inset-x-0 h-[clamp(44px,7vw,110px)] overflow-hidden',
          // Alt kenarda yol ters çevrilir: dolgu yukarıda, dalga aşağıda
          edge === 'top' ? 'bottom-[-1px]' : 'top-[-1px] -scale-y-100',
        )}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <filter id={fid} x="-5%" y="-30%" width="110%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="3" seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <motion.div style={{ y: bleedY, x: bleedX }} className="absolute inset-[-2%_-3%_0] motion-reduce:transform-none!">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
            <path d={wave(seed * 31 + 3, 38, 16)} fill="currentColor" opacity={0.28} filter={`url(#${fid})`} />
          </svg>
        </motion.div>
        <motion.div style={{ y: bodyY }} className="absolute inset-0 motion-reduce:transform-none!">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
            <g filter={`url(#${fid})`}>
              <path d={wave(seed, 66, 14)} fill="currentColor" />
              {/* Pigment birikintisi: boya kururken kenarda koyulaşır */}
              <path d={wave(seed, 66, 14)} fill="none" stroke="black" strokeWidth={3} strokeOpacity={0.07} />
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  )
}
