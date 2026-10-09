'use client'

import { usePathname } from 'next/navigation'

/**
 * Rotalar arası içerik geçişi.
 *
 * Kap her yol adında yeniden kurulur (`key`), sayfanın ÜST DÜZEY blokları
 * (başlık, KPI şeridi, kartlar…) `.page-enter` ile sırayla yükselir —
 * bkz. globals.css "Panel sayfa girişi". Saf CSS: Framer'a sayfa başına
 * düzinelerce hareket değeri kurdurmaktan ucuz, ve dolgu `backwards`
 * olduğu için bitince hiçbir transform geride kalmaz.
 *
 * Tepedeki mürekkep çizgisi ayrı: RouteTransition (kök layout).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
