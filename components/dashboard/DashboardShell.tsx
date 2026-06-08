'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileText,
  CreditCard,
  Landmark,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Danışanlar', href: '/dashboard/clients', icon: Users },
  { label: 'Gelir & Gider', href: '/dashboard/finances', icon: ArrowLeftRight },
  { label: 'Faturalar', href: '/dashboard/invoices', icon: FileText },
  { label: 'Ödemeler', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Vergiler', href: '/dashboard/taxes', icon: Landmark },
]

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 shadow-lg shadow-indigo-500/20">
        <span className="text-sm font-extrabold text-white">D</span>
      </div>
      <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Derinay</span>
    </Link>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
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
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-indigo-500/12 text-indigo-500 dark:text-indigo-300'
                : 'text-slate-500 hover:bg-slate-500/8 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-indigo-500 dark:text-indigo-300')} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Tema değiştir"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-indigo-500/40 hover:text-indigo-400 dark:text-slate-400"
    >
      {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
    </button>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-500/10 p-5 lg:flex">
        <div className="mb-8">
          <Brand />
        </div>
        <NavList />
        <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-500/10 p-3">
          <div className="text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-200">Dr. Klinik</p>
            <p className="text-slate-500 dark:text-slate-400">Pratik yönetimi</p>
          </div>
          <ThemeToggle />
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
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden"
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
