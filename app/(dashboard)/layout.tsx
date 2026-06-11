import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { clientSearchList } from '@/lib/queries'

// DB'ye bağlı; her istekte taze render (build-time prerender denenmesin)
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Komut paleti (⌘K) danışan araması için hafif liste
  const clients = await clientSearchList()
  return <DashboardShell clients={clients}>{children}</DashboardShell>
}
