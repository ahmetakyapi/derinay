import { HeaderSkeleton, PanelSkeleton } from '@/components/dashboard/Skeletons'

export default function Loading() {
  return (
    <>
      <HeaderSkeleton action={false} />
      <div className="mx-auto max-w-3xl space-y-6">
        <PanelSkeleton height={420} />
        <PanelSkeleton height={230} />
        <PanelSkeleton height={200} />
        <PanelSkeleton height={260} />
      </div>
    </>
  )
}
