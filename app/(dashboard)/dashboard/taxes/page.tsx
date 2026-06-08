import { Landmark, Receipt, TrendingUp, Info } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxRadial } from '@/components/charts/TaxRadial'
import { getTaxOverview } from '@/lib/queries'
import { formatTRY } from '@/lib/format'
import { TAX } from '@/lib/constants'

export default async function TaxesPage() {
  const { months, current } = await getTaxOverview()

  return (
    <>
      <PageHeader title="Vergiler" subtitle="Toplanan KDV ve tahmini gelir vergisi" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Radial özet */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Bu ay ödenecek</h2>
          <TaxRadial kdv={current.kdvCollected} incomeTax={current.incomeTax} />
        </section>

        {/* Kırılım */}
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Bu ay kırılım</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TaxStat icon={Receipt} accent="text-indigo-400 bg-indigo-500/12" label="Toplanan KDV" value={formatTRY(current.kdvCollected)} />
            <TaxStat icon={TrendingUp} accent="text-amber-500 bg-amber-500/12" label="Gelir vergisi (tahmini)" value={formatTRY(current.incomeTax)} />
            <TaxStat icon={Landmark} accent="text-rose-500 bg-rose-500/12" label="Toplam" value={formatTRY(current.totalDue)} />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-500/15 bg-slate-500/5 p-3 text-xs text-slate-500 dark:text-slate-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Gelir vergisi, net kâr üzerinden <strong>%{TAX.INCOME_TAX_ESTIMATE_RATE}</strong> ile yapılan
              basitleştirilmiş bir <strong>tahmindir</strong>; resmi beyan yerine geçmez. KDV, taslak dışındaki
              faturalardan hesaplanır.
            </p>
          </div>
        </section>
      </div>

      {/* Aylık tablo */}
      <section className="glass mt-6 overflow-hidden rounded-2xl">
        <h2 className="border-b border-slate-500/10 px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">
          Aylık döküm
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="px-5 py-2.5 font-medium">Ay</th>
                <th className="px-5 py-2.5 text-right font-medium">Gelir</th>
                <th className="px-5 py-2.5 text-right font-medium">Gider</th>
                <th className="px-5 py-2.5 text-right font-medium">KDV</th>
                <th className="px-5 py-2.5 text-right font-medium">Gelir v.</th>
                <th className="px-5 py-2.5 text-right font-medium">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {months.map((m) => (
                <tr key={m.key} className="text-slate-700 dark:text-slate-200">
                  <td className="px-5 py-3 font-medium capitalize">{m.label}</td>
                  <td className="px-5 py-3 text-right text-emerald-500">{formatTRY(m.income, { compact: true })}</td>
                  <td className="px-5 py-3 text-right text-rose-500">{formatTRY(m.expense, { compact: true })}</td>
                  <td className="px-5 py-3 text-right">{formatTRY(m.kdvCollected, { compact: true })}</td>
                  <td className="px-5 py-3 text-right">{formatTRY(m.incomeTax, { compact: true })}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">{formatTRY(m.totalDue, { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function TaxStat({
  icon: Icon,
  accent,
  label,
  value,
}: {
  icon: typeof Landmark
  accent: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-500/10 p-4">
      <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
