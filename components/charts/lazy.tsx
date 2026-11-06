'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

/**
 * Grafiklerin tembel (lazy) girişi — Recharts ana JS paketine girmesin diye
 * TÜM grafikler sayfalara buradan import edilir. `ssr: false` + `loading`
 * iskeleti her grafiğin kendi mount-iskeletiyle aynı boyuttadır; böylece
 * chunk yüklenirken hiçbir yerleşim kayması olmaz.
 *
 * Yeni grafik eklerken: bileşeni normal yaz (components/charts/*.tsx),
 * sonra buraya aynı desenle bir dynamic export ekle — `whenVisible` ile sar.
 *
 * GÖRÜNÜNCE YÜKLE (Kasım 2026): `dynamic` tek başına chunk'ı render anında
 * indirir; panelde grafikler ekranın altında olduğu hâlde Recharts (~98 KB
 * gzip) ve çizimi ilk yüklemenin içindeydi (telefonda TBT ~1,4 sn). Artık
 * iskelet yerinde durur, kap ekrana 400 px yaklaşınca grafik bağlanır.
 */

/** İskelet görünüme yaklaşana dek yerinde kalır; sonra asıl grafik bağlanır. */
function whenVisible<P extends object>(Comp: ComponentType<P>, skeleton: () => ReactNode) {
  function Visible(props: P) {
    const box = useRef<HTMLDivElement>(null)
    const [near, setNear] = useState(false)
    useEffect(() => {
      const el = box.current
      if (!el || near) return
      if (typeof IntersectionObserver === 'undefined') return setNear(true)
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setNear(true)
            io.disconnect()
          }
        },
        { rootMargin: '400px 0px' },
      )
      io.observe(el)
      return () => io.disconnect()
    }, [near])
    return near ? <Comp {...props} /> : <div ref={box}>{skeleton()}</div>
  }
  return Visible
}

function BlockSkeleton({ height }: { height: number }) {
  return <div className="skeleton rounded-xl" style={{ height }} aria-hidden />
}

const AreaTrendChartLazy = dynamic(
  () => import('./AreaTrendChart').then((m) => m.AreaTrendChart),
  { ssr: false, loading: () => <BlockSkeleton height={300} /> },
)

const MonthlyBarLazy = dynamic(
  () => import('./MonthlyBar').then((m) => m.MonthlyBar),
  { ssr: false, loading: () => <BlockSkeleton height={280} /> },
)

const CumulativeAreaLazy = dynamic(
  () => import('./CumulativeArea').then((m) => m.CumulativeArea),
  { ssr: false, loading: () => <BlockSkeleton height={260} /> },
)

const TaxBarsLazy = dynamic(
  () => import('./TaxBars').then((m) => m.TaxBars),
  { ssr: false, loading: () => <BlockSkeleton height={240} /> },
)

const CategoryDonutLazy = dynamic(
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

const TaxRadialLazy = dynamic(
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

const ScoreTrendLazy = dynamic(
  () => import('@/components/clients/ScoreTrend').then((m) => m.ScoreTrend),
  { ssr: false, loading: () => <BlockSkeleton height={200} /> },
)

export const AreaTrendChart = whenVisible(AreaTrendChartLazy, () => <BlockSkeleton height={300} />)
export const MonthlyBar = whenVisible(MonthlyBarLazy, () => <BlockSkeleton height={280} />)
export const CumulativeArea = whenVisible(CumulativeAreaLazy, () => <BlockSkeleton height={260} />)
export const TaxBars = whenVisible(TaxBarsLazy, () => <BlockSkeleton height={240} />)
export const CategoryDonut = whenVisible(CategoryDonutLazy, () => (
  <div className="flex flex-col items-center gap-5">
    <div className="relative h-[168px] w-[168px] shrink-0">
      <div className="skeleton h-full w-full rounded-full" aria-hidden />
    </div>
  </div>
))
export const TaxRadial = whenVisible(TaxRadialLazy, () => (
  <div className="relative h-[210px] w-full">
    <div className="skeleton h-full w-full rounded-2xl" aria-hidden />
  </div>
))
export const ScoreTrend = whenVisible(ScoreTrendLazy, () => <BlockSkeleton height={200} />)
