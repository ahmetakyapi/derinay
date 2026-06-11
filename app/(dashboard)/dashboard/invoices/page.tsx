import Link from 'next/link'
import { FileText, Printer, CircleCheck, Send, Clock3, AlertTriangle, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { Avatar } from '@/components/ui/Avatar'
import { BloomArt } from '@/components/art/BloomArt'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { InvoiceStatusSelect } from '@/components/forms/InvoiceStatusSelect'
import { listInvoices, clientOptions } from '@/lib/queries'
import { deleteInvoice } from '@/app/actions/invoices'
import { formatTRY, formatDate } from '@/lib/format'
import type { InvoiceStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

// Statü → galeri etiketi tonu (sol aksan + yumuşak tint)
const STATUS_META: Record<InvoiceStatus, { label: string; icon: typeof CircleCheck; tone: string; bg: string; bar: string; rowTint: string }> = {
  paid:    { label: 'Ödendi',     icon: CircleCheck,   tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/12', bar: 'bg-emerald-500/70', rowTint: 'bg-emerald-500/[0.035]' },
  sent:    { label: 'Gönderildi', icon: Send,          tone: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-500/12',     bar: 'bg-sky-500/70',     rowTint: '' },
  draft:   { label: 'Taslak',     icon: Clock3,        tone: 'text-slate-500 dark:text-slate-400',     bg: 'bg-slate-500/12',   bar: 'bg-slate-400/50',   rowTint: '' },
  overdue: { label: 'Gecikmiş',   icon: AlertTriangle, tone: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/12',    bar: 'bg-rose-500/80',    rowTint: 'bg-rose-500/[0.05]' },
}

const STATUS_ORDER: InvoiceStatus[] = ['paid', 'sent', 'draft', 'overdue']

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([listInvoices(), clientOptions()])

  const totalKdv = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.kdvAmount, 0)
  const totalStopaj = invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.stopajAmount, 0)
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0)
  const sumByStatus = (st: InvoiceStatus) =>
    invoices.filter((i) => i.status === st).reduce((s, i) => s + i.total, 0)
  const countByStatus = (st: InvoiceStatus) => invoices.filter((i) => i.status === st).length

  const paidTotal = sumByStatus('paid')
  const collectionRate = totalBilled > 0 ? Math.round((paidTotal / totalBilled) * 100) : 0

  return (
    <>
      <PageHeader
        title="Makbuzlar"
        subtitle={`${invoices.length} makbuz · ${formatTRY(totalBilled, { compact: true })} tahsil · ${formatTRY(totalKdv, { compact: true })} KDV${totalStopaj > 0 ? ` · ${formatTRY(totalStopaj, { compact: true })} stopaj` : ''}`}
        action={<NewInvoiceDialog clients={clients} />}
      />

      {/* Tahsilat durumu — galeri yazıtı şeridi */}
      <div className="glass relative mb-5 overflow-hidden rounded-2xl p-5 sm:p-6">
        <BloomArt className="pointer-events-none absolute -right-4 -top-6 hidden h-44 w-32 opacity-40 sm:block" delay={0.4} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              <Receipt className="h-3.5 w-3.5 text-amber-500" /> Toplam Tahsil Edilen
            </p>
            <p className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {formatTRY(totalBilled)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{formatTRY(paidTotal, { compact: true })}</span> tahsil edildi
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

      {/* Statü özeti — galeri rafı */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_ORDER.map((st) => {
          const m = STATUS_META[st]
          return (
            <div key={st} className="glass group rounded-2xl p-4 transition-all hover:-translate-y-0.5">
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
              <p className={cn('mt-0.5 font-display text-lg font-semibold tracking-tight', m.tone)}>
                {formatTRY(sumByStatus(st), { compact: true })}
              </p>
            </div>
          )
        })}
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {invoices.length ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-500/10 px-5 py-3.5 sm:px-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">Tüm Makbuzlar</h2>
              <span className="text-xs text-slate-400">{invoices.length} kayıt</span>
            </header>
            <div className="divide-y divide-slate-500/10">
              {invoices.map((i) => {
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
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {i.clientName ?? 'Genel'}
                          </p>
                          <p className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {i.number} · {formatDate(i.issueDate)}
                            {i.dueDate ? ` · vade ${formatDate(i.dueDate)}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        'shrink-0 font-mono text-[13px] font-bold tabular-nums sm:hidden',
                        i.status === 'paid' ? 'text-emerald-600 dark:text-emerald-400'
                          : i.status === 'overdue' ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-white',
                      )}>
                        {formatTRY(i.total)}
                      </span>
                    </div>

                    <div className="hidden shrink-0 text-right text-[11px] leading-snug text-slate-500 dark:text-slate-400 md:block">
                      <span className="block">Brüt {formatTRY(i.subtotal, { compact: true })}</span>
                      <span className="block">
                        KDV %{i.kdvRate}
                        {i.stopajAmount > 0 ? ` · stopaj −${formatTRY(i.stopajAmount, { compact: true })}` : ''}
                      </span>
                    </div>

                    <span className={cn(
                      'hidden w-28 shrink-0 text-right font-mono text-sm font-bold tabular-nums sm:block',
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
          <EmptyState icon={FileText} title="Henüz makbuz yok" description="İlk makbuzunu kes." />
        )}
      </div>
    </>
  )
}
