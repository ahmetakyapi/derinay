'use client'

import dynamic from 'next/dynamic'

/**
 * Grafiklerin tembel (lazy) girişi — Recharts ana JS paketine girmesin diye
 * TÜM grafikler sayfalara buradan import edilir. `ssr: false` + `loading`
 * iskeleti her grafiğin kendi mount-iskeletiyle aynı boyuttadır; böylece
 * chunk yüklenirken hiçbir yerleşim kayması olmaz.
 *
 * Yeni grafik eklerken: bileşeni normal yaz (components/charts/*.tsx),
 * sonra buraya aynı desenle bir dynamic export ekle.
 */

function BlockSkeleton({ height }: { height: number }) {
  return <div className="skeleton rounded-xl" style={{ height }} aria-hidden />
}

export const AreaTrendChart = dynamic(
  () => import('./AreaTrendChart').then((m) => m.AreaTrendChart),
  { ssr: false, loading: () => <BlockSkeleton height={300} /> },
)

export const MonthlyBar = dynamic(
  () => import('./MonthlyBar').then((m) => m.MonthlyBar),
  { ssr: false, loading: () => <BlockSkeleton height={280} /> },
)

export const CumulativeArea = dynamic(
  () => import('./CumulativeArea').then((m) => m.CumulativeArea),
  { ssr: false, loading: () => <BlockSkeleton height={260} /> },
)

export const TaxBars = dynamic(
  () => import('./TaxBars').then((m) => m.TaxBars),
  { ssr: false, loading: () => <BlockSkeleton height={240} /> },
)

export const CategoryDonut = dynamic(
  () => import('./CategoryDonut').then((m) => m.CategoryDonut),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-[168px] w-[168px] shrink-0">
          <div className="skeleton h-full w-full rounded-full" aria-hidden />
        </div>
      </div>
    ),
  },
)

export const TaxRadial = dynamic(
  () => import('./TaxRadial').then((m) => m.TaxRadial),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[210px] w-full">
        <div className="skeleton h-full w-full rounded-2xl" aria-hidden />
      </div>
    ),
  },
)

export const ScoreTrend = dynamic(
  () => import('@/components/clients/ScoreTrend').then((m) => m.ScoreTrend),
  { ssr: false, loading: () => <BlockSkeleton height={200} /> },
)
