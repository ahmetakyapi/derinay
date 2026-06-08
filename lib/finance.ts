import { TAX } from './constants'

/** KDV hesabı — net tutar üzerinden */
export function calcKdv(subtotal: number, rate: number = TAX.KDV_RATE) {
  const kdvAmount = Math.round(subtotal * (rate / 100) * 100) / 100
  return { kdvAmount, total: Math.round((subtotal + kdvAmount) * 100) / 100 }
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
