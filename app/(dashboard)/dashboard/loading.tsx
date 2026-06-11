/**
 * Sayfa geçişlerinde gösterilen iskelet — server component'ler veriyi beklerken.
 * Atölye paletinde shimmer'lı kâğıt blokları (premium algılanan hız).
 */
export default function DashboardLoading() {
  return (
    <div>
      {/* Başlık */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2.5">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="skeleton h-10 w-28 rounded-xl" />
      </div>

      {/* KPI şeridi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="skeleton mb-4 h-9 w-9 rounded-xl" />
            <div className="skeleton mb-2 h-3 w-20" />
            <div className="skeleton h-7 w-28" />
          </div>
        ))}
      </div>

      {/* İçerik blokları */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="skeleton mb-5 h-3 w-32" />
          <div className="skeleton h-56 w-full rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="skeleton mb-5 h-3 w-28" />
          <div className="mx-auto skeleton h-40 w-40 rounded-full" />
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-5">
        <div className="skeleton mb-4 h-3 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-1/3" />
                <div className="skeleton h-3 w-1/5" />
              </div>
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
