import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'
import { CLIENT_COLOR_BG } from '@/lib/constants'

export function Avatar({
  name,
  color = 'indigo',
  size = 'md',
  className,
}: {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-lg shadow-black/10',
        CLIENT_COLOR_BG[color] ?? CLIENT_COLOR_BG.indigo,
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
