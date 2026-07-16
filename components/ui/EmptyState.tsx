import type { LucideIcon } from 'lucide-react'
import { BloomArt } from '@/components/art/BloomArt'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-500/20 px-6 py-14 text-center">
      {/* Soluk orkide dokunuşu */}
      <BloomArt className="pointer-events-none absolute -bottom-6 -right-4 h-40 w-28 opacity-30" delay={0.3} />
      {/* Paspartulu çerçeve — galeri duvarındaki boş eser hissi */}
      <span className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-500/15 bg-[rgba(var(--paper),0.85)] shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
          <Icon className="h-5 w-5" />
        </span>
      </span>
      <h3 className="relative text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="relative mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  )
}
