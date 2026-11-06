'use client'

import { LazyMotion } from 'motion/react'

/**
 * Hareket özellikleri GECİKMELİ yüklenir (dev-starter guides/04 §1).
 *
 * Bileşenler `motion.*` değil `m.*` kullanır; animasyon/jest/düzen
 * özellikleri (`domMax` — panelde `layoutId` var) ayrı bir parçada, ilk
 * boyamadan SONRA iner. Eskiden tam `motion` paketi (~130 KB ham) ilk JS'in
 * içindeydi ve telefonda hidrasyonu uzatıyordu. `strict`: gözden kaçan bir
 * `motion.div` geliştirmede hemen hata verir.
 *
 * Özellikler inene kadar `m.*` öğeleri `initial` hâlinde durur; o yüzden
 * ilk ekranda görünmesi ŞART olan şey (kahraman başlığı, kabuk) CSS ile girer.
 */
const loadFeatures = () => import('./motion-features').then((mod) => mod.default)

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
