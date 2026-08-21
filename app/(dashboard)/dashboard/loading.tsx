import {
  HeaderSkeleton,
  TileStripSkeleton,
  ChartSkeleton,
  PanelSkeleton,
} from '@/components/dashboard/Skeletons'

/**
 * Genel Bakış iskeleti — gerçek sayfanın sırasını birebir taklit eder
 * (söz bandı → KPI şeridi → hafta takvimi → bugün/hatırlatma → grafikler).
 * Alt rotaların kendi loading.tsx'leri var; bu dosya YALNIZCA bu sayfayı kapsar.
 */
export default function DashboardLoading() {
  return (
    <div>
      <HeaderSkeleton />

      {/* Günün sözü bandı */}
      <div className="mb-6">
        <PanelSkeleton height={104} />
      </div>

      <TileStripSkeleton />

      {/* Hafta takvimi */}
      <div className="mt-6">
        <PanelSkeleton height={230} />
      </div>

      {/* Bugün + hatırlatmalar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelSkeleton height={230} />
        <PanelSkeleton height={230} />
      </div>

      {/* Grafikler */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton height={300} className="lg:col-span-2" />
        <ChartSkeleton height={300} />
      </div>
    </div>
  )
}
