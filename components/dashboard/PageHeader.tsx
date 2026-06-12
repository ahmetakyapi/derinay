export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.8rem] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        <span className="brush-line mt-2.5 block" aria-hidden />
        {subtitle && <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
