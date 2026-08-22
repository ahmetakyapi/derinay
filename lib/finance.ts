import { TAX } from './constants'

const round2 = (n: number) => Math.round(n * 100) / 100

// NOT: Ayrı bir `calcKdv` yardımcısı BİLİNÇLİ olarak yok. Makbuz toplamı
// stopajsız hesaplanamaz; sadece KDV ekleyen bir yardımcı, çağıranı tevkifatı
// unutmaya davet ediyordu (ve hiçbir yerden kullanılmıyordu). Tek giriş
// noktası `calcMakbuz`.

/**
 * Serbest Meslek Makbuzu hesabı.
 * Brüt ücret üzerinden KDV eklenir, gelir vergisi stopajı (tevkifat) düşülür.
 *   Net ücret      = brüt − stopaj
 *   Tahsil edilen  = brüt − stopaj + KDV
 */
export function calcMakbuz(brut: number, kdvRate: number = TAX.KDV_RATE, stopajRate: number = TAX.STOPAJ_RATE) {
  const kdvAmount = round2(brut * (kdvRate / 100))
  const stopajAmount = round2(brut * (stopajRate / 100))
  const netUcret = round2(brut - stopajAmount)
  const total = round2(brut - stopajAmount + kdvAmount)
  return { kdvAmount, stopajAmount, netUcret, total }
}

/**
 * Basitleştirilmiş gelir vergisi tahmini.
 * Net kâr (pozitifse) üzerinden orana göre — gerçek beyan değil, gösterge.
 * Oran Ayarlar'dan değiştirilebilir (settings 'tax' anahtarı).
 */
export function estimateIncomeTax(income: number, expense: number, rate: number = TAX.INCOME_TAX_ESTIMATE_RATE) {
  const profit = income - expense
  if (profit <= 0) return 0
  return round2(profit * (rate / 100))
}

/** Dönem vergi özeti */
export function taxSummary(args: {
  income: number
  expense: number
  kdvCollected: number
  incomeTaxRate?: number
}) {
  const incomeTax = estimateIncomeTax(args.income, args.expense, args.incomeTaxRate)
  return {
    kdvCollected: args.kdvCollected,
    incomeTax,
    totalDue: round2(args.kdvCollected + incomeTax),
  }
}
