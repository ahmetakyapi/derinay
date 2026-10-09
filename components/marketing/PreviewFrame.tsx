import { cn } from '@/lib/utils'

/**
 * Landing'deki panel kesitlerinin ortak çerçevesi — cam kâğıt + galeri plaketi.
 *
 * Tek yerde durur ki hero'daki geniş panel ile sahnelerdeki dar kesitler AYNI
 * çerçeveyi paylaşsın; ziyaretçi ikinci kez gördüğünde "aynı ürün" der.
 *
 * TASARIM NOTU (neden plaket, neden pencere değil):
 *  - Eski çerçevenin tepesinde kırmızı/sarı/yeşil üç nokta vardı: macOS pencere
 *    şeridi. İki sorunu vardı. (1) Her tanıtım sayfasında görülen hazır kalıp;
 *    Atölye dilinin değil, şablonun işareti. (2) Küçük bir yalan — Derinay bir
 *    masaüstü uygulaması değil, o şerit hiçbir yerde yok.
 *  - Yerine GALERİ PLAKETİ geldi: kesit temiz durur, künye altına iner. Müzede
 *    etiket eserin yanındadır, üstünde değil. Sans, normal harf aralığı,
 *    13px — sessiz ama okunur (eski 10px geniş aralıklı mono okunmuyordu, Ekim 2026).
 *  - "örnek veri" damgası ARTIK ÇERÇEVENİN İÇİNDE. Eskiden yalnız hero'nun
 *    altında ayrı bir cümle olarak duruyordu; seans defteri ve makbuz kesitleri
 *    de uydurma isim ve tutar gösterdiği halde damgasızdı. Künye çerçeveye
 *    bağlanınca uyarı, uydurmanın olduğu yerde durur — üç kesitte de.
 *
 * Türkçe notu: `uppercase` KULLANILMAZ. Title Case plaket hem daha sessiz
 * okunur hem de i → I dönüşümü riskini tümüyle ortadan kaldırır (bkz. CLAUDE.md §7).
 *
 * Renk `text-slate-500 dark:text-slate-400`; tek başına `text-slate-400` DEĞİL.
 * Ölçüldü: slate-400 fildişi kâğıt üstünde 2.87:1, yani AA'nın (4.5:1) çok
 * altında. Bu ikili açıkta 4.77:1, koyuda 6.29:1 verir (bkz. CLAUDE.md §7).
 */
export function PreviewFrame({
  caption,
  children,
  className,
}: {
  /** Plaketteki mono künye — hangi ekranı gösterdiğini söyler */
  caption: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <figure className={cn('m-0', className)}>
      <div className="glass overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50">
        <div className="overflow-hidden rounded-xl bg-[rgba(var(--paper),0.35)]">{children}</div>
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-6 border-t border-slate-500/15 pt-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-400">
        <span className="truncate">{caption}</span>
        <span className="shrink-0">Örnek Veri</span>
      </figcaption>
    </figure>
  )
}
