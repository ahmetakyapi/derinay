import { BrushPull } from '@/components/brand/Brush'
import { cn } from '@/lib/utils'

/**
 * Sayfa başlığı — galeri plaketi düzeni.
 *
 * TASARIM NOTU (neden böyle):
 *  - Başlığın solunda tam yükseklikte bir MÜREKKEP ÇEKİŞİ duruyor: üstte ıslak
 *    ve kalın, aşağı indikçe kuruyup incelen bir fırça darbesi. Eski jest,
 *    başlığın ALTINA çizilen 2.8px'lik yuvarlak uçlu bir yoldu — kırık bir
 *    alt çizgi gibi okunuyordu ve grotesk'in yanında amatör duruyordu.
 *    Aynı el izi burada YAPIYA dönüşür: metin bloğunun yüksekliğini işaretler,
 *    her sayfada aynı yerde durur, hiçbir şeyin altını çizmez.
 *  - `eyebrow` (KLİNİK/FİNANS/YAŞAM) KALDIRILDI: kenar çubuğundaki grup adını
 *    birebir tekrar ediyordu ve başlığın kendi ağırlığını çalıyordu. Gerçek
 *    bilgi taşıyan satır (tarih, sayım) `subtitle`'a iner.
 *  - Hiyerarşi yalnız punto + ağırlık + tracking ile kurulur.
 */
export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex min-w-0 gap-3.5 sm:gap-4">
        <BrushPull className="brush-draw mt-1 w-[7px] shrink-0 self-stretch text-slate-900/80 dark:text-white/70" />
        <div className="min-w-0">
          {/* Başlık maskeden yükselir, fırça yukarıdan aşağı boyanır, alt satır
              ardından gelir — saf CSS (Server Component), bkz. globals.css */}
          <h1 className="title-mask font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.045em] text-slate-900 dark:text-white sm:text-[2.5rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="subtitle-rise mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="subtitle-rise shrink-0 sm:pt-1">{action}</div>}
    </div>
  )
}
