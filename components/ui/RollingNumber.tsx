import type { CSSProperties } from 'react'
import styles from './RollingNumber.module.css'

/**
 * Kilometre sayacı gibi yuvarlanarak gelen sayı (dev-starter `rolling-number`).
 *
 * JS YOK, SUNUCUDA DA ÇİZİLİR: değer biçimlenmiş hâliyle gelir ("₺24.200,00");
 * her rakam kendi penceresinde 0–9 şeridinin iki turu olarak basılır ve şerit
 * CSS ile son rakamına kayar. Eski `AnimatedNumber` 0'dan sayıyordu: SSR'da
 * "₺0,00" basıyor, JS gecikince ölçülmüş tutar sıfır görünüyordu (guides/04:
 * "ölçülmüş veri 0'dan sayılmaz").
 *
 * Genişlik sıçramaz (son rakamın akıştaki kopyası pencereyi ölçer). Ekran
 * okuyucu tam metni duyar; hareketi azaltan son kareyi görür.
 * YALNIZ İLK EKRANDA kullan — yüklemede oynar, görünüme girişte değil.
 */

// Şerit iki tur: ilk tur dönüşün yolu, ikinci turdaki rakam son konum
const DIGIT_CYCLE = Array.from({ length: 20 }, (_, i) => i % 10)
const isDigit = (c: string) => c >= '0' && c <= '9'

export function RollingNumber({ value, className, delayMs = 0 }: { value: string; className?: string; delayMs?: number }) {
  const chars = [...value]
  const digitCount = chars.filter(isDigit).length
  let seen = 0

  return (
    <span className={`${styles.figure} ${className ?? ''}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className={styles.track}>
        {chars.map((char, index) => {
          if (!isDigit(char)) {
            return (
              <span key={index} className={styles.glyph}>
                {char}
              </span>
            )
          }
          // Sağdaki rakam önce durur: sayaç en küçük basamaktan oturuyormuş gibi
          const order = digitCount - seen
          seen += 1
          return (
            <span
              key={index}
              className={styles.window}
              style={{ '--digit': Number(char), '--order': order, '--delay': `${delayMs}ms` } as CSSProperties}
            >
              <span className={styles.sizer}>{char}</span>
              <span className={styles.strip}>
                {DIGIT_CYCLE.map((d, step) => (
                  <span key={step}>{d}</span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
