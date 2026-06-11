import { ClipboardList, Phone, Mail, Sparkles, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { NewWaitlistDialog } from '@/components/forms/NewWaitlistDialog'
import { ConvertWaitlistButton } from '@/components/forms/ConvertWaitlistButton'
import { listWaitlist } from '@/lib/queries'
import { deleteWaitlist } from '@/app/actions/waitlist'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Bekleme Listesi' }

export default async function WaitlistPage() {
  const entries = await listWaitlist()
  const highCount = entries.filter((e) => e.priority === 'high').length

  return (
    <>
      <PageHeader
        title="Bekleme Listesi"
        subtitle={`${entries.length} başvuru${highCount ? ` · ${highCount} yüksek öncelik` : ''} — uygun slot açıldığında danışana çevir`}
        action={<NewWaitlistDialog />}
      />

      <div className="glass overflow-hidden rounded-2xl">
        {entries.length ? (
          <div className="divide-y divide-slate-500/10">
            {entries.map((e) => {
              const high = e.priority === 'high'
              return (
                <div
                  key={e.id}
                  className={cn(
                    'relative flex flex-col gap-3 py-4 pl-5 pr-4 transition-colors hover:bg-slate-500/[0.025] sm:flex-row sm:items-center sm:gap-4 sm:pl-6 sm:pr-5',
                    high && 'bg-amber-500/[0.05]',
                  )}
                >
                  <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', high ? 'bg-amber-500/80' : 'bg-slate-400/40')} />

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={e.name} color={high ? 'amber' : 'indigo'} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="sensitive truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{e.name}</p>
                        {high && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            <Sparkles className="h-3 w-3" /> Öncelik
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {e.phone && <span className="sensitive inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {e.phone}</span>}
                        {e.email && <span className="sensitive inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {e.email}</span>}
                        {e.source && <span className="inline-flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> {e.source}</span>}
                        <span className="text-slate-400">· {formatDate(e.createdAt)}</span>
                      </p>
                      {e.note && <p className="mt-1 line-clamp-2 max-w-md text-xs text-slate-500 dark:text-slate-400">{e.note}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <ConvertWaitlistButton id={e.id} />
                    <DeleteButton action={deleteWaitlist.bind(null, e.id)} confirmText={`${e.name} listeden silinecek.`} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Bekleme listesi boş"
            description="Yeni danışan adaylarını buraya ekle; slot açıldığında tek tıkla danışana çevir."
          />
        )}
      </div>
    </>
  )
}
