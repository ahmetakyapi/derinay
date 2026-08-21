import { HeaderSkeleton, ToolbarSkeleton, TileStripSkeleton, ListSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <ToolbarSkeleton />
      <div className="mb-6">
        <TileStripSkeleton count={3} />
      </div>
      <ListSkeleton rows={6} />
    </>
  )
}
