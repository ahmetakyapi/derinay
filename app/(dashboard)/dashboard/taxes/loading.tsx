import { HeaderSkeleton, ChartSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartSkeleton height={200} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
          <PanelSkeleton height={170} />
          <PanelSkeleton height={170} />
          <PanelSkeleton height={170} />
        </div>
      </div>
      <div className="mt-6">
        <ChartSkeleton height={240} />
      </div>
      <div className="mt-6">
        <PanelSkeleton height={320} />
      </div>
    </>
  )
}
