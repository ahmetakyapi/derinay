/**
 * Günün sözü — şifa, sükûnet ve terapi temalı kısa alıntılar.
 * Gün-deterministik seçilir: aynı gün hep aynı söz (sayfa her yenilendiğinde değişmez).
 */

export type Quote = { text: string; author: string }

export const QUOTES: Quote[] = [
  { text: 'Yara, ışığın içine girdiği yerdir.', author: 'Rumi' },
  { text: 'İnsanın kendine yolculuğu, yolculukların en uzunudur.', author: 'Søren Kierkegaard' },
  { text: 'Karanlığı bilmeyen, ışığı göremez.', author: 'Carl G. Jung' },
  { text: 'Olduğum gibi kabul edildiğimde, değişebilirim.', author: 'Carl Rogers' },
  { text: 'İnsan, anlam arayan bir varlıktır.', author: 'Viktor E. Frankl' },
  { text: 'Duygularını adlandırmak, onları evcilleştirmenin ilk adımıdır.', author: 'Dan Siegel' },
  { text: 'Fırtınayı geçmek için bazen tek gereken, birinin yanında oturmasıdır.', author: 'Anonim' },
  { text: 'Kendine şefkat, başkalarına şefkatin başladığı yerdir.', author: 'Kristin Neff' },
  { text: 'Geçmiş bir referanstır, ikametgâh değil.', author: 'Anonim' },
  { text: 'Dinlenmek de işin bir parçasıdır.', author: 'Anonim' },
  { text: 'Bir insanı dinlemek, ona verilebilecek en sessiz hediyedir.', author: 'Anonim' },
  { text: 'Küçük adımlar da yol alır.', author: 'Anonim' },
  { text: 'Bugün tek yapman gereken, bugünü yaşamak.', author: 'Anonim' },
  { text: 'Nefes aldığın sürece, yeniden başlamak mümkündür.', author: 'Thich Nhat Hanh' },
  { text: 'En derin sular, en sakin akar.', author: 'Anonim' },
  { text: 'İyileşme düz bir çizgi değil, bir dalgadır.', author: 'Anonim' },
]

/** Yılın gününe göre deterministik söz */
export function quoteOfTheDay(date = new Date()): Quote {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
  return QUOTES[dayOfYear % QUOTES.length]
}

/** Saate göre Türkçe selamlama (Europe/Istanbul) */
export function greetingNow(date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('tr-TR', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Europe/Istanbul',
    }).format(date),
  )
  if (hour < 6) return 'İyi Geceler'
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi Günler'
  return 'İyi Akşamlar'
}
