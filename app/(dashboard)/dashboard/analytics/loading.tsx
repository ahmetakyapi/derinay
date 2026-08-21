import { HeaderSkeleton, TileStripSkeleton, ChartSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <TileStripSkeleton />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton height={300} className="lg:col-span-2" />
        <ChartSkeleton height={300} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton height={260} />
        <ChartSkeleton height={260} />
      </div>
    </>
  )
}
