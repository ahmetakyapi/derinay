'use client'

import { motion, type Variant as MotionVariant } from 'framer-motion'
import { EASE_IN_OUT, EASE_OUT_EXPO } from '@/lib/variants'

type Variant = 'up' | 'clip' | 'scale' | 'fade'

const VARIANTS: Record<Variant, { hidden: MotionVariant; visible: MotionVariant & { transition: object } }> = {
  up: {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
  },
  // Görsel kesitler perde gibi aşağıdan açılır
  clip: {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)', y: 60 },
    // Son durum EKSİ pay: inset(0) gölgeyi ve künyeyi kenardan keserdi
    visible: { clipPath: 'inset(-12% -12% -12% -12%)', y: 0, transition: { duration: 1.3, ease: EASE_IN_OUT } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2, ease: EASE_OUT_EXPO } },
  },
}

/**
 * Görünüme girince bir kez oynayan sarmalayıcı. Kesitler `clip`, metin
 * blokları `up` kullanır. `delay` aynı satırdaki öğeleri kademelendirir.
 */
export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  variant?: Variant
  delay?: number
  as?: 'div' | 'li' | 'section' | 'figure' | 'p'
}) {
  const Comp = motion[as] as typeof motion.div
  const v = VARIANTS[variant]
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{
        hidden: v.hidden,
        visible: { ...v.visible, transition: { ...v.visible.transition, delay } },
      }}
    >
      {children}
    </Comp>
  )
}
