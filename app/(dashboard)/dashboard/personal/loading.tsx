import { HeaderSkeleton, TileStripSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton action={false} />
      <div className="mb-6">
        <TileStripSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelSkeleton height={480} />
        </div>
        <PanelSkeleton height={480} />
      </div>
    </>
  )
}
