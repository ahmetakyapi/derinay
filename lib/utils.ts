import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind class birleştirici — clsx + twMerge.
 *
 * NOT: Tarih/para biçimleme burada DEĞİL, `lib/format.ts` içindedir.
 * (Burada duran ikinci bir formatDate kopyası locale sabitini baypas ediyordu.)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
