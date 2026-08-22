import Link from 'next/link'
import { FileText, Printer, CircleCheck, Send, Clock3, AlertTriangle, Receipt, Search, X } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { BloomArt } from '@/components/art/BloomArt'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { InvoiceStatusSelect } from '@/components/forms/InvoiceStatusSelect'
import { listInvoices, clientOptions, getTaxSettings } from '@/lib/queries'
import { deleteInvoice } from '@/app/actions/invoices'
import { formatTRY, formatDate } from '@/lib/format'
import { INVOICE_STATUSES, type InvoiceStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Makbuzlar' }

// Statü → galeri etiketi tonu (sol aksan + yumuşak tint)
const STATUS_META: Record<InvoiceStatus, { label: string; icon: typeof CircleCheck; tone: string; bg: string; bar: string; rowTint: string }> = {
  paid:    { label: 'Ödendi',     icon: CircleCheck,   tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/12', bar: 'bg-emerald-500/70', rowTint: 'bg-emerald-500/[0.035]' },
  sent:    { label: 'Gönderildi', icon: Send,          tone: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-500/12',     bar: 'bg-sky-500/70',     rowTint: '' },
  draft:   { label: 'Taslak',     icon: Clock3,        tone: 'text-slate-500 dark:text-slate-400',     bg: 'bg-slate-500/12',   bar: 'bg-slate-400/50',   rowTint: '' },
  overdue: { label: 'Gecikmiş',   icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/12',    bar: 'bg-rose-500/80',    rowTint: 'bg-rose-500/[0.05]' },
}

const STATUS_ORDER: InvoiceStatus[] = ['paid', 'sent', 'draft', 'overdue']

const trLower = (v: string) => v.toLocaleLowerCase('tr')

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string }
}) {
  const [invoices, clients, taxRates] = await Promise.all([listInvoices(), clientOptions(), getTaxSettings()])

  // Filtreler yalnızca LİSTEYİ daraltır — üstteki özet her zaman tüm makbuzları anlatır
  const status = (INVOICE_STATUSES as readonly string[]).includes(searchParams.status ?? '')
    ? (searchParams.status as InvoiceStatus)
    : undefined
  const q = searchParams.q?.trim() || undefined
  const needle = q ? trLower(q) : null
  const visible = invoices.filter(
    (i) =>
      (!status || i.status === status) &&
      (!needle || trLower(`${i.clientName ?? 'Genel'} ${i.number}`).includes(needle)),
  )
  const filtered = Boolean(status || q)

  const filterHref = (over: { status?: InvoiceStatus | 'all'; q?: string }) => {
    const p = new URLSearchParams()
    const st = over.status ?? status ?? 'all'
    const qq = over.q ?? q ?? ''
    if (st !== 'all') p.set('status', st)
    if (qq) p.set('q', qq)
    const qs = p.toString()
    return `/dashboard/invoices${qs ? `?${qs}` : ''}`
  }

  const totalKdv = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.kdvAmount, 0)
  const totalStopaj = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.stopajAmount, 0)
  /** Kesilen tüm makbuzların toplamı — taslaklar dahil */
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)
  const sumByStatus = (st: InvoiceStatus) =>
    invoices.filter((i) => i.status === st).reduce((s, i) => s + i.total, 0)
  const countByStatus = (st: InvoiceStatus) => invoices.filter((i) => i.status === st).length

  const paidTotal = sumByStatus('paid')
  /** Tahsilat oranının paydası: taslak HARİÇ — taslak henüz kesilmemiş sayılır
   *  (KDV/stopaj toplamları da aynı tabanı kullanıyor, tutarlılık için şart). */
  const billable = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.total, 0)
  const collectionRate = billable > 0 ? Math.round((paidTotal / billable) * 100) : 0

  return (
    <>
      <PageHeader
        title="Makbuzlar"
        subtitle={
          <>
            {invoices.length} makbuz · <span className="sensitive font-mono tabular-nums">{formatTRY(totalBilled, { compact: true })}</span> kesildi ·{' '}
            <span className="sensitive font-mono tabular-nums">{formatTRY(totalKdv, { compact: true })}</span> KDV
            {totalStopaj > 0 && <> · <span className="sensitive font-mono tabular-nums">{formatTRY(totalStopaj, { compact: true })}</span> stopaj</>}
          </>
        }
        action={<NewInvoiceDialog clients={clients} defaultKdvRate={taxRates.kdvRate} defaultStopajRate={taxRates.stopajRate} />}
      />

      {/* Tahsilat durumu — galeri yazıtı şeridi */}
      <div className="glass relative mb-5 overflow-hidden rounded-2xl p-5 sm:p-6">
        <BloomArt className="pointer-events-none absolute -right-4 -top-6 hidden h-44 w-32 opacity-40 sm:block" delay={0.4} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <Receipt className="h-3.5 w-3.5 text-amber-500" /> Toplam Tahsil Edilen
            </p>
            <p className="sensitive mt-1.5 font-mono text-[1.75rem] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-4xl">
              {formatTRY(paidTotal)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="sensitive font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">{formatTRY(totalBilled, { compact: true })}</span> kesildi
            </p>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="font-display text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">%{collectionRate}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">tahsilat oranı</p>
          </div>
        </div>
        {/* Tahsilat ilerleme çubuğu */}
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-slate-500/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {/* Statü özeti — aynı zamanda filtre rafı (tıkla → o statüyü listele) */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_ORDER.map((st) => {
          const m = STATUS_META[st]
          const active = status === st
          return (
            <Link
              key={st}
              href={filterHref({ status: active ? 'all' : st })}
              aria-current={active ? 'true' : undefined}
              title={active ? 'Filtreyi kaldır' : `${m.label} makbuzları göster`}
              className={cn(
                'glass group rounded-2xl p-4 transition-all hover:-translate-y-0.5',
                active && 'ring-2 ring-indigo-500/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110', m.bg, m.tone)}>
                  <m.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {countByStatus(st)}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                {m.label}
              </p>
              <p className={cn('sensitive mt-0.5 font-display text-lg font-semibold tracking-tight', m.tone)}>
                {formatTRY(sumByStatus(st), { compact: true })}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Arama + aktif filtre göstergesi */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {filtered && (
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.07] px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-500/60 dark:text-indigo-300"
          >
            <X className="h-3.5 w-3.5" />
            {status ? STATUS_META[status].label : 'Arama'} filtresini kaldır
          </Link>
        )}
        <form action="/dashboard/invoices" className="relative ml-auto w-full sm:w-64">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Danışan veya makbuz no ara…"
            className="field !py-2 !pl-9 text-sm"
          />
        </form>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {visible.length ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-500/10 px-5 py-3.5 sm:px-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
                {status ? `${STATUS_META[status].label} Makbuzlar` : 'Tüm Makbuzlar'}
              </h2>
              <span className="text-xs text-slate-400">
                {filtered ? `${visible.length} / ${invoices.length} kayıt` : `${invoices.length} kayıt`}
              </span>
            </header>
            <div className="divide-y divide-slate-500/10">
              {visible.map((i) => {
                const m = STATUS_META[i.status]
                return (
                  // Mobil: iki satır (kimlik+tutar / kontroller) · sm+: tek satır
                  <div
                    key={i.id}
                    className={cn(
                      'relative flex flex-col gap-2.5 py-3.5 pl-5 pr-4 transition-colors hover:bg-slate-500/[0.025] sm:flex-row sm:items-center sm:gap-4 sm:pl-6 sm:pr-5',
                      m.rowTint,
                    )}
                  >
                    {/* Statü aksan çubuğu */}
                    <span className={cn('absolute inset-y-3 left-0 w-1 rounded-r-full', m.bar)} />

                    <div className="flex items-center justify-between gap-3 sm:min-w-0 sm:flex-1">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={i.clientName ?? 'Genel'} color={i.clientColor ?? 'indigo'} src={i.clientAvatar} size="sm" />
                        <div className="min-w-0">
                          <p className="sensitive truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {i.clientName ?? 'Genel'}
                          </p>
                          <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {i.number} · {formatDate(i.issueDate)}
                            {i.dueDate ? ` · vade ${formatDate(i.dueDate)}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        'sensitive shrink-0 font-mono text-[13px] font-bold tabular-nums sm:hidden',
                        i.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400'
                          : i.status === 'overdue' ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-white',
                      )}>
                        {formatTRY(i.total)}
                      </span>
                    </div>

                    <div className="sensitive hidden shrink-0 text-right text-[11px] leading-snug text-slate-500 dark:text-slate-400 md:block">
                      <span className="block">Brüt <span className="font-mono tabular-nums">{formatTRY(i.subtotal, { compact: true })}</span></span>
                      <span className="block">
                        KDV %{i.kdvRate}
                        {i.stopajAmount > 0 ? ` · stopaj −${formatTRY(i.stopajAmount, { compact: true })}` : ''}
                      </span>
                    </div>

                    <span className={cn(
                      'sensitive hidden w-28 shrink-0 text-right font-mono text-sm font-bold tabular-nums sm:block',
                      i.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400'
                        : i.status === 'overdue' ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white',
                    )}>
                      {formatTRY(i.total)}
                    </span>

                    <div className="flex items-center justify-between gap-2 sm:justify-start">
                      <InvoiceStatusSelect id={i.id} value={i.status} />
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/invoices/${i.id}/print`}
                          target="_blank"
                          aria-label="PDF / Yazdır"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300"
                        >
                          <Printer className="h-4 w-4" />
                        </Link>
                        <DeleteButton action={deleteInvoice.bind(null, i.id)} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <EmptyState
            icon={FileText}
            title={filtered ? 'Eşleşen makbuz yok' : 'Henüz makbuz yok'}
            description={filtered ? 'Filtreyi kaldırıp tekrar dene.' : 'İlk makbuzunu kes.'}
            action={
              filtered ? (
                <Link
                  href="/dashboard/invoices"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
                >
                  Filtreyi temizle
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </>
  )
}
