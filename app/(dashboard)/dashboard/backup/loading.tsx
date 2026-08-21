import { HeaderSkeleton, PanelSkeleton, CardGridSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-6">
        <PanelSkeleton height={112} />
      </div>
      <div className="skeleton mb-3 h-3 w-52" />
      <CardGridSkeleton count={6} />
    </>
  )
}
