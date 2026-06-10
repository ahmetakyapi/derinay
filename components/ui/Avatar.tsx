import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'
import { CLIENT_COLOR_BG } from '@/lib/constants'

/**
 * Danışan avatarı — fotoğraf varsa fotoğraf (data-URI), yoksa baş harfler.
 */
export function Avatar({
  name,
  color = 'indigo',
  size = 'md',
  src,
  className,
}: {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  src?: string | null
  className?: string
}) {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
  }

  if (src) {
    return (
      // data-URI fotoğraflar için <img> bilinçli tercih — next/image optimize edemez
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          'inline-block shrink-0 rounded-xl object-cover shadow-lg shadow-black/10 ring-1 ring-slate-900/10 dark:ring-white/10',
          sizes[size],
          className,
        )}
      />
    )
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
