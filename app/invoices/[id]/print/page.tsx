import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PrintButton } from '@/components/invoice/PrintButton'
import { BloomMark } from '@/components/brand/BloomMark'
import { getInvoiceDetail, getBusinessInfo } from '@/lib/queries'
import { INVOICE_STATUS_LABEL, OWNER_PLACEHOLDER } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function InvoicePrintPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { auto?: string }
}) {
  const [inv, BUSINESS] = await Promise.all([getInvoiceDetail(params.id), getBusinessInfo()])
  if (!inv) notFound()

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      {/* Araç çubuğu — yazdırmada gizli */}
      <div className="mx-auto mb-6 flex max-w-[820px] items-center justify-between print:hidden">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Makbuzlar
        </Link>
        <PrintButton auto={searchParams.auto === '1'} />
      </div>

      {/* Fatura kağıdı (A4 oranı, her zaman açık tema) */}
      <div className="mx-auto max-w-[820px] rounded-2xl bg-white p-10 text-slate-900 shadow-xl print:max-w-none print:rounded-none print:p-0 print:shadow-none sm:p-14">
        {/* Üst başlık */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2.5">
              {/* Mürekkep damgası — uygulama markasıyla aynı kimlik */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <BloomMark className="h-[22px] w-[22px] text-amber-50" />
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">{BUSINESS.name}</span>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-500">
              <p className="font-semibold text-slate-700">{BUSINESS.owner || OWNER_PLACEHOLDER}</p>
              <p>{BUSINESS.title}</p>
              <p>{BUSINESS.address}</p>
              <p>{BUSINESS.phone} · {BUSINESS.email}</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-base font-extrabold uppercase leading-tight tracking-wide text-slate-400">
              Serbest Meslek<br />Makbuzu
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold">{inv.number}</p>
            <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {INVOICE_STATUS_LABEL[inv.status]}
            </span>
          </div>
        </div>

        {/* Taraflar + tarihler */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="mb-1 text-[13px] font-semibold text-slate-600">Makbuz Edilen</p>
            <p className="font-bold">{inv.clientName ?? 'Genel müşteri'}</p>
            {inv.clientEmail && <p className="text-slate-500">{inv.clientEmail}</p>}
            {inv.clientPhone && <p className="text-slate-500">{inv.clientPhone}</p>}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <p className="text-[13px] font-semibold text-slate-600">Düzenleme Tarihi</p>
              <p className="font-semibold">{formatDate(inv.issueDate)}</p>
            </div>
            {inv.dueDate && (
              <div>
                <p className="text-[13px] font-semibold text-slate-600">Vade Tarihi</p>
                <p className="font-semibold">{formatDate(inv.dueDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Kalemler */}
        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left text-[13px] text-slate-600">
              <th className="pb-3 font-semibold">Açıklama</th>
              <th className="pb-3 text-right font-semibold">Tutar</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-4">
                <p className="font-semibold">Psikolojik danışmanlık hizmeti</p>
                {inv.note && <p className="mt-0.5 text-xs text-slate-500">{inv.note}</p>}
              </td>
              <td className="py-4 text-right font-mono font-medium tabular-nums">{formatTRY(inv.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Makbuz dökümü — brüt, stopaj, net, KDV, tahsil edilen */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Brüt ücret</span>
              <span>{formatTRY(inv.subtotal)}</span>
            </div>
            {inv.stopajAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Gelir vergisi stopajı (%{inv.stopajRate})</span>
                <span>−{formatTRY(inv.stopajAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Net ücret</span>
              <span>{formatTRY(inv.subtotal - inv.stopajAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Hesaplanan KDV (%{inv.kdvRate})</span>
              <span>+{formatTRY(inv.kdvAmount)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-200 pt-3 text-base font-extrabold">
              <span>Tahsil edilen</span>
              <span>{formatTRY(inv.total)}</span>
            </div>
          </div>
        </div>

        {/* IBAN (varsa) */}
        {BUSINESS.iban && (
          <div className="mt-8 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Ödeme / IBAN:</span> {BUSINESS.iban}
          </div>
        )}

        {/* Alt bilgi */}
        <div className="mt-14 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>{BUSINESS.taxOffice} V.D. · VKN/TCKN: {BUSINESS.taxId}</p>
          <p className="mt-1">Bu belge {BUSINESS.name} üzerinden oluşturulmuştur. Bizi tercih ettiğiniz için teşekkürler.</p>
        </div>
      </div>
    </div>
  )
}
