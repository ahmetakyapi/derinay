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
  Package,
  Activity,
  Paperclip,
  ExternalLink,
  FileText as FileIcon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NoteCard } from '@/components/clients/NoteCard'
import { MoodTrail } from '@/components/clients/MoodTrail'
import { NoteForm } from '@/components/forms/NoteForm'
import { SessionStatusSelect } from '@/components/forms/SessionStatusSelect'
import { ReminderButton } from '@/components/clients/ReminderButton'
import { DeleteClientButton } from '@/components/clients/DeleteClientButton'
import { NewPaymentDialog } from '@/components/forms/NewPaymentDialog'
import { NewInvoiceDialog } from '@/components/forms/NewInvoiceDialog'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { NewPackageDialog } from '@/components/forms/NewPackageDialog'
import { NewScoreDialog } from '@/components/forms/NewScoreDialog'
import { ScoreTrend } from '@/components/charts/lazy'
import { GoalsCard } from '@/components/clients/GoalsCard'
import { NewDocumentDialog } from '@/components/forms/NewDocumentDialog'
import { EditClientDialog } from '@/components/forms/EditClientDialog'
import { getClientDetail, getReminderConfig, getTaxSettings } from '@/lib/queries'
import { deletePackage } from '@/app/actions/packages'
import { deleteScore } from '@/app/actions/scores'
import { deleteDocument } from '@/app/actions/documents'
import {
  CLIENT_STATUS_LABEL,
  INVOICE_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  STATUS_TONE,
  CLIENT_COLOR_BG,
} from '@/lib/constants'
import { BloomArt } from '@/components/art/BloomArt'
import { formatTRY, formatDate, formatDateShort, formatDateTime, formatDayMonth, durationSince } from '@/lib/format'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Danışan Dosyası' }

