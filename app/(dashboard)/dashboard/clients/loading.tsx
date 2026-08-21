import { HeaderSkeleton, ToolbarSkeleton, CardGridSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <ToolbarSkeleton />
      <CardGridSkeleton count={6} />
    </>
  )
}
