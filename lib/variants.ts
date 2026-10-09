/**
 * Framer Motion Animasyon Varyantları
 * Kaynak: @ahmetakyapi/ui — tüm projelerde ortak
 */

export const EASE = [0.22, 1, 0.36, 1] as const

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
}

export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const fadeUpLarge = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

export const fadeLeft = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: EASE } },
}

export const staggerContainer = (stagger = 0.12) => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: stagger } },
})

export const slideDown = {
  hidden:  { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.2, ease: EASE } },
  exit:    { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } },
}

export const modalBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

// Aşağıdan yükselerek belirir — mobil bottom-sheet ve masaüstü kartın ortak dili
// Yay ile oturur: kâğıt masaya bırakılmış gibi hafif bir esneme
export const modalPanel = {
  hidden:  { opacity: 0, scale: 0.96, y: 40 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 } },
  exit:    { opacity: 0, scale: 0.97, y: 24, transition: { duration: 0.2, ease: EASE } },
}

/**
 * Fırça sürüşü — soldan sağa boyanır. Manşetin kendi stagger'ı içinde çalışır,
 * yani AYRI bir efekt değil; aynı anın parçası. `scaleX` kullanılır çünkü
 * clip-path animasyonu Safari'de fırça kenarında titriyor.
 */
export const brushWipe = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.75, delay: 0.15, ease: EASE },
  },
}

/* ════════════════════════════════════════════════════════════════════════
   Hareket sistemi v2 — "Atölye Sahnesi"
   Ödüllü editoryal sitelerin dili: maskeden yükselen satırlar, perde
   geçişleri, kaydırmaya bağlı sahneler. İki eğri yeter:
     EASE_OUT_EXPO — içeri giren her şey (yumuşak iniş)
     EASE_IN_OUT   — perde, örtü, sahne değişimi (ağır başlar, ağır biter)
   ════════════════════════════════════════════════════════════════════════ */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const

/** Maskeden yükselen satır/kelime — kapsayıcı `overflow-hidden` olmalı */
export const maskUp = {
  hidden:  { y: '110%' },
  visible: { y: '0%', transition: { duration: 1, ease: EASE_OUT_EXPO } },
}

/** Aşağıdan yukarı açılan perde (clip-path) — görsel kesitlerin girişi */
export const clipUp = {
  hidden:  { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.2, ease: EASE_IN_OUT } },
}

/** Saç çizgisi soldan çizilir */
export const lineDraw = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE_IN_OUT } },
}
