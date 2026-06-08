import { DashboardShell } from '@/components/dashboard/DashboardShell'

// DB'ye bağlı; her istekte taze render (build-time prerender denenmesin)
export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
