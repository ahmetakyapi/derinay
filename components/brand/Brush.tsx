/**
 * Fırça jestleri — Atölye kimliğinin el izi.
 *
 * TASARIM NOTU: Eski fırça, 2.8px yuvarlak uçlu tek bir `stroke` yoluydu; bu bir
 * ÇİZGİydi, fırça değil. Grotesk'e geçince de yetim kaldı. Buradaki iki jest
 * DOLGU (fill) geometrisidir: eni boyunca değişen, uçları yontulmuş, kenarı
 * hafif düzensiz — yani boyanmış görünür.
 *
 * Renk `currentColor`'dan gelir; çağıran `text-amber-500/…` gibi bir token verir.
 * İkisi de `aria-hidden`: anlam taşımaz, yalnız kimlik taşır.
 */

/**
 * Yatay boya sürüşü — bir KELİMENİN ARKASINA, taban hizasına konur.
 * Altı çizili gibi değil, üstünden geçilmiş boya gibi okunur; bu yüzden
 * kelimenin alt yarısını kaplar ve iki uçtan biraz taşar.
 */
export function BrushSweep({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 64"
      preserveAspectRatio="none"
      className={className}
      fill="currentColor"
    >
      {/* Ana sürüş */}
      <path
        d="M4 40C22 22 62 12 118 15C172 18 218 24 262 15C288 10 306 12 318 18L315 39C298 34 282 39 264 43C240 49 208 54 170 51C124 47 82 56 42 58C26 59 12 56 2 51Z"
        opacity="0.62"
      />
      {/* Kuru fırça — boyanın seyreldiği alt kenar */}
      <path
        d="M44 46C90 51 140 49 186 46C232 43 268 40 304 33L305 38C268 46 232 49 186 52C138 55 88 56 42 51Z"
        opacity="0.4"
      />
    </svg>
  )
}

/**
 * Dikey mürekkep çekişi — sayfa başlığının solunda, metin bloğu boyunca.
 * Üstte ıslak ve kalın, aşağı indikçe kuruyup incelir.
 * `preserveAspectRatio="none"` ile blok yüksekliği kadar uzar; en değişimi
 * yatayda oranını koruduğu için her yükseklikte fırça karakteri kalır.
 */
export function BrushPull({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 100"
      preserveAspectRatio="none"
      className={className}
      fill="currentColor"
    >
      <path d="M6.2 0C8.4 8 9 20 8.2 33C7.5 45 8.6 57 7.6 69C6.8 79 5.4 88 4.1 97C3.8 99 3.5 100 3.2 100L1.4 94C2.6 82 3.6 70 3 58C2.4 46 1 32 2 20C2.8 10 4.2 4 6.2 0Z" />
    </svg>
  )
}
