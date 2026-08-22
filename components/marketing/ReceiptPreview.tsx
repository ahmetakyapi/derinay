import { CLIENT_COLOR_BG } from '@/lib/constants'
import { calcMakbuz } from '@/lib/finance'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Makbuz kesme sahnesi — kodla çizilen panel kesiti.
 *
 * Rakamlar UYDURULMAZ: `calcMakbuz` ile, panelin kendi hesabıyla üretilir.
 * Böylece landing'deki tutarlar mevzuat mantığı değişirse birlikte değişir ve
 * "kanıt" iddiası yalan söyleyemez.
 *
 * Tutarların tamamı `font-mono tabular-nums` — hem sütun hizası için hem de
 * display ailesinin ₺ glifi yanlış olduğu için (bkz. globals.css).
 */

const BRUT = 4000
const KDV_RATE = 20
const STOPAJ_RATE = 20

export function ReceiptPreview() {
  const { kdvAmount, stopajAmount, netUcret, total } = calcMakbuz(BRUT, KDV_RATE, STOPAJ_RATE)

  const rows = [
    { label: 'Brüt ücret', value: formatTRY(BRUT), tone: 'text-slate-600 dark:text-slate-300' },
    { label: `Gelir vergisi stopajı (%${STOPAJ_RATE})`, value: `−${formatTRY(stopajAmount)}`, tone: 'text-rose-600 dark:text-rose-400' },
    { label: 'Net ücret', value: formatTRY(netUcret), tone: 'text-slate-600 dark:text-slate-300' },
    { label: `Hesaplanan KDV (%${KDV_RATE})`, value: `+${formatTRY(kdvAmount)}`, tone: 'text-amber-600 dark:text-amber-400' },
  ]

  return (
    <div className="p-4 sm:p-5">
      {/* Form tarafı — danışan + brüt ücret */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Danışan
          </span>
          <span className="flex h-9 items-center gap-2 rounded-xl border border-slate-500/15 bg-[rgba(var(--paper),0.7)] px-2.5">
            {/* Avatar gradyanı uygulamayla AYNI kaynaktan — `indigo` bu projede
                çam/petrol yeşilidir, mor değil (tailwind.config.ts remap). */}
            <span className={cn('flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br text-[9px] font-bold text-white', CLIENT_COLOR_BG.indigo)}>
              AY
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">A. Yılmaz</span>
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Brüt ücret (₺)
          </span>
          <span className="flex h-9 items-center rounded-xl border border-indigo-500/40 bg-[rgba(var(--paper),0.9)] px-2.5 font-mono text-xs font-bold tabular-nums text-slate-900 ring-2 ring-indigo-500/15 dark:text-white">
            4.000,00
          </span>
        </label>
      </div>

      {/* Oran pilleri — makbuz başına seçilir */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">KDV</span>
        {[0, 1, 10, 20].map((r) => (
          <span
            key={r}
            className={cn(
              'rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
              r === KDV_RATE
                ? 'border-indigo-500/45 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-500/15 text-slate-400',
            )}
          >
            %{r}
          </span>
        ))}
        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Stopaj</span>
        {['Yok', '%20'].map((r) => (
          <span
            key={r}
            className={cn(
              'rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums',
              r === '%20'
                ? 'border-indigo-500/45 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-500/15 text-slate-400',
            )}
          >
            {r}
          </span>
        ))}
      </div>

      {/* Hesap — sen alanı bırakmadan aşağıda beliren kısım */}
      <div className="mt-4 rounded-xl border border-slate-500/12 bg-[rgba(var(--paper),0.6)] p-3.5">
        <dl className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 text-[11px]">
              <dt className="text-slate-500 dark:text-slate-400">{r.label}</dt>
              <dd className={cn('shrink-0 font-mono tabular-nums', r.tone)}>{r.value}</dd>
            </div>
          ))}
          {/* Toplam çizgisi — alışkanlığın kendisi */}
          <div className="flex items-baseline justify-between gap-3 border-t border-slate-500/20 pt-2.5 text-[13px]">
            <dt className="font-bold text-slate-800 dark:text-slate-100">Tahsil edilecek</dt>
            <dd className="shrink-0 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {formatTRY(total)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Kaydedilmiş makbuz — numara sıradan devam eder, durum kendi hâlini taşır */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-slate-500/12 px-3 py-2.5">
        <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          DER-2026-014
        </span>
        <span className="h-3 w-px bg-slate-500/20" />
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          Ödendi
        </span>
        <span className="ml-auto font-mono text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
          {formatTRY(total)}
        </span>
      </div>
    </div>
  )
}
