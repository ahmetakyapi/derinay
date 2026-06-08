'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { EASE } from '@/lib/variants'

/** Rotalar arası yumuşak içerik geçişi. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
