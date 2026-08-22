import { cn } from '@/lib/utils'

/**
 * Landing'deki panel kesitlerinin ortak çerçevesi — cam kâğıt + pencere şeridi.
 *
 * Tek yerde durur ki hero'daki geniş panel ile sahnelerdeki dar kesitler AYNI
 * çerçeveyi paylaşsın; ziyaretçi ikinci kez gördüğünde "aynı ürün" der.
 */
export function PreviewFrame({
  caption,
  children,
  className,
}: {
  /** Pencere şeridindeki mono künye — hangi ekranı gösterdiğini söyler */
  caption: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('glass overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50', className)}>
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {caption}
        </span>
      </div>
      <div className="overflow-hidden rounded-xl bg-[rgba(var(--paper),0.35)]">{children}</div>
    </div>
  )
}
