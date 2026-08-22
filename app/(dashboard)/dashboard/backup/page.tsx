import {
  Users,
  CalendarCheck2,
  StickyNote,
  ArrowLeftRight,
  FileText,
  CreditCard,
  DatabaseBackup,
  Download,
  ShieldCheck,
  Package,
  Activity,
  Paperclip,
  Target,
  Hourglass,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { RestoreCard } from '@/components/backup/RestoreCard'
import { getLastBackup } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Yedekleme' }

const CSV_EXPORTS = [
  { type: 'clients', label: 'Danışanlar', desc: 'İsim, iletişim, statü, ücret, etiketler', icon: Users, tone: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
  { type: 'sessions', label: 'Seanslar', desc: 'Tarih, süre, durum, ücret', icon: CalendarCheck2, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
  { type: 'notes', label: 'Seans Defteri', desc: 'Notlar, türler, duygu kayıtları', icon: StickyNote, tone: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { type: 'transactions', label: 'Gelir & Gider', desc: 'Tüm finansal hareketler', icon: ArrowLeftRight, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'invoices', label: 'Makbuzlar', desc: 'Numara, brüt, stopaj, KDV, durum', icon: FileText, tone: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { type: 'payments', label: 'Ödemeler', desc: 'Tahsilatlar ve yöntemler', icon: CreditCard, tone: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
  { type: 'packages', label: 'Seans Paketleri', desc: 'Ön ödemeli paketler ve tutarlar', icon: Package, tone: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
  { type: 'scores', label: 'İlerleme Ölçümleri', desc: 'Ölçek puanları ve tarihler', icon: Activity, tone: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { type: 'documents', label: 'Belge Bağlantıları', desc: 'Onam, test ve rapor referansları', icon: Paperclip, tone: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { type: 'goals', label: 'Tedavi Hedefleri', desc: 'Hedefler, durumları ve tamamlanma tarihleri', icon: Target, tone: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
  { type: 'waitlist', label: 'Bekleme Listesi', desc: 'Başvuru adayları, kaynak ve öncelik', icon: Hourglass, tone: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
] as const

export default async function BackupPage() {
  const lastBackup = await getLastBackup()
  return (
    <>
      <PageHeader
        title="Yedekleme"
        subtitle="Verilerin senin — istediğin an indir, güvende hisset"
        action={
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold',
              lastBackup.daysAgo === null
                ? 'bg-rose-500/12 text-rose-700 dark:text-rose-300'
                : lastBackup.daysAgo >= 14
                  ? 'bg-amber-500/12 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {lastBackup.daysAgo === null
              ? 'Henüz tam yedek alınmadı'
              : lastBackup.daysAgo === 0
                ? 'Son yedek: bugün'
                : `Son yedek: ${lastBackup.daysAgo} gün önce`}
          </span>
        }
      />

      {/* Tam yedek */}
      <a
        href="/api/export?type=json"
        className="glass group mb-6 flex items-center gap-4 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-400">
          <DatabaseBackup className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Tam Yedek (JSON)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tüm tabloların eksiksiz kopyası — danışanlar, seanslar, notlar, finans, makbuzlar, ödemeler,
            paketler, ölçümler, belgeler, hedefler, bekleme listesi ve ayarlar
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all group-hover:bg-indigo-500">
          <Download className="h-4 w-4" /> İndir
        </span>
      </a>

      {/* CSV'ler */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
        Tablo Bazlı CSV (Excel Uyumlu)
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CSV_EXPORTS.map((e) => (
          <a
            key={e.type}
            href={`/api/export?type=${e.type}`}
            className="glass group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${e.bg} ${e.tone}`}>
              <e.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{e.label}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{e.desc}</p>
            </div>
            <Download className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400" />
          </a>
        ))}
      </div>

      {/* Geri yükleme — tehlikeli bölge */}
      <div className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
          Geri Yükleme
        </h2>
        <RestoreCard />
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-slate-500/15 bg-slate-500/[0.04] p-4 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <p>
          Dosyalar yalnızca giriş yapmış kullanıcıya sunulur ve tarayıcına doğrudan iner — hiçbir yere
          yüklenmez. Düzenli aralıklarla tam yedek almanı öneririz. CSV&apos;ler Excel&apos;in Türkçe
          sürümüyle uyumludur (UTF-8 BOM + noktalı virgül).
        </p>
      </div>
    </>
  )
}
