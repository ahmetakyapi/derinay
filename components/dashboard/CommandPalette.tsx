'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, CalendarRange, Users, ArrowLeftRight, LineChart,
  FileText, CreditCard, Landmark, CalendarDays, DatabaseBackup, Settings, CornerDownLeft, Hourglass,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { EASE } from '@/lib/variants'
import { cn } from '@/lib/utils'

type ClientLite = { id: string; name: string; colorTag: string; avatarUrl: string | null }
type Cmd = { label: string; href: string; group: string; icon: typeof Search; keywords?: string }
type Entry = { key: string; label: string; href: string; group: string; icon: typeof Search; client: ClientLite | null }

const COMMANDS: Cmd[] = [
  { label: 'Genel Bakış', href: '/dashboard', group: 'Klinik', icon: LayoutDashboard, keywords: 'ana sayfa dashboard özet' },
  { label: 'Ajanda', href: '/dashboard/agenda', group: 'Klinik', icon: CalendarRange, keywords: 'takvim seans randevu' },
  { label: 'Danışanlar', href: '/dashboard/clients', group: 'Klinik', icon: Users, keywords: 'hasta client kişi' },
  { label: 'Bekleme Listesi', href: '/dashboard/waitlist', group: 'Klinik', icon: Hourglass, keywords: 'başvuru aday waitlist sıra' },
  { label: 'Gelir & Gider', href: '/dashboard/finances', group: 'Finans', icon: ArrowLeftRight, keywords: 'işlem transaction para' },
  { label: 'Analiz', href: '/dashboard/analytics', group: 'Finans', icon: LineChart, keywords: 'rapor grafik istatistik' },
  { label: 'Makbuzlar', href: '/dashboard/invoices', group: 'Finans', icon: FileText, keywords: 'fatura makbuz kdv stopaj' },
  { label: 'Ödemeler', href: '/dashboard/payments', group: 'Finans', icon: CreditCard, keywords: 'tahsilat nakit kart' },
  { label: 'Vergiler', href: '/dashboard/taxes', group: 'Finans', icon: Landmark, keywords: 'kdv gelir vergisi' },
  { label: 'Kişisel', href: '/dashboard/personal', group: 'Yaşam', icon: CalendarDays, keywords: 'harcama günlük' },
  { label: 'Yedekleme', href: '/dashboard/backup', group: 'Yaşam', icon: DatabaseBackup, keywords: 'export csv json' },
  { label: 'Ayarlar', href: '/dashboard/settings', group: 'Yaşam', icon: Settings, keywords: 'işletme makbuz bilgi hatırlatma' },
]

const trLower = (s: string) => s.toLocaleLowerCase('tr')

export function CommandPalette({ clients = [] }: { clients?: ClientLite[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  // ⌘K / Ctrl+K global kısayolu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('derinay:open-command', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('derinay:open-command', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    const t = setTimeout(() => inputRef.current?.focus(), 40)
    // Açan öğeye odağı geri ver + arka plan kaydırmasını kilitle (modal davranışı)
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [open])

  const results = useMemo<Entry[]>(() => {
    const q = trLower(query.trim())
    const pages: Entry[] = (q
      ? COMMANDS.filter((c) => trLower(c.label + ' ' + (c.keywords ?? '') + ' ' + c.group).includes(q))
      : COMMANDS
    ).map((c) => ({ key: c.href, label: c.label, href: c.href, group: c.group, icon: c.icon, client: null }))
    const cl: Entry[] = q
      ? clients
          .filter((c) => trLower(c.name).includes(q))
          .slice(0, 8)
          .map((c) => ({ key: `c-${c.id}`, label: c.name, href: `/dashboard/clients/${c.id}`, group: 'Danışan', icon: Users, client: c }))
      : []
    return [...pages, ...cl]
  }, [query, clients])

  useEffect(() => {
    if (active >= results.length) setActive(0)
  }, [results, active])

  // Ok tuşuyla gezinirken seçili satır görünür alanın dışına kayabiliyordu
  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[active]; if (r) go(r.href) }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh] backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Komut paleti"
            className="surface w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* Arama */}
            <div className="flex items-center gap-3 border-b border-slate-500/10 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Sayfa veya danışan ara…"
                aria-label="Sayfa veya danışan ara"
                role="combobox"
                aria-expanded
                aria-controls="cmdk-list"
                aria-activedescendant={results[active] ? `cmdk-${results[active].key}` : undefined}
                autoComplete="off"
                className="w-full bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <kbd className="hidden shrink-0 rounded-md border border-slate-500/20 px-1.5 py-0.5 font-mono text-xs text-slate-500 dark:text-slate-400 sm:block">ESC</kbd>
            </div>

            {/* Sonuçlar */}
            <div id="cmdk-list" role="listbox" aria-label="Sonuçlar" className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-400">Sonuç yok</p>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.key}
                    id={`cmdk-${r.key}`}
                    role="option"
                    aria-selected={i === active}
                    ref={i === active ? activeRef : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      i === active ? 'bg-indigo-500/10' : 'hover:bg-slate-500/[0.05]',
                    )}
                  >
                    {r.client ? (
                      <Avatar name={r.client.name} color={r.client.colorTag} src={r.client.avatarUrl} size="sm" />
                    ) : (
                      <span className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        i === active ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300' : 'bg-slate-500/8 text-slate-500 dark:text-slate-400',
                      )}>
                        <r.icon className="h-4 w-4" />
                      </span>
                    )}
                    <span className={cn('flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100', r.client && 'sensitive')}>{r.label}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{r.group}</span>
                    {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
