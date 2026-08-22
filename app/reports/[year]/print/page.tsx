import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from '@/components/invoice/PrintButton'
import { BloomMark } from '@/components/brand/BloomMark'
import { getYearAnalytics, getBusinessInfo } from '@/lib/queries'
import { PAYMENT_METHOD_LABEL, OWNER_PLACEHOLDER } from '@/lib/constants'
import { formatTRY } from '@/lib/format'

export const dynamic = 'force-dynamic'

/**
 * Yıllık finans raporu — tarayıcı yazdırma ile PDF (muhasebeci dostu format).
 */
export default async function ReportPrintPage({
  params,
  searchParams,
}: {
  params: { year: string }
  searchParams: { auto?: string }
}) {
  const year = Number(params.year)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) notFound()
  const [a, BUSINESS] = await Promise.all([getYearAnalytics(year), getBusinessInfo()])

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      {/* Araç çubuğu — yazdırmada gizli */}
      <div className="mx-auto mb-6 flex max-w-[860px] items-center justify-between print:hidden">
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Analiz
        </Link>
        <PrintButton auto={searchParams.auto === '1'} />
      </div>

      {/* Rapor kağıdı — her zaman açık tema */}
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
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-slate-400">Finans Raporu</h1>
            <p className="font-display text-3xl font-semibold">{year}</p>
          </div>
        </div>

        {/* Yıllık özet */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ReportStat label="Toplam gelir" value={formatTRY(a.totals.income)} />
          <ReportStat label="Toplam gider" value={formatTRY(a.totals.expense)} />
          <ReportStat label="Net kâr" value={formatTRY(a.totals.net)} strong />
          <ReportStat label="Toplam vergi (tahmini)" value={formatTRY(a.totals.tax)} />
        </div>

        {/* Aylık döküm */}
        <h2 className="mt-8 mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Aylık Döküm</h2>
        {/* Dar ekranda 7 sütun taşıyordu; yazdırmada kapsayıcı devre dışı */}
        <div className="-mx-4 overflow-x-auto px-4 print:mx-0 print:overflow-visible print:px-0">
        <table className="w-full min-w-[560px] text-sm print:min-w-0">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 font-semibold">Ay</th>
              <th className="py-2 text-right font-semibold">Gelir</th>
              <th className="py-2 text-right font-semibold">Gider</th>
              <th className="py-2 text-right font-semibold">Net</th>
              <th className="py-2 text-right font-semibold">KDV</th>
              <th className="py-2 text-right font-semibold">Gelir v.</th>
              <th className="py-2 text-right font-semibold">Toplam Vergi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {a.months.map((m) => (
              <tr key={m.key}>
                <td className="py-2 font-medium">{m.label}</td>
                <td className="py-2 text-right font-mono tabular-nums">{formatTRY(m.income)}</td>
                <td className="py-2 text-right font-mono tabular-nums">{formatTRY(m.expense)}</td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums">{formatTRY(m.net)}</td>
                <td className="py-2 text-right font-mono tabular-nums">{formatTRY(m.kdv)}</td>
                <td className="py-2 text-right font-mono tabular-nums">{formatTRY(m.incomeTax)}</td>
                <td className="py-2 text-right font-mono font-semibold tabular-nums">{formatTRY(m.totalDue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="py-2.5">Toplam</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.income)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.expense)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.net)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.kdv)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.tax - a.totals.kdv)}</td>
              <td className="py-2.5 text-right font-mono tabular-nums">{formatTRY(a.totals.tax)}</td>
            </tr>
          </tfoot>
        </table>
        </div>

        {/* Kırılımlar */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Gider Kategorileri</h2>
            {a.expenseByCategory.length ? (
              <ul className="divide-y divide-slate-100 text-sm">
                {a.expenseByCategory.map((c) => (
                  <li key={c.category} className="flex justify-between gap-4 py-1.5">
                    <span className="min-w-0 truncate">{c.category}</span>
                    <span className="shrink-0 font-mono tabular-nums">{formatTRY(c.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Veri yok.</p>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Gelir Kategorileri</h2>
            {a.incomeByCategory.length ? (
              <ul className="divide-y divide-slate-100 text-sm">
                {a.incomeByCategory.map((c) => (
                  <li key={c.category} className="flex justify-between gap-4 py-1.5">
                    <span className="min-w-0 truncate">{c.category}</span>
                    <span className="shrink-0 font-mono tabular-nums">{formatTRY(c.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Veri yok.</p>
            )}

            <h2 className="mt-6 mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Tahsilat Yöntemleri</h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {a.methodTotals.map((m) => (
                <li key={m.method} className="flex justify-between gap-4 py-1.5">
                  <span>
                    {PAYMENT_METHOD_LABEL[m.method]} <span className="text-slate-400">({m.count})</span>
                  </span>
                  <span className="font-mono tabular-nums">{formatTRY(m.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dipnot */}
        <p className="mt-10 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
          Bu rapor {BUSINESS.name} uygulamasından otomatik üretilmiştir. Gelir vergisi tutarları
          basitleştirilmiş bir tahmindir; resmi beyan yerine geçmez. KDV, taslak dışındaki
          faturalardan hesaplanır.
        </p>
      </div>
    </div>
  )
}

function ReportStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      {/* Vurgulu değer daha KALIN olmalı; eskiden 600 iken diğerleri 700'dü */}
      <p className={`mt-1 font-mono text-lg tabular-nums ${strong ? 'font-bold' : 'font-semibold'}`}>
        {value}
      </p>
    </div>
  )
}
