/**
 * Ortak iskelet parçaları — her rota kendi `loading.tsx`'inde bunları dizerek
 * KENDİ düzenine benzeyen bir bekleme ekranı kurar. (Tek bir genel iskelet,
 * Ayarlar'da KPI kartları göstermek gibi yanlış vaatler veriyordu.)
 *
 * Kural: iskelet, gerçek içerikle AYNI yükseklik/ızgarayı taklit etsin —
 * yoksa içerik gelince yerleşim zıplar.
 */

export function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div className="space-y-2.5">
        <div className="skeleton h-2.5 w-24" />
        <div className="skeleton h-7 w-52" />
        <div className="skeleton h-3.5 w-64" />
      </div>
      {action && <div className="skeleton h-10 w-28 rounded-xl" />}
    </div>
  )
}

export function TileStripSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-4 sm:p-5">
          <div className="skeleton mb-3 h-9 w-9 rounded-xl" />
          <div className="skeleton mb-2 h-3 w-20" />
          <div className="skeleton h-6 w-24" />
        </div>
      ))}
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="skeleton h-9 w-56 rounded-xl" />
      <div className="skeleton ml-auto h-9 w-full rounded-xl sm:w-56" />
    </div>
  )
}

export function ChartSkeleton({ height = 280, className }: { height?: number; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 ${className ?? ''}`}>
      <div className="skeleton mb-5 h-3 w-36" />
      <div className="skeleton w-full rounded-xl" style={{ height }} />
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5">
          <div className="skeleton h-14 w-14 rounded-xl" />
          <div className="skeleton mt-3 h-5 w-2/3" />
          <div className="skeleton mt-2 h-3 w-1/2" />
          <div className="mt-5 flex items-center justify-between">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 6, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-500/10 px-5 py-3.5">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="divide-y divide-slate-500/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            {avatar && <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />}
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-1/3" />
              <div className="skeleton h-3 w-1/4" />
            </div>
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PanelSkeleton({ height = 420 }: { height?: number }) {
  return <div className="skeleton w-full rounded-2xl" style={{ height }} />
}
