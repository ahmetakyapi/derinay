import { TAX } from './constants'

const round2 = (n: number) => Math.round(n * 100) / 100

/** KDV hesabı — net tutar üzerinden */
export function calcKdv(subtotal: number, rate: number = TAX.KDV_RATE) {
  const kdvAmount = round2(subtotal * (rate / 100))
  return { kdvAmount, total: round2(subtotal + kdvAmount) }
}

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

/** Net kâr = gelir - gider */
export function netProfit(income: number, expense: number) {
  return income - expense
}

/**
 * Basitleştirilmiş gelir vergisi tahmini.
 * Net kâr (pozitifse) üzerinden sabit oranla — gerçek beyan değil, gösterge.
 */
export function estimateIncomeTax(income: number, expense: number) {
  const profit = netProfit(income, expense)
  if (profit <= 0) return 0
  return Math.round(profit * (TAX.INCOME_TAX_ESTIMATE_RATE / 100) * 100) / 100
}

/** Dönem vergi özeti */
export function taxSummary(args: {
  income: number
  expense: number
  kdvCollected: number
}) {
  const incomeTax = estimateIncomeTax(args.income, args.expense)
  return {
    kdvCollected: args.kdvCollected,
    incomeTax,
    totalDue: Math.round((args.kdvCollected + incomeTax) * 100) / 100,
  }
}
