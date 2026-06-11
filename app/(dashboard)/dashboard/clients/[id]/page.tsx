import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  CalendarClock,
  Cake,
  StickyNote,
  Receipt,
  CreditCard,
  CheckCircle2,
  Printer,
  HeartPulse,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NoteCard } from '@/components/clients/NoteCard'
import { MoodTrail } from '@/components/clients/MoodTrail'
import { NoteForm } from '@/components/forms/NoteForm'
import { SessionStatusSelect } from '@/components/forms/SessionStatusSelect'
import { ReminderButton } from '@/components/clients/ReminderButton'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { EditClientDialog } from '@/components/forms/EditClientDialog'
import { getClientDetail, getReminderTemplate } from '@/lib/queries'
import { deleteClient } from '@/app/actions/clients'
import {
  CLIENT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  STATUS_TONE,
} from '@/lib/constants'
import { formatTRY, formatDate, formatDateTime, durationSince } from '@/lib/format'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const [data, reminderTemplate] = await Promise.all([getClientDetail(params.id), getReminderTemplate()])
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
      <div className="glass mb-6 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={client.name} color={client.colorTag} src={client.avatarUrl} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{client.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <StatusBadge label={CLIENT_STATUS_LABEL[client.status]} tone={STATUS_TONE[client.status]} />
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {durationSince(client.startDate)} ({formatDate(client.startDate)})</span>
                {client.birthDate && (
                  <span className="inline-flex items-center gap-1">
                    <Cake className="h-3.5 w-3.5" />
                    {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(new Date(client.birthDate))}
                  </span>
                )}
                {client.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {client.email}</span>}
                {client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {client.phone}</span>}
              </div>
              {client.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {client.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/dashboard/clients?tag=${encodeURIComponent(t)}`}
                      className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              )}
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
                birthDate: client.birthDate ? String(client.birthDate) : null,
                colorTag: client.colorTag,
                avatarUrl: client.avatarUrl,
                tags: client.tags,
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
        <Stat label="Toplam Tahsilat" value={formatTRY(stats.totalPaid)} tone="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Faturalanan" value={formatTRY(stats.totalInvoiced)} tone="text-slate-900 dark:text-white" />
        <Stat label="Bakiye" value={formatTRY(stats.outstanding)} tone={stats.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'} />
        <Stat
          label="Tamamlanan Seans"
          value={String(stats.completedSessions)}
          tone="text-slate-900 dark:text-white"
          sub={
            stats.noShowSessions + stats.cancelledSessions > 0
              ? `${stats.noShowSessions} gelmedi · ${stats.cancelledSessions} iptal`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Duygu Takibi */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              <HeartPulse className="h-4 w-4 text-rose-500 dark:text-rose-400" /> Duygu Takibi
            </h2>
            <MoodTrail
              entries={notes
                .filter((n): n is typeof n & { mood: NonNullable<(typeof n)['mood']> } => n.mood !== null)
                .map((n) => ({ mood: n.mood, date: String(n.createdAt) }))}
            />
          </section>

          {/* Seans Defteri */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              <StickyNote className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Seans Defteri
            </h2>
            <NoteForm clientId={client.id} />
            <div className="mt-5 space-y-3">
              {notes.length ? (
                notes.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={{
                      id: n.id,
                      clientId: client.id,
                      title: n.title,
                      body: n.body,
                      kind: n.kind,
                      mood: n.mood,
                      pinned: n.pinned,
                      createdAt: String(n.createdAt),
                    }}
                  />
                ))
              ) : (
                <p className="py-6 text-center font-display text-sm italic text-slate-400">
                  Defterin ilk sayfası seni bekliyor.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Seanslar */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-sky-500 dark:text-sky-400" /> Seanslar
              </h2>
              <NewSessionDialog clientId={client.id} defaultFee={client.sessionFee} />
            </div>
            {sessions.length ? (
              <ul className="space-y-2.5">
                {sessions.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{formatDateTime(s.date)}</span>
                    <span className="flex items-center gap-2">
                      {s.status === 'scheduled' && (
                        <ReminderButton clientName={client.name} phone={client.phone} date={String(s.date)} template={reminderTemplate} />
                      )}
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {formatTRY(s.fee, { compact: true })}
                      </span>
                      <SessionStatusSelect id={s.id} clientId={client.id} value={s.status} />
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
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              <CreditCard className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> Ödemeler
            </h2>
            {payments.length ? (
              <ul className="space-y-2.5">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatDate(p.date)} · {PAYMENT_METHOD_LABEL[p.method]}
                    </span>
                    <span className="font-mono text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{formatTRY(p.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Ödeme kaydı yok.</p>
            )}
          </section>

          {/* Faturalar */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              <Receipt className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Faturalar
            </h2>
            {invoices.length ? (
              <ul className="space-y-2.5">
                {invoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{i.number}</span>
                    <span className="flex items-center gap-3">
                      <StatusBadge label={INVOICE_STATUS_LABEL[i.status]} tone={STATUS_TONE[i.status]} />
                      <span className="font-mono text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">{formatTRY(i.total)}</span>
                      <Link
                        href={`/invoices/${i.id}/print`}
                        target="_blank"
                        aria-label="PDF / Yazdır"
                        className="text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-300"
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

function Stat({ label, value, tone, sub }: { label: string; value: string; tone: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tracking-tight ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-rose-500/90 dark:text-rose-400/90">{sub}</p>}
    </div>
  )
}