/** Danışan dosyasında satır içi gösterilen en fazla seans — üstü sayılır */
const SESSION_PREVIEW = 8
export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const [data, reminder, taxRates] = await Promise.all([getClientDetail(params.id), getReminderConfig(), getTaxSettings()])
  if (!data) notFound()
  const { client, notes, sessions, payments, invoices, stats, activePackage, scores, documents, goals } = data
  const pkgPct = activePackage ? Math.round((activePackage.used / activePackage.totalSessions) * 100) : 0
  const pkgLow = activePackage ? activePackage.remaining > 0 && activePackage.remaining <= 2 : false
  const pkgDone = activePackage ? activePackage.remaining === 0 : false

  // İlerleme ölçümü: en güncel ölçeğin zaman serisi (karışık etiketleri ayrı tut)
  const scoreLabel = scores.length ? scores[scores.length - 1].label : null
  const scoreSeries = scoreLabel
    ? scores
        .filter((s) => s.label === scoreLabel)
        .map((s) => ({
          label: formatDateShort(s.date),
          value: s.value,
        }))
    : []
  const scoreMax = scoreLabel ? scores.find((s) => s.label === scoreLabel && s.scaleMax)?.scaleMax ?? null : null
  const recentScores = [...scores].reverse().slice(0, 6)
  const pinnedNoteCount = notes.filter((n) => n.pinned).length
  const latestNoteAt = notes[0] ? formatDateTime(String(notes[0].createdAt)) : null

  return (
    <>
      <Link
        href="/dashboard/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Danışanlar
      </Link>

      {/* Başlık — galeri kapaklı premium kart */}
      <div className="glass relative mb-6 overflow-hidden rounded-2xl">
        {/* Renk yıkamalı kapak + soluk orkide — kâğıda doğru erir */}
        <div className="relative h-24 sm:h-28">
          <div className={cn('absolute inset-0 bg-gradient-to-br', CLIENT_COLOR_BG[client.colorTag] ?? CLIENT_COLOR_BG.indigo)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(var(--paper),0.97)] via-[rgba(var(--paper),0.5)] to-[rgba(var(--paper),0.12)]" />
          <BloomArt className="pointer-events-none absolute -top-3 right-4 h-32 w-24 opacity-45" delay={0.3} />
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Avatar + kimlik */}
            <div className="flex items-end gap-4">
              <div className="-mt-14 shrink-0 rounded-[1.15rem] bg-[var(--bg)] p-1 shadow-xl shadow-black/10">
                <Avatar name={client.name} color={client.colorTag} src={client.avatarUrl} size="xl" />
              </div>
              <div className="min-w-0 pb-0.5">
                <h1 className="sensitive truncate font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[1.7rem]">
                  {client.name}
                </h1>

                {/* Durum & künye pilleri */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusBadge label={CLIENT_STATUS_LABEL[client.status]} tone={STATUS_TONE[client.status]} />
                  {client.consentGiven ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" /> Onam alındı
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <ShieldAlert className="h-3 w-3" /> Onam eksik
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <CalendarClock className="h-3 w-3 text-slate-400" /> {durationSince(client.startDate)}
                  </span>
                  {client.birthDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      <Cake className="h-3 w-3 text-amber-500" />
                      {formatDayMonth(client.birthDate)}
                    </span>
                  )}
                  <span className="sensitive inline-flex items-center gap-1 rounded-full bg-slate-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <CreditCard className="h-3 w-3 text-slate-400" />
                    <span className="font-mono tabular-nums">{formatTRY(client.sessionFee)}</span> / seans
                  </span>
                </div>

                {/* İletişim */}
                {(client.email || client.phone) && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {client.email && <span className="sensitive inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}</span>}
                    {client.phone && <span className="sensitive inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {client.phone}</span>}
                  </div>
                )}

                {client.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
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

            {/* Aksiyonlar — birincil makbuz + ikincil ikon kümesi */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <NewInvoiceDialog clients={[]} fixedClientId={client.id} defaultKdvRate={taxRates.kdvRate} defaultStopajRate={taxRates.stopajRate} />
              <NewPaymentDialog clients={[]} fixedClientId={client.id} />
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-500/15 bg-slate-500/[0.03] p-1">
                <Link
                  href={`/clients/${client.id}/print`}
                  target="_blank"
                  aria-label="Danışan dosyasını yazdır"
                  title="Danışan Dosyası (PDF)"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  <Printer className="h-4 w-4" />
                </Link>
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
                    consentGiven: client.consentGiven,
                    avatarUrl: client.avatarUrl,
                    tags: client.tags,
                  }}
                />
                <DeleteClientButton clientId={client.id} clientName={client.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Toplam Tahsilat" value={formatTRY(stats.totalPaid)} tone="text-emerald-600 dark:text-emerald-400" sensitive />
        <Stat label="Faturalanan" value={formatTRY(stats.totalInvoiced)} tone="text-slate-900 dark:text-white" sensitive />
        <Stat label="Bakiye" value={formatTRY(stats.outstanding)} tone={stats.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'} sensitive />
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

      {/* Seans Paketi — ön ödemeli kullanım takibi */}
      <section className="glass mb-6 rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            <Package className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Seans Paketi
          </h2>
          <div className="flex items-center gap-2">
            <NewPackageDialog
              clientId={client.id}
              defaultPrice={client.sessionFee}
              label={activePackage ? 'Yeni Paket' : 'Paket Ekle'}
            />
            {activePackage && (
              <DeleteButton action={deletePackage.bind(null, activePackage.id, client.id)} confirmText="Paket kaydı silinecek." />
            )}
          </div>
        </div>

        {activePackage ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                <span className={cn(pkgDone ? 'text-rose-600 dark:text-rose-400' : pkgLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
                  {activePackage.remaining}
                </span>
                <span className="text-base font-medium text-slate-400"> / {activePackage.totalSessions} seans kaldı</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activePackage.used} kullanıldı
                {activePackage.pricePaid > 0 && <> · <span className="sensitive font-mono tabular-nums">{formatTRY(activePackage.pricePaid)}</span></>}
              </p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-500/10">
              <div
                className={cn('h-full rounded-full transition-[width] duration-700', pkgDone ? 'bg-rose-500' : pkgLow ? 'bg-amber-500' : 'bg-emerald-500')}
                style={{ width: `${pkgPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{formatDate(activePackage.purchaseDate)} tarihli</span>
              {(pkgLow || pkgDone) && (
                <span className={cn('font-semibold', pkgDone ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')}>
                  {pkgDone ? 'Paket tamamlandı — yenile' : 'Paket bitmek üzere'}
                </span>
              )}
            </div>
            {activePackage.note && (
              <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">{activePackage.note}</p>
            )}
          </div>
        ) : (
          <p className="py-2 text-sm text-slate-400">
            Aktif paket yok. Ön ödemeli bir paket eklersen tamamlanan seanslar otomatik düşülür.
          </p>
        )}
      </section>

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

          {/* Tedavi Hedefleri — hafif tedavi planı */}
          <GoalsCard clientId={client.id} goals={goals} />

          {/* İlerleme Ölçümü — ölçek puanı eğrisi */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /> İlerleme Ölçümü
              </h2>
              <NewScoreDialog clientId={client.id} lastLabel={scoreLabel ?? undefined} />
            </div>

            {scores.length ? (
              <>
                {scoreSeries.length >= 2 && (
                  <>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{scoreLabel}</p>
                    <ScoreTrend data={scoreSeries} max={scoreMax} />
                  </>
                )}
                <ul className="mt-3 space-y-1.5 border-t border-slate-500/10 pt-3">
                  {recentScores.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-[13px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {s.value}{s.scaleMax ? <span className="text-slate-400">/{s.scaleMax}</span> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">{s.label}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatDate(s.date)}</span>
                      <DeleteButton action={deleteScore.bind(null, s.id, client.id)} className="h-7 w-7" />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-3 text-sm text-slate-400">
                Henüz ölçüm yok. Bir ölçek puanı ekleyerek danışanın ilerlemesini grafikle izle.
              </p>
            )}
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
                {sessions.slice(0, SESSION_PREVIEW).map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-slate-700 dark:text-slate-200">{formatDateTime(s.date)}</span>
                    <span className="flex items-center gap-2">
                      {s.status === 'scheduled' && (
                        <ReminderButton clientName={client.name} phone={client.phone} date={String(s.date)} template={reminder.template} therapist={reminder.therapist} />
                      )}
                      <span className="sensitive font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
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
            {sessions.length > SESSION_PREVIEW && (
              <p className="mt-3 border-t border-slate-500/10 pt-2.5 text-center text-xs text-slate-400">
                +{sessions.length - SESSION_PREVIEW} seans daha ·{' '}
                <Link href="/dashboard/agenda" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
                  Ajandada Gör
                </Link>
              </p>
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
                    <span className="sensitive font-mono text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{formatTRY(p.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Ödeme kaydı yok.</p>
            )}
          </section>

          {/* Makbuzlar */}
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
              <Receipt className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Makbuzlar
            </h2>
            {invoices.length ? (
              <ul className="space-y-2.5">
                {invoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{i.number}</span>
                    <span className="flex items-center gap-3">
                      <StatusBadge label={INVOICE_STATUS_LABEL[i.status]} tone={STATUS_TONE[i.status]} />
                      <span className="sensitive font-mono text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">{formatTRY(i.total)}</span>
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
              <p className="py-4 text-center text-sm text-slate-400">Makbuz yok.</p>
            )}
          </section>

          {/* Belgeler — bağlantı referansları (dosya kullanıcının deposunda) */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
                <Paperclip className="h-4 w-4 text-violet-500 dark:text-violet-400" /> Belgeler
              </h2>
              <NewDocumentDialog clientId={client.id} />
            </div>
            {documents.length ? (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                      <FileIcon className="h-4 w-4" />
                    </span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group min-w-0 flex-1"
                    >
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-300">
                        <span className="truncate">{doc.name}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {doc.type ? doc.type : 'Belge'}{doc.note ? ` · ${doc.note}` : ''}
                      </p>
                    </a>
                    <DeleteButton action={deleteDocument.bind(null, doc.id, client.id)} className="h-7 w-7" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-slate-400">
                Belge bağlantısı yok. Onam formu, test veya rapor bağlantısını ekle — dosya kendi deponda kalır.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Seans Defteri */}
      <section className="glass mt-6 overflow-hidden rounded-[1.5rem]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-500/10 px-4 py-3.5 sm:px-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            <StickyNote className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Seans Defteri
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-500/15 bg-[rgba(var(--paper),0.68)] px-3.5 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {notes.length} kayıt
            </span>
            <span className="rounded-full border border-slate-500/15 bg-[rgba(var(--paper),0.68)] px-3.5 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {pinnedNoteCount} sabitli
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-500/10 lg:grid-cols-[0.95fr_1.05fr] lg:divide-x lg:divide-y-0">
          <div className="p-4 sm:p-5">
            <div className="note-studio rounded-[1.35rem] p-4 sm:p-5">
              <NoteForm clientId={client.id} compact />
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold tracking-[0.01em] text-slate-700 dark:text-slate-200">Kayıtlar</p>
              {latestNoteAt && (
                <p className="text-xs text-slate-400">
                  Son kayıt <span className="font-semibold text-slate-500 dark:text-slate-300">{latestNoteAt}</span>
                </p>
              )}
            </div>

            {notes.length ? (
              <div className="space-y-3">
                {notes.map((n) => (
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
                      goalId: n.goalId,
                      goalTitle: n.goalId ? goals.find((g) => g.id === n.goalId)?.title ?? null : null,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="note-studio rounded-[1.3rem] px-6 py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  İlk not için alan hazır.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value, tone, sub, sensitive }: { label: string; value: string; tone: string; sub?: string; sensitive?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn('mt-1 font-display text-xl font-semibold tracking-tight', sensitive && 'sensitive', tone)}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] font-medium text-rose-500/90 dark:text-rose-400/90">{sub}</p>}
    </div>
  )
}
