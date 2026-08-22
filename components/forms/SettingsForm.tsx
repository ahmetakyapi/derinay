'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Building2, MessageSquareText, Landmark, Target } from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { saveBusinessInfo, saveReminderTemplate, saveTaxSettings, saveIncomeGoal } from '@/app/actions/settings'
import { isPlaceholderValue, type BusinessInfo } from '@/lib/constants'
import type { TaxSettings } from '@/lib/queries'

/**
 * Varsayılan işletme alanları "[Vergi Dairesi]" gibi köşeli parantezli yer
 * tutuculardır — belgede "burayı doldur" işareti olarak dururlar ama forma
 * DEĞER olarak gelmemeliler (kullanıcı önce silmek zorunda kalıyordu).
 * Boşaltılıp gerçek `placeholder` metnine bırakılırlar.
 */
function stripPlaceholders(b: BusinessInfo): BusinessInfo {
  const out = { ...b }
  for (const key of Object.keys(out) as (keyof BusinessInfo)[]) {
    if (isPlaceholderValue(out[key])) out[key] = ''
  }
  return out
}

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
  const [b, setB] = useState<BusinessInfo>(() => stripPlaceholders(business))
  const [tax, setTax] = useState<TaxSettings>(taxSettings)
  const [goal, setGoal] = useState(incomeGoal)
  const [tpl, setTpl] = useState(reminderTemplate)
  // Bölüm bazlı durum: tek paylaşılan pending/error, bir formu kaydederken
  // dördünün de düğmesini kilitliyor ve hatayı sayfanın en altında gösteriyordu.
  const [error, setError] = useState<{ section: Saved; message: string } | null>(null)
  const [saved, setSaved] = useState<Saved>(null)
  const [busy, setBusy] = useState<Saved>(null)
  const [, start] = useTransition()
  const router = useRouter()

  /** Bir bölümü kaydet — pending/saved/error yalnız o bölüme yazılır */
  function save(section: Exclude<Saved, null>, run: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null)
    setBusy(section)
    start(async () => {
      const res = await run()
      setBusy(null)
      if (!res.ok) return setError({ section, message: res.error ?? 'Bir hata oluştu' })
      setSaved(section)
      router.refresh()
      setTimeout(() => setSaved(null), 2500)
    })
  }

  /** Bölümün kaydet satırı — kaydedildi rozeti + hata + gönder düğmesi */
  function SaveRow({ section }: { section: Exclude<Saved, null> }) {
    return (
      <>
        {error?.section === section && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
            {error.message}
          </p>
        )}
        <div className="mt-5 flex items-center justify-end gap-3">
          {saved === section && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" /> Kaydedildi
            </span>
          )}
          <SubmitButton pending={busy === section}>Kaydet</SubmitButton>
        </div>
      </>
    )
  }

  const set = (k: keyof BusinessInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setB((prev) => ({ ...prev, [k]: e.target.value }))

  const setRate = (k: keyof TaxSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setTax((prev) => ({ ...prev, [k]: Number(e.target.value) }))

  const submit =
    (section: Exclude<Saved, null>, run: () => Promise<{ ok: boolean; error?: string }>) =>
    (e: React.FormEvent) => {
      e.preventDefault()
      save(section, run)
    }

  return (
    <div className="space-y-6">
      {/* İşletme kimliği — makbuz/fatura başlığı */}
      <form onSubmit={submit('business', () => saveBusinessInfo(b))} className="glass rounded-2xl p-5 sm:p-6">
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
          <Field label="İşletme / marka adı"><Input value={b.name} onChange={set('name')} placeholder="Derinay" required /></Field>
          <Field label="Ad Soyad"><Input value={b.owner} onChange={set('owner')} placeholder="Ad Soyad" required /></Field>
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

        <SaveRow section="business" />
      </form>

      {/* Vergi oranları — tüm hesaplamaları besler */}
      <form onSubmit={submit('tax', () => saveTaxSettings(tax))} className="glass rounded-2xl p-5 sm:p-6">
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

        <SaveRow section="tax" />
      </form>

      {/* Aylık gelir hedefi — dashboard ilerleme bandı */}
      <form onSubmit={submit('goal', () => saveIncomeGoal(goal))} className="glass rounded-2xl p-5 sm:p-6">
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

        <SaveRow section="goal" />
      </form>

      {/* Hatırlatma mesajı şablonu */}
      <form onSubmit={submit('reminder', () => saveReminderTemplate(tpl))} className="glass rounded-2xl p-5 sm:p-6">
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

        <SaveRow section="reminder" />
      </form>
    </div>
  )
}
