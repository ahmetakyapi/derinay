/**
 * Sayfa başlığı — galeri yazıtı düzeni.
 * eyebrow: bölüm etiketi (Klinik / Finans / Yaşam) — sidebar gruplarıyla aynı dil.
 * Başlığın altında landing hero'daki el çizimi fırça vurgusunun statik hali.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/90 dark:text-amber-400/90">
            <span aria-hidden className="text-amber-500/70">✦</span>
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[1.8rem] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {/* El çizimi fırça vurgusu — landing hero ile aynı marka jesti */}
        <svg
          className="mt-1.5 h-2 w-16 text-amber-500/80"
          viewBox="0 0 64 8"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M1.5 5.8C13 2.4 38 1.6 62.5 4.6"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
        {subtitle && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
