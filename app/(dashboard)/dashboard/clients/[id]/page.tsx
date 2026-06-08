import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarClock,
  StickyNote,
  Receipt,
  CreditCard,
  CheckCircle2,
  Wallet,
  Printer,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NoteForm } from '@/components/forms/NoteForm'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { EditClientDialog } from '@/components/forms/EditClientDialog'
import { getClientDetail } from '@/lib/queries'
import { deleteClient } from '@/app/actions/clients'
import { deleteNote } from '@/app/actions/notes'
import {
  CLIENT_STATUS_LABEL,
  SESSION_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  STATUS_TONE,
} from '@/lib/constants'
import { formatTRY, formatDate, formatDateTime, durationSince } from '@/lib/format'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const data = await getClientDetail(params.id)
  if (!data) notFound()
  const { client, notes, sessions, payments, invoices, stats } = data

  return (
    <>
      <Link
        href="/dashboard/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Danışanlar
      </Link>

      {/* Başlık */}
      <div className="glass mb-6 rounded-2xl p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={client.name} color={client.colorTag} size="lg" />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{client.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <StatusBadge label={CLIENT_STATUS_LABEL[client.status]} tone={STATUS_TONE[client.status]} />
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {durationSince(client.startDate)} ({formatDate(client.startDate)})</span>
                {client.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span>}
                {client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {client.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <NewPaymentDialog clients={[]} fixedClientId={client.id} />
            <NewInvoiceDialog clients={[]} fixedClientId={client.id} />
            <EditClientDialog
              client={{
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                status: client.status,
                sessionFee: client.sessionFee,
                startDate: String(client.startDate),
                colorTag: client.colorTag,
              }}
            />
            <DeleteButton
              action={deleteClient.bind(null, client.id)}
              redirectTo="/dashboard/clients"
              confirmText={`${client.name} ve tüm kayıtları silinecek. Emin misiniz?`}
              className="h-10 w-10 border border-slate-500/20"
            />
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Toplam tahsilat" value={formatTRY(stats.totalPaid)} tone="text-emerald-500" />
        <Stat label="Faturalanan" value={formatTRY(stats.totalInvoiced)} tone="text-slate-900 dark:text-white" />
        <Stat label="Bakiye" value={formatTRY(stats.outstanding)} tone={stats.outstanding > 0 ? 'text-amber-500' : 'text-emerald-500'} />
        <Stat label="Tamamlanan seans" value={String(stats.completedSessions)} tone="text-slate-900 dark:text-white" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notlar */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <StickyNote className="h-4 w-4 text-indigo-400" /> Notlar
          </h2>
          <NoteForm clientId={client.id} />
          <div className="mt-5 space-y-3">
            {notes.length ? (
              notes.map((n) => (
                <div key={n.id} className="group rounded-xl border border-slate-500/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {n.title && <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>}
                      <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
                    </div>
                    <DeleteButton action={deleteNote.bind(null, n.id, client.id)} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">Henüz not yok.</p>
            )}
          </div>
        </section>

        <div className="space-y-6">
          {/* Seanslar */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-4 w-4 text-sky-400" /> Seanslar
              </h2>
              <NewSessionDialog clientId={client.id} defaultFee={client.sessionFee} />
            </div>
            {sessions.length ? (
              <ul className="space-y-2.5">
                {sessions.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{formatDateTime(s.date)}</span>
                    <span className="flex items-center gap-3">
                      <StatusBadge label={SESSION_STATUS_LABEL[s.status]} tone={STATUS_TONE[s.status]} />
                      <span className="text-slate-500 dark:text-slate-400">{formatTRY(s.fee, { compact: true })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Seans kaydı yok.</p>
            )}
          </section>

          {/* Ödemeler */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <CreditCard className="h-4 w-4 text-emerald-400" /> Ödemeler
            </h2>
            {payments.length ? (
              <ul className="space-y-2.5">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(p.date)} · {PAYMENT_METHOD_LABEL[p.method]}
                    </span>
                    <span className="font-semibold text-emerald-500">+{formatTRY(p.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Ödeme kaydı yok.</p>
            )}
          </section>

          {/* Faturalar */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Receipt className="h-4 w-4 text-amber-400" /> Faturalar
            </h2>
            {invoices.length ? (
              <ul className="space-y-2.5">
                {invoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{i.number}</span>
                    <span className="flex items-center gap-3">
                      <StatusBadge label={INVOICE_STATUS_LABEL[i.status]} tone={STATUS_TONE[i.status]} />
                      <span className="font-semibold text-slate-900 dark:text-white">{formatTRY(i.total)}</span>
                      <Link
                        href={`/invoices/${i.id}/print`}
                        target="_blank"
                        aria-label="PDF / Yazdır"
                        className="text-slate-400 transition-colors hover:text-indigo-400"
                      >
                        <Printer className="h-4 w-4" />
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Fatura yok.</p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-extrabold ${tone}`}>{value}</p>
    </div>
  )
}
