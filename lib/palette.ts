/**
 * Derinay "Atölye" chart paleti.
 *
 * Recharts SVG'ye gerçek renk değeri ister; tüm chart renkleri BURADAN gelir,
 * bileşen içinde hex yazılmaz. Tailwind config'teki remap edilmiş paletle
 * (çam/adaçayı/okra/terracotta) birebir senkrondur.
 */

export const CHART = {
  /** Gelir — adaçayı yeşili (emerald-500) */
  income: '#4f8a63',
  /** Gider — terracotta (rose-500) */
  expense: '#bb603e',
  /** Birincil — çam/petrol (indigo-500) */
  primary: '#3f7c72',
  /** Vurgu — okra altını (amber-500) */
  gold: '#b3892e',
  /** Eksen yazıları */
  axis: 'rgba(111, 107, 93, 0.75)',
  /** Izgara çizgileri */
  grid: 'rgba(111, 107, 93, 0.16)',
  /** Tooltip cursor çizgisi */
  cursor: 'rgba(111, 107, 93, 0.35)',
  /** Radial/donut arka halka */
  track: 'rgba(111, 107, 93, 0.14)',
} as const

/** Donut & kategorik seriler — galeri duvarı gibi: yumuşak, dengeli, dolu */
export const CHART_SERIES = [
  '#3f7c72', // çam
  '#b3892e', // okra
  '#bb603e', // terracotta
  '#5e80a3', // pus mavisi
  '#8f6a97', // erik
  '#4f8a63', // adaçayı
  '#5b969d', // su yeşili
  '#cd7c58', // açık kil
  '#7f9cba', // açık pus
] as const
