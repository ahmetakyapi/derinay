'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CalendarPlus, ArrowLeftRight, ChevronDown } from 'lucide-react'
import { NewSessionDialog } from '@/components/forms/NewSessionDialog'
import { NewTransactionDialog } from '@/components/forms/NewTransactionDialog'
import { EASE } from '@/lib/variants'

type Dialog = 'session' | 'tx' | null

/**
 * Tek "Ekle" düğmesi — açılır menüden seans veya gelir/gider eklenir.
 * Dashboard başlığındaki iki ayrı düğmenin yerini alır.
 */
export function QuickAddMenu({
  clients,
}: {
  clients: { id: string; name: string; sessionFee: number }[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const items = [
    { key: 'session' as const, label: 'Yeni Seans', hint: 'Planla veya geçmiş seans', icon: CalendarPlus, tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/12' },
    { key: 'tx' as const, label: 'Gelir / Gider', hint: 'Finans hareketi ekle', icon: ArrowLeftRight, tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/12' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
      >
        <Plus className="h-4 w-4" /> Ekle
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            /* role="menu" ok tuşu gezinmesi + odak yönetimi zorunlu kılar;
               burada ikisi de yok. Basit açılır liste olarak bırakılıyor. */
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="surface absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl p-1.5 shadow-xl"
          >
            {items.map((it) => (
              <button
                key={it.key}
                onClick={() => {
                  setMenuOpen(false)
                  setDialog(it.key)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-500/[0.07]"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${it.tone}`}>
                  <it.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{it.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{it.hint}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modallar — menüden tetiklenir, kendi tetikleyici düğmeleri gizli */}
      <NewSessionDialog
        clients={clients}
        hideTrigger
        open={dialog === 'session'}
        onOpenChange={(v) => !v && setDialog(null)}
      />
      <NewTransactionDialog
        clients={clients}
        hideTrigger
        open={dialog === 'tx'}
        onOpenChange={(v) => !v && setDialog(null)}
      />
    </div>
  )
}
