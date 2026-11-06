/**
 * Suluboya kenarı geometrisi — `InkEdge` (landing, yatay, kaydırmalı) ile
 * `InkSeam` (giriş, dikey, durağan) aynı dalgayı kullanır. Saf fonksiyon:
 * sabit tohumdan türer, sunucu ve istemci aynı yolu üretir.
 */

export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** `w`×`h` kutuda yatay dalga; tabanı (y = h) kapalı dolgu yolu. */
export function inkWave(seed: number, base: number, amp: number, w = 1440, h = 120) {
  const rnd = seeded(seed)
  const phase = rnd() * Math.PI * 2
  const steps = 36
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * w
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
    d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  d += ` L ${w + 20} ${pts[pts.length - 1][1].toFixed(1)} L ${w + 20} ${h + 10} L -20 ${h + 10} Z`
  return d
}
