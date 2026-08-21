import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { clientSearchList, getOwnerIdentity } from '@/lib/queries'

// DB'ye bağlı; her istekte taze render (build-time prerender denenmesin)
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Komut paleti (⌘K) danışan araması + sidebar kimlik kartı
  const [clients, owner] = await Promise.all([clientSearchList(), getOwnerIdentity()])
  return (
    <DashboardShell clients={clients} owner={{ name: owner.name, title: owner.title, isSet: owner.isSet }}>
      {children}
    </DashboardShell>
  )
}
