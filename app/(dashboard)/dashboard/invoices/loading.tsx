import { HeaderSkeleton, TileStripSkeleton, ToolbarSkeleton, ListSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-5">
        <PanelSkeleton height={168} />
      </div>
      <div className="mb-4">
        <TileStripSkeleton />
      </div>
      <ToolbarSkeleton />
      <ListSkeleton rows={6} />
    </>
  )
}
