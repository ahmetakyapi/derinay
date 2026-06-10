'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  LineChart,
  CalendarRange,
  DatabaseBackup,
  Users,
  ArrowLeftRight,
  CalendarDays,
  FileText,
  CreditCard,
  Landmark,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { USER } from '@/lib/constants'
import { PageTransition } from '@/components/dashboard/PageTransition'
import { logoutAction } from '@/app/actions/auth'

// Gruplu navigasyon — galeri katalogu gibi bölümlenmiş
const NAV_GROUPS = [
  {
    label: 'Klinik',
    items: [
      { label: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Ajanda', href: '/dashboard/agenda', icon: CalendarRange },
      { label: 'Danışanlar', href: '/dashboard/clients', icon: Users },
    ],
  },
  {
    label: 'Finans',
    items: [
      { label: 'Gelir & Gider', href: '/dashboard/finances', icon: ArrowLeftRight },
      { label: 'Analiz', href: '/dashboard/analytics', icon: LineChart },
      { label: 'Faturalar', href: '/dashboard/invoices', icon: FileText },
      { label: 'Ödemeler', href: '/dashboard/payments', icon: CreditCard },
      { label: 'Vergiler', href: '/dashboard/taxes', icon: Landmark },
    ],
  },
  {
    label: 'Yaşam',
    items: [
      { label: 'Kişisel', href: '/dashboard/personal', icon: CalendarDays },
      { label: 'Yedekleme', href: '/dashboard/backup', icon: DatabaseBackup },
    ],
  },
]

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      {/* Mürekkep damgası — serif monogram + altın nokta */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:rotate-3 dark:bg-slate-50">
        <span className="font-display text-lg font-semibold italic text-amber-50 dark:text-slate-900">D</span>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-[var(--bg)]" />
      </div>
      <div className="leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          Derinay
        </span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Atölye
        </span>
      </div>
    </Link>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400/80">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-500/8 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-amber-500" />
                  )}
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110',
                      active && 'text-indigo-600 dark:text-indigo-300',
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === 'dark' : false

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Tema değiştir"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-amber-500/50 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
    >
      {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
    </button>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // Esc ile mobil menüyü kapat (modallar kendi içinde hallediyor)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-500/10 p-5 lg:flex">
        <div className="mb-8">
          <Brand />
        </div>
        <NavList />
        <div className="mt-auto flex items-center justify-between gap-2 rounded-2xl border border-slate-500/10 bg-slate-500/[0.04] p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 font-display text-xs font-semibold italic text-white">
              SA
            </span>
            <div className="min-w-0 text-xs">
              <p className="truncate font-semibold text-slate-700 dark:text-slate-200">{USER.fullName}</p>
              <p className="truncate text-slate-500 dark:text-slate-400">{USER.title}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Çıkış yap"
                title="Çıkış yap"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-rose-500/50 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Menü"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="surface absolute inset-y-0 left-0 flex w-72 flex-col p-5"
            >
              <div className="mb-8 flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
