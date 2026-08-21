import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from '@/components/invoice/PrintButton'
import { BloomMark } from '@/components/brand/BloomMark'
import { getClientDetail, getBusinessInfo } from '@/lib/queries'
import {
  CLIENT_STATUS_LABEL,
  SESSION_STATUS_LABEL,
  NOTE_KIND_LABEL,
  MOOD_LABEL,
  PAYMENT_METHOD_LABEL,
  OWNER_PLACEHOLDER,
} from '@/lib/constants'
import { formatTRY, formatDate, formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Danışan Dosyası — yazdırılabilir klinik özet (tarayıcı print → PDF).
 * Süpervizyon, devir veya arşiv için: kimlik, hedefler, ölçümler,
 * seans geçmişi ve Seans Defteri tek belgede.
 */
export default async function ClientFilePrintPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { auto?: string }
}) {
  const [data, BUSINESS] = await Promise.all([getClientDetail(params.id), getBusinessInfo()])
  if (!data) notFound()
  const { client, notes, sessions, payments, stats, scores, goals } = data

  const GOAL_LABEL = { active: 'Devam ediyor', achieved: 'Tamamlandı', paused: 'Duraklatıldı' } as const

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      {/* Araç çubuğu — yazdırmada gizli */}
      <div className="mx-auto mb-6 flex max-w-[860px] items-center justify-between print:hidden">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Danışan Profili
        </Link>
        <PrintButton auto={searchParams.auto === '1'} />
      </div>

      {/* Dosya kağıdı — her zaman açık tema */}
      <div className="mx-auto max-w-[860px] rounded-2xl bg-white p-10 text-slate-900 shadow-xl print:max-w-none print:rounded-none print:p-0 print:shadow-none sm:p-12">
        {/* Başlık */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <BloomMark className="h-[22px] w-[22px] text-amber-50" />
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">{BUSINESS.name}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {BUSINESS.owner || OWNER_PLACEHOLDER} · {BUSINESS.title}
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-slate-400">Danışan Dosyası</h1>
            <p className="text-xs text-slate-400">{formatDate(new Date().toISOString())} itibarıyla</p>
          </div>
        </div>

        {/* Kimlik */}
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Danışan</p>
            <p className="font-display text-xl font-semibold">{client.name}</p>
            <p className="mt-1 text-slate-500">
              {[client.email, client.phone].filter(Boolean).join(' · ') || '—'}
            </p>
            {client.tags.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">{client.tags.map((t) => `#${t}`).join('  ')}</p>
            )}
          </div>
          <div className="text-right text-sm">
            <p>
              <span className="text-slate-400">Durum: </span>
              <span className="font-semibold">{CLIENT_STATUS_LABEL[client.status]}</span>
            </p>
            <p className="mt-0.5">
              <span className="text-slate-400">Başlangıç: </span>
              <span className="font-semibold">{formatDate(client.startDate)}</span>
            </p>
            <p className="mt-0.5">
              <span className="text-slate-400">KVKK onamı: </span>
              <span className="font-semibold">{client.consentGiven ? 'Alındı' : 'Eksik'}</span>
            </p>
          </div>
        </div>

        {/* Özet sayılar */}
        <div className="mt-6 grid grid-cols-4 gap-3 rounded-xl bg-slate-50 p-4 text-center text-sm">
          <div>
            <p className="font-display text-xl font-semibold">{stats.completedSessions}</p>
            <p className="text-xs text-slate-500">tamamlanan seans</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{stats.noShowSessions + stats.cancelledSessions}</p>
            <p className="text-xs text-slate-500">iptal / gelmedi</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{formatTRY(stats.totalPaid, { compact: true })}</p>
            <p className="text-xs text-slate-500">toplam tahsilat</p>
          </div>
          <div>
            <p className="font-display text-xl font-semibold">{goals.filter((g) => g.status === 'achieved').length}/{goals.length || 0}</p>
            <p className="text-xs text-slate-500">hedef tamamlandı</p>
          </div>
        </div>

        {/* Tedavi hedefleri */}
        {goals.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              Tedavi Hedefleri
            </h2>
            <ul className="space-y-1 text-sm">
              {goals.map((g) => (
                <li key={g.id} className="flex items-baseline justify-between gap-4">
                  <span className={g.status === 'achieved' ? 'text-slate-400 line-through' : ''}>{g.title}</span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">{GOAL_LABEL[g.status]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* İlerleme ölçümleri */}
        {scores.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              İlerleme Ölçümleri
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {[...scores].reverse().slice(0, 12).map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 text-slate-500">{formatDate(s.date)}</td>
                    <td className="py-1.5">{s.label}</td>
                    <td className="py-1.5 text-right font-mono font-semibold tabular-nums">
                      {s.value}{s.scaleMax ? ` / ${s.scaleMax}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Seans geçmişi */}
        <section className="mt-8">
          <h2 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            Seans Geçmişi ({sessions.length})
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {sessions.slice(0, 40).map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-500">{formatDateTime(s.date)}</td>
                  <td className="py-1.5">{SESSION_STATUS_LABEL[s.status]}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums">{formatTRY(s.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length > 40 && (
            <p className="mt-1 text-xs text-slate-400">… ve {sessions.length - 40} eski seans</p>
          )}
        </section>

        {/* Seans Defteri */}
        {notes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              Seans Defteri ({notes.length} not)
            </h2>
            <div className="space-y-4">
              {notes.map((n) => (
                <div key={n.id} className="break-inside-avoid rounded-lg border border-slate-100 p-3.5">
                  <p className="mb-1 text-xs text-slate-400">
                    {formatDateTime(String(n.createdAt))} · {NOTE_KIND_LABEL[n.kind]}
                    {n.mood ? ` · duygu: ${MOOD_LABEL[n.mood]}` : ''}
                  </p>
                  {n.title && <p className="font-semibold">{n.title}</p>}
                  <p className="mt-0.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{n.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ödeme özeti */}
        {payments.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              Ödemeler ({payments.length})
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {payments.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 text-slate-500">{formatDate(p.date)}</td>
                    <td className="py-1.5">{PAYMENT_METHOD_LABEL[p.method]}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{formatTRY(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Alt bilgi — gizlilik */}
        <div className="mt-12 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-500">GİZLİ — Bu dosya özel nitelikli kişisel veri içerir.</p>
          <p className="mt-1">
            {BUSINESS.name} · {BUSINESS.owner || OWNER_PLACEHOLDER} tarafından {formatDate(new Date().toISOString())} tarihinde oluşturulmuştur.
            KVKK kapsamında yalnızca yetkili kişilerle paylaşılabilir.
          </p>
        </div>
      </div>
    </div>
  )
}
