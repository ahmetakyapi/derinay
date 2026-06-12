'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Building2, MessageSquareText, Landmark, Target, Loader2 } from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { saveBusinessInfo, saveReminderTemplate, saveTaxSettings, saveIncomeGoal } from '@/app/actions/settings'
import type { BusinessInfo } from '@/lib/constants'
import type { TaxSettings } from '@/lib/queries'

type Saved = 'business' | 'reminder' | 'tax' | 'goal' | null

export function SettingsForm({
  business,
  reminderTemplate,
  taxSettings,
  incomeGoal,
}: {
  business: BusinessInfo
  reminderTemplate: string
  taxSettings: TaxSettings
  incomeGoal: number
}) {
  const [b, setB] = useState<BusinessInfo>(business)
  const [tax, setTax] = useState<TaxSettings>(taxSettings)
  const [goal, setGoal] = useState(incomeGoal)
  const [tpl, setTpl] = useState(reminderTemplate)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<Saved>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  const set = (k: keyof BusinessInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setB((prev) => ({ ...prev, [k]: e.target.value }))

  function saveBusiness(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await saveBusinessInfo(b)
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setSaved('business')
      router.refresh()
      setTimeout(() => setSaved(null), 2500)
    })
  }

  function saveReminder(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await saveReminderTemplate(tpl)
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setSaved('reminder')
      router.refresh()
      setTimeout(() => setSaved(null), 2500)
    })
  }

  function saveTax(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await saveTaxSettings(tax)
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setSaved('tax')
      router.refresh()
      setTimeout(() => setSaved(null), 2500)
    })
  }

  const setRate = (k: keyof TaxSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setTax((prev) => ({ ...prev, [k]: Number(e.target.value) }))

  function saveGoal(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await saveIncomeGoal(goal)
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      setSaved('goal')
      router.refresh()
      setTimeout(() => setSaved(null), 2500)
    })
  }

  return (
    <div className="space-y-6">
      {/* İşletme kimliği — makbuz/fatura başlığı */}
      <form onSubmit={saveBusiness} className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
            <Building2 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">İşletme Kimliği</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Makbuz, fatura ve yıllık raporun başlığında görünür</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="İşletme / marka adı"><Input value={b.name} onChange={set('name')} required /></Field>
          <Field label="Ad soyad"><Input value={b.owner} onChange={set('owner')} required /></Field>
          <Field label="Unvan"><Input value={b.title} onChange={set('title')} placeholder="Klinik Psikolog" /></Field>
          <Field label="Vergi dairesi"><Input value={b.taxOffice} onChange={set('taxOffice')} placeholder="Kadıköy" /></Field>
          <Field label="VKN / TC Kimlik No"><Input value={b.taxId} onChange={set('taxId')} placeholder="11111111111" /></Field>
          <Field label="Telefon"><Input value={b.phone} onChange={set('phone')} placeholder="05xx xxx xx xx" /></Field>
          <div className="sm:col-span-2">
            <Field label="Adres"><Input value={b.address} onChange={set('address')} placeholder="Mahalle, Sokak No, İlçe / İl" /></Field>
          </div>
          <Field label="E-posta"><Input value={b.email} onChange={set('email')} type="email" placeholder="ornek@mail.com" /></Field>
          <Field label="IBAN (opsiyonel)"><Input value={b.iban} onChange={set('iban')} placeholder="TR.. .... .... .." /></Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {saved === 'business' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Kaydedildi
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>

      {/* Vergi oranları — tüm hesaplamaları besler */}
      <form onSubmit={saveTax} className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
            <Landmark className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Vergi Oranları</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Makbuz varsayılanları ve vergi tahminleri bu oranlarla hesaplanır</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Field label="KDV oranı (%)">
            <Input type="number" min="0" max="60" step="1" value={tax.kdvRate} onChange={setRate('kdvRate')} required />
          </Field>
          <Field label="Stopaj / tevkifat (%)">
            <Input type="number" min="0" max="60" step="1" value={tax.stopajRate} onChange={setRate('stopajRate')} required />
          </Field>
          <Field label="Gelir vergisi tahmini (%)">
            <Input type="number" min="0" max="60" step="1" value={tax.incomeTaxRate} onChange={setRate('incomeTaxRate')} required />
          </Field>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          KDV ve stopaj yeni makbuzun varsayılanı olur (makbuz kesilirken değiştirilebilir).
          Gelir vergisi oranı, panel ve Vergiler sayfasındaki tahmini anında günceller.
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          {saved === 'tax' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Kaydedildi
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>

      {/* Aylık gelir hedefi — dashboard ilerleme bandı */}
      <form onSubmit={saveGoal} className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
            <Target className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Aylık Gelir Hedefi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Genel Bakış&apos;ta ilerleme çubuğu olarak görünür — 0 bırakırsan kapalı</p>
          </div>
        </div>

        <Field label="Hedef (₺ / ay)">
          <Input type="number" min="0" step="500" value={goal || ''} onChange={(e) => setGoal(Number(e.target.value) || 0)} placeholder="örn. 60000" />
        </Field>

        <div className="mt-5 flex items-center justify-end gap-3">
          {saved === 'goal' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Kaydedildi
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>

      {/* Hatırlatma mesajı şablonu */}
      <form onSubmit={saveReminder} className="glass rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Hatırlatma Mesajı</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Seans öncesi WhatsApp hatırlatmasının şablonu</p>
          </div>
        </div>

        <Field label="Şablon">
          <Textarea value={tpl} onChange={(e) => setTpl(e.target.value)} rows={3} />
        </Field>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['{ad}', '{tarih}', '{terapist}'].map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => setTpl((t) => `${t}${t.endsWith(' ') || !t ? '' : ' '}${ph}`)}
              className="rounded-full border border-slate-500/20 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-500 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
            >
              {ph}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          {saved === 'reminder' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Kaydedildi
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </form>

      {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}
    </div>
  )
}
