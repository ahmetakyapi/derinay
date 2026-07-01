import Link from 'next/link'
import { Landmark, Receipt, TrendingUp, Info, FileDown, Scissors } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { TaxRadial } from '@/components/charts/TaxRadial'
import { TaxBars } from '@/components/charts/TaxBars'
import { getTaxOverview } from '@/lib/queries'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

export default async function TaxesPage() {
  const { months, current, taxRates } = await getTaxOverview()
  const year = new Date().getFullYear()

  // Tam ay adı (kısaltma değil) + dönem toplamları
  const longLabel = (key: string) =>
    new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(
      new Date(Number(key.split('-')[0]), Number(key.split('-')[1]) - 1, 1),
    )
  const totals = months.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
      kdv: acc.kdv + m.kdvCollected,
      incomeTax: acc.incomeTax + m.incomeTax,
      due: acc.due + m.totalDue,
    }),
    { income: 0, expense: 0, kdv: 0, incomeTax: 0, due: 0 },
  )

  const breakdown = [
    {
      label: 'Toplanan KDV',
      value: current.kdvCollected,
      icon: Receipt,
      tone: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      hint: 'taslak hariç faturalardan',
    },
    {
      label: 'Gelir Vergisi',
      value: current.incomeTax,
      icon: TrendingUp,
      tone: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      hint: `net kârın %${taxRates.incomeTaxRate}'i (tahmini)`,
    },
    {
      label: 'Toplam Yük',
      value: current.totalDue,
      icon: Landmark,
      tone: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-500/10',
      hint: 'bu ay ödenecek',
    },
    ...(current.stopajWithheld > 0
      ? [{
          label: 'Kesilen Stopaj',
          value: current.stopajWithheld,
          icon: Scissors,
          tone: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          hint: 'yıllık gelir vergisinden mahsup',
        }]
      : []),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Finans"
        title="Vergiler"
        subtitle="Toplanan KDV ve tahmini gelir vergisi — muhasebecine hazır"
        action={
          <Link
            href={`/reports/${year}/print`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
          >
            <FileDown className="h-4 w-4" /> PDF Rapor
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Radial özet + lejant */}
        <section className="glass rounded-2xl p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            Bu Ay Ödenecek
          </h2>
          <TaxRadial kdv={current.kdvCollected} incomeTax={current.incomeTax} />
          <div className="mt-3 space-y-2 border-t border-slate-500/10 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> KDV
              </span>
              <span className="sensitive font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                {formatTRY(current.kdvCollected)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Gelir vergisi
              </span>
              <span className="sensitive font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                {formatTRY(current.incomeTax)}
              </span>
            </div>
          </div>
        </section>

        {/* Kırılım — aksanlı kartlar */}
        <section className="lg:col-span-2">
          <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-3">
            {breakdown.map((b) => (
              <div key={b.label} className="glass relative flex flex-col overflow-hidden rounded-2xl p-5">
                <span className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', b.bg, b.tone)}>
                  <b.icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {b.label}
                </p>
                <p className={cn('sensitive mt-1.5 font-display text-2xl font-semibold tracking-tight', b.tone)}>
                  {formatTRY(b.value)}
                </p>
                <p className="mt-auto pt-2 text-[11px] text-slate-400">{b.hint}</p>
              </div>
            ))}

            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 sm:col-span-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Info className="h-4 w-4" />
              </span>
              <div className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <p className="mb-0.5 font-semibold text-slate-800 dark:text-slate-100">Tahmini hesaplama</p>
                <p>
                  Gelir vergisi, net kâr üzerinden <strong>%{taxRates.incomeTaxRate}</strong> ile
                  hesaplanan basitleştirilmiş bir tahmindir; resmi beyan yerine geçmez. KDV, taslak
                  dışındaki makbuzlardan toplanır. Oranları <strong>Ayarlar</strong>&apos;dan değiştirebilirsin.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Vergi yükü trendi */}
      <section className="glass mt-6 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
            Vergi Yükü Trendi
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> KDV</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Gelir v.</span>
          </div>
        </div>
        <TaxBars data={months} />
      </section>

      {/* Aylık döküm — bu ay vurgulu, dönem toplamı altta */}
      <section className="glass mt-6 overflow-hidden rounded-2xl">
        <h2 className="border-b border-slate-500/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
          Aylık Döküm
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="px-5 py-2.5 font-medium">Ay</th>
                <th className="px-5 py-2.5 text-right font-medium">Gelir</th>
                <th className="px-5 py-2.5 text-right font-medium">Gider</th>
                <th className="px-5 py-2.5 text-right font-medium">KDV</th>
                <th className="px-5 py-2.5 text-right font-medium">Gelir v.</th>
                <th className="px-5 py-2.5 text-right font-medium">Toplam Vergi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/10">
              {months.map((m, i) => {
                const isCurrent = i === months.length - 1
                return (
                  <tr
                    key={m.key}
                    className={cn(
                      'text-slate-700 dark:text-slate-200',
                      isCurrent && 'bg-amber-500/[0.06]',
                    )}
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-medium capitalize">
                      <span className="flex items-center gap-2">
                        {longLabel(m.key)}
                        {isCurrent && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                            Bu Ay
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="sensitive px-5 py-3 text-right font-mono text-[13px] tabular-nums text-emerald-600 dark:text-emerald-400">{formatTRY(m.income)}</td>
                    <td className="sensitive px-5 py-3 text-right font-mono text-[13px] tabular-nums text-rose-600 dark:text-rose-400">{formatTRY(m.expense)}</td>
                    <td className="sensitive px-5 py-3 text-right font-mono text-[13px] tabular-nums">{formatTRY(m.kdvCollected)}</td>
                    <td className="sensitive px-5 py-3 text-right font-mono text-[13px] tabular-nums">{formatTRY(m.incomeTax)}</td>
                    <td className="sensitive px-5 py-3 text-right font-mono text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">{formatTRY(m.totalDue)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-500/15 bg-slate-500/[0.05] font-bold text-slate-900 dark:text-white">
                <td className="px-5 py-3.5">Son {months.length} Ay</td>
                <td className="sensitive px-5 py-3.5 text-right font-mono text-[13px] tabular-nums text-emerald-600 dark:text-emerald-400">{formatTRY(totals.income)}</td>
                <td className="sensitive px-5 py-3.5 text-right font-mono text-[13px] tabular-nums text-rose-600 dark:text-rose-400">{formatTRY(totals.expense)}</td>
                <td className="sensitive px-5 py-3.5 text-right font-mono text-[13px] tabular-nums">{formatTRY(totals.kdv)}</td>
                <td className="sensitive px-5 py-3.5 text-right font-mono text-[13px] tabular-nums">{formatTRY(totals.incomeTax)}</td>
                <td className="px-5 py-3.5 text-right font-display text-base font-semibold tracking-tight">{formatTRY(totals.due)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </>
  )
}
