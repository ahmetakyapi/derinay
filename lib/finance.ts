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

/**
 * Dönem vergi özeti.
 *
 * STOPAJ MAHSUBU: Serbest meslek makbuzunda kesilen gelir vergisi stopajı, o
 * gelirin vergisinden PEŞİN ödenmiş kısımdır — beyanda mahsup edilir. Panel
 * bunu "yıllık gelir vergisinden mahsup" diye zaten YAZIYORDU ama toplam yükten
 * DÜŞMÜYORDU; sonuç, ödenecek verginin olduğundan yüksek görünmesiydi.
 *
 * `incomeTaxGross` mahsup öncesi tahmin, `incomeTax` mahsup sonrası kalan
 * (negatife düşmez — fazla kesinti iade/devir konusudur, bu tahmin onu yazmaz).
 */
export function taxSummary(args: {
  income: number
  expense: number
  kdvCollected: number
  incomeTaxRate?: number
  /** Dönemde makbuzlardan kesilen stopaj toplamı */
  stopajWithheld?: number
}) {
  const incomeTaxGross = estimateIncomeTax(args.income, args.expense, args.incomeTaxRate)
  const credited = Math.min(incomeTaxGross, Math.max(args.stopajWithheld ?? 0, 0))
  const incomeTax = round2(incomeTaxGross - credited)
  return {
    kdvCollected: args.kdvCollected,
    incomeTaxGross,
    stopajCredited: round2(credited),
    incomeTax,
    totalDue: round2(args.kdvCollected + incomeTax),
  }
}

/**
 * KDV DAHİL bir gider tutarından, içindeki indirilecek KDV'yi ayırır.
 * Türkiye'de fatura tutarı KDV dahildir: 1.200 TL / %20 → 200 TL KDV.
 */
export function extractKdv(grossAmount: number, rate: number) {
  if (!rate || rate <= 0) return 0
  return round2(grossAmount - grossAmount / (1 + rate / 100))
}

/** Bir dönemin ham toplamları — vergi serisini besleyen girdi */
export type PeriodInput = {
  key: string
  label: string
  income: number
  expense: number
  /** Kesilen makbuzlardan HESAPLANAN KDV (taslak hariç) */
  kdvCollected: number
  /** Gider belgelerinden İNDİRİLECEK KDV */
  kdvDeductible: number
  /** Makbuzlardan kesilen gelir vergisi stopajı */
  stopajWithheld: number
}

export type PeriodTax = PeriodInput & {
  /** Bu dönem ödenecek KDV — devreden düşüldükten sonra */
  kdvPayable: number
  /** Sonraki döneme devreden KDV (indirilecek fazlası) */
  kdvCarry: number
  incomeTaxGross: number
  stopajCredited: number
  incomeTax: number
  totalDue: number
}

/**
 * Aylık vergi serisi — DEVREDEN KDV zinciriyle.
 *
 * KDV beyanı `hesaplanan − indirilecek`tir. İndirilecek fazlaysa fark ödenmez,
 * SONRAKİ döneme devreder. Bu yüzden aylar tek tek değil SIRAYLA hesaplanır ve
 * bu fonksiyon tek kaynak olur — dashboard ile Vergiler sayfası aynı seriyi
 * okuduğu için iki ekran asla farklı rakam gösteremez.
 *
 * `periods` ESKİDEN YENİYE sıralı verilmelidir.
 */
export function taxSeries(periods: PeriodInput[], incomeTaxRate?: number): PeriodTax[] {
  let carry = 0
  return periods.map((p) => {
    const deductible = p.kdvDeductible + carry
    const kdvPayable = round2(Math.max(0, p.kdvCollected - deductible))
    carry = round2(Math.max(0, deductible - p.kdvCollected))

    const incomeTaxGross = estimateIncomeTax(p.income, p.expense, incomeTaxRate)
    const stopajCredited = round2(Math.min(incomeTaxGross, Math.max(p.stopajWithheld, 0)))
    const incomeTax = round2(incomeTaxGross - stopajCredited)

    return {
      ...p,
      kdvPayable,
      kdvCarry: carry,
      incomeTaxGross,
      stopajCredited,
      incomeTax,
      totalDue: round2(kdvPayable + incomeTax),
    }
  })
}
