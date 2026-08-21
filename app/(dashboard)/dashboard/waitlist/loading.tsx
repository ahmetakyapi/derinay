import { HeaderSkeleton, ListSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <ListSkeleton rows={5} />
    </>
  )
}
