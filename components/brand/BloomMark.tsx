import { cn } from '@/lib/utils'

/**
 * Derinay orkide damgası — beş yapraklı sade çiçek.
 * `currentColor` ile boyanır; damga zeminine göre krem/mürekkep alır.
 * Marka kimliği (Shell, Header, fatura, favicon) bu işareti paylaşır.
 */
export function BloomMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('select-none', className)}
    >
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="12"
            cy="6.3"
            rx="2.45"
            ry="5.1"
            opacity="0.92"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
      </g>
      {/* Göbek */}
      <circle cx="12" cy="12" r="2.35" fill="currentColor" />
    </svg>
  )
}
