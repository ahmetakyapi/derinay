import Link from 'next/link'
import { DatabaseBackup, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SettingsForm } from '@/components/forms/SettingsForm'
import { getBusinessInfo, getReminderTemplate, getTaxSettings, getIncomeGoal } from '@/lib/queries'
import { BUSINESS_FIELD_LABELS, isPlaceholderValue, type BusinessInfo } from '@/lib/constants'

export const metadata = { title: 'Ayarlar' }

export default async function SettingsPage() {
  const [business, reminderTemplate, taxSettings, incomeGoal] = await Promise.all([
    getBusinessInfo(),
    getReminderTemplate(),
    getTaxSettings(),
    getIncomeGoal(),
  ])

  // Makbuz/rapor başlığında görünen alanlardan hangileri hâlâ yer tutucu?
  const missing = (Object.keys(BUSINESS_FIELD_LABELS) as (keyof BusinessInfo)[]).filter((k) =>
    isPlaceholderValue(business[k]),
  )

  return (
    <>
      <PageHeader
        eyebrow="Yaşam"
        title="Ayarlar"
        subtitle="İşletme kimliğin, vergi oranların, hatırlatma şablonun ve veri yönetimi"
      />

      <div className="mx-auto max-w-3xl">
        {/* Kimlik tamlığı — makbuz kesmeden önce görülmesi gereken tek uyarı */}
        {missing.length > 0 ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {missing.length} alan eksik — makbuzda yer tutucu görünecek
              </p>
              <p className="mt-0.5">
                {missing.map((k) => BUSINESS_FIELD_LABELS[k]).join(' · ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              İşletme kimliğin eksiksiz — makbuz ve raporlar hazır.
            </p>
          </div>
        )}

        <SettingsForm business={business} reminderTemplate={reminderTemplate} taxSettings={taxSettings} incomeGoal={incomeGoal} />

        {/* Veri yönetimi */}
        <div className="glass mt-6 rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Veri</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tüm kayıtlarını CSV / JSON olarak dışa aktar.</p>
          <Link
            href="/dashboard/backup"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-500/20 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <DatabaseBackup className="h-4 w-4" /> Yedekleme Sayfasına Git
          </Link>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Info className="h-4 w-4" />
          </span>
          <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            Buradaki <strong>İşletme Kimliği</strong> bilgileri kestiğin makbuz/faturaların ve yıllık
            raporun başlığında görünür. Eksik bırakırsan belgelerde köşeli parantezli yer tutucular kalır.
          </p>
        </div>
      </div>
    </>
  )
}
