import Link from 'next/link'
import { Users, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NewClientDialog } from '@/components/forms/NewClientDialog'
import { listClients } from '@/lib/queries'
import { CLIENT_STATUS_LABEL, STATUS_TONE } from '@/lib/constants'
import { durationSince, formatTRY } from '@/lib/format'

export default async function ClientsPage() {
  const clients = await listClients()

  return (
    <>
      <PageHeader
        title="Danışanlar"
        subtitle={`${clients.length} kayıtlı danışan`}
        action={<NewClientDialog />}
      />

      {clients.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="glass group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <Avatar name={c.name} color={c.colorTag} size="lg" />
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-3 truncate font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{c.name}</h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.email || c.phone || '—'}</p>

              <div className="mt-4 flex items-center justify-between">
                <StatusBadge label={CLIENT_STATUS_LABEL[c.status]} tone={STATUS_TONE[c.status]} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{durationSince(c.startDate)}</span>
              </div>

              <div className="mt-3 border-t border-slate-500/10 pt-3 text-xs text-slate-500 dark:text-slate-400">
                Seans ücreti: <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">{formatTRY(c.sessionFee)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Henüz danışan yok"
          description="İlk danışanını ekleyerek başla."
        />
      )}
    </>
  )
}
