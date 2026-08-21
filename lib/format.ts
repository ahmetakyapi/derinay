import { LOCALE, CURRENCY } from './constants'

/** Para birimi: 1234.5 → "₺1.234,50" */
export function formatTRY(value: number | string, opts?: { compact?: boolean }): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (opts?.compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: CURRENCY,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(n)
}

/** "15 Mart 2026" */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date))
}

/** "15 Mar" — kısa */
export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(new Date(date))
}

/** "15 Mar 14:00" */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

/** "Mart 2026" */
export function formatMonth(date: Date | string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(new Date(date))
}

/** YYYY-MM ay anahtarı */
export function monthKey(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Ay anahtarından kısa etiket: "2026-03" → "Mar" */
export function monthKeyToLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(new Date(y, m - 1, 1))
}

/**
 * İsimden baş harfler: "Ayşe Yılmaz" → "AY".
 * Türkçe locale ŞART — aksi halde "İrem" → "I" olur ("İ" değil).
 */
export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toLocaleUpperCase(LOCALE) ?? '')
      .join('') || '—'
  )
}

/** Başlangıç tarihinden bugüne süre: "4 ay", "1 yıl 2 ay" */
export function durationSince(start: Date | string): string {
  const s = new Date(start)
  const now = new Date()
  let months = (now.getFullYear() - s.getFullYear()) * 12 + (now.getMonth() - s.getMonth())
  if (months < 1) return 'Yeni'
  const years = Math.floor(months / 12)
  months = months % 12
  const parts: string[] = []
  if (years) parts.push(`${years} yıl`)
  if (months) parts.push(`${months} ay`)
  return parts.join(' ')
}

/** Yüzde değişimi: önceki→şimdiki. null = önceki 0 */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}
