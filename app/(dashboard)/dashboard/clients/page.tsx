import Link from 'next/link'
import { Users, ChevronRight, Search, CalendarClock, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NewClientDialog } from '@/components/forms/NewClientDialog'
import { listClients } from '@/lib/queries'
import { CLIENT_STATUS_LABEL, STATUS_TONE, CLIENT_STATUSES, type ClientStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { durationSince, formatTRY, formatDateTime } from '@/lib/format'

export const metadata = { title: 'Danışanlar' }
export const dynamic = 'force-dynamic'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; tag?: string }
}) {
  const q = searchParams.q?.trim() || undefined
  const tag = searchParams.tag?.trim() || undefined
  const status = (CLIENT_STATUSES as readonly string[]).includes(searchParams.status ?? '')
    ? (searchParams.status as ClientStatus)
    : undefined
  const clients = await listClients({ q, status, tag })

  // Statü sekmeleri arasında gezinirken arama VE etiket filtresi korunur
  const statusHref = (st?: string) => {
    const p = new URLSearchParams()
    if (st) p.set('status', st)
    if (q) p.set('q', q)
    if (tag) p.set('tag', tag)
    const qs = p.toString()
    return `/dashboard/clients${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <PageHeader
        eyebrow="Klinik"
        title="Danışanlar"
        subtitle={`${clients.length} kayıtlı danışan`}
        action={<NewClientDialog />}
      />

      {/* Statü filtresi + arama */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-slate-500/15 p-1">
          <Link
            href={statusHref()}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              !status ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
            )}
          >
            Tümü
          </Link>
          {CLIENT_STATUSES.map((st) => (
            <Link
              key={st}
              href={statusHref(st)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                status === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
              )}
            >
              {CLIENT_STATUS_LABEL[st]}
            </Link>
          ))}
        </div>
        <form action="/dashboard/clients" className="relative ml-auto w-full sm:w-56">
          {status && <input type="hidden" name="status" value={status} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Danışan ara…"
            className="field !py-2 !pl-9 text-sm"
          />
        </form>
      </div>

      {tag && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            #{tag}
          </span>
          etiketiyle filtreleniyor ·
          <Link
            href={statusHref(status)}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            etiketi kaldır
          </Link>
        </div>
      )}

      {clients.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="glass group rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <Avatar name={c.name} color={c.colorTag} src={c.avatarUrl} size="lg" />
                <div className="flex items-center gap-1.5">
                  {!c.consentGiven && c.status === 'active' && (
                    <span title="KVKK onamı eksik" className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/12 text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
              <h3 className="sensitive mt-3 truncate font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{c.name}</h3>
              <p className="sensitive truncate text-xs text-slate-500 dark:text-slate-400">{c.email || c.phone || '—'}</p>

              {c.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-indigo-500/8 px-2 py-0.5 text-[10px] font-semibold text-indigo-700/80 dark:bg-indigo-400/10 dark:text-indigo-300/90">
                      #{t}
                    </span>
                  ))}
                  {c.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{c.tags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <StatusBadge label={CLIENT_STATUS_LABEL[c.status]} tone={STATUS_TONE[c.status]} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{durationSince(c.startDate)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-500/10 pt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="min-w-0 truncate">
                  {c.nextSession ? (
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-300">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      {formatDateTime(c.nextSession)}
                    </span>
                  ) : (
                    <span className="text-slate-400">Planlı seans yok</span>
                  )}
                </span>
                <span className="shrink-0 font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">{formatTRY(c.sessionFee)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={q || status || tag ? 'Eşleşen danışan yok' : 'Henüz danışan yok'}
          description={q || status || tag ? 'Filtreyi temizleyip tekrar dene.' : 'İlk danışanını ekleyerek başla.'}
          action={
            q || status || tag ? (
              <Link
                href="/dashboard/clients"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                Filtreyi temizle
              </Link>
            ) : (
              <NewClientDialog />
            )
          }
        />
      )}
    </>
  )
}
