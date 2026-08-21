import { TileStripSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <div className="skeleton mb-4 h-4 w-28" />
      {/* Kapak + kimlik kartı */}
      <div className="skeleton mb-6 h-44 w-full rounded-2xl" />
      <div className="mb-6">
        <TileStripSkeleton />
      </div>
      <div className="skeleton mb-6 h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PanelSkeleton height={220} />
          <PanelSkeleton height={260} />
        </div>
        <div className="space-y-6">
          <PanelSkeleton height={240} />
          <PanelSkeleton height={200} />
        </div>
      </div>
    </>
  )
}
