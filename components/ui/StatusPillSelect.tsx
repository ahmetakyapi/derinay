'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Satır içi durum değiştirici — durum rengiyle boyalı hap select.
 * Seans ve makbuz durum seçicilerinin ortak gövdesi.
 *
 * İki tuzağı tek yerde çözer:
 *  1) Yerel state prop'a senkronlanır — sunucu değeri değişince (başka bir
 *     sekmeden güncelleme, revalidate, action hatası) rozet eski değerde donmaz.
 *  2) `appearance-none` + kendi chevron'umuz — Field'daki Select ile aynı görsel dil
 *     (yerli ok bırakılırsa bu iki seçici uygulamanın geri kalanından ayrışıyordu).
 */
export function StatusPillSelect<T extends string>({
  value,
  options,
  labels,
  styles,
  onSelect,
  ariaLabel,
  className,
}: {
  value: T
  options: readonly T[]
  labels: Record<T, string>
  styles: Record<T, string>
  /** Server action sarmalayıcısı — seçim değişince çağrılır */
  onSelect: (next: T) => Promise<unknown>
  ariaLabel: string
  className?: string
}) {
  const [current, setCurrent] = useState<T>(value)
  const [pending, start] = useTransition()
  const router = useRouter()

  // Sunucu değeri değiştiğinde rozet onu izlesin
  useEffect(() => setCurrent(value), [value])

  return (
    <span className="relative inline-flex">
      <select
        value={current}
        disabled={pending}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = e.target.value as T
          const prev = current
          setCurrent(next)
          start(async () => {
            try {
              await onSelect(next)
            } catch {
              setCurrent(prev) // action patlarsa rozeti geri al
            }
            router.refresh()
          })
        }}
        className={cn(
          'field !w-auto cursor-pointer appearance-none !rounded-full !py-1.5 !pl-3 !pr-7 !text-xs !font-semibold transition-colors disabled:cursor-wait',
          styles[current],
          className,
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
      {/* Chevron hapın METİN rengini alır. `styles[current]` KULLANILMAZ:
          o dizi arka plan ve kenarlık da taşıyor, sarmalayıcıya uygulanınca
          hapın üstünde ikinci bir renkli kutu çiziliyordu. */}
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-current opacity-70"
      />
    </span>
  )
}
