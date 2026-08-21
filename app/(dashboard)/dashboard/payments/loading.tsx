import { HeaderSkeleton, ToolbarSkeleton, ListSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-6">
        <PanelSkeleton height={260} />
      </div>
      <ToolbarSkeleton />
      <ListSkeleton rows={6} />
    </>
  )
}
