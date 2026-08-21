import { HeaderSkeleton, TileStripSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-5">
        <TileStripSkeleton />
      </div>
      <PanelSkeleton height={620} />
    </>
  )
}
