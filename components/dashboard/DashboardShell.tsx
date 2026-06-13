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
  Settings,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { USER } from '@/lib/constants'
import { BloomMark } from '@/components/brand/BloomMark'
import { PageTransition } from '@/components/dashboard/PageTransition'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
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
      { label: 'Makbuzlar', href: '/dashboard/invoices', icon: FileText },
      { label: 'Ödemeler', href: '/dashboard/payments', icon: CreditCard },
      { label: 'Vergiler', href: '/dashboard/taxes', icon: Landmark },
    ],
  },
  {
    label: 'Yaşam',
    items: [
      { label: 'Kişisel', href: '/dashboard/personal', icon: CalendarDays },
      { label: 'Yedekleme', href: '/dashboard/backup', icon: DatabaseBackup },
      { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

function Brand() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      {/* Mürekkep damgası — orkide işareti + altın nokta */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-900/20 transition-transform duration-300 group-hover:rotate-3 dark:bg-slate-50">
        <BloomMark className="h-[22px] w-[22px] text-amber-50 transition-transform duration-500 group-hover:rotate-[72deg] dark:text-slate-900" />
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
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400/80">
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
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
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

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme === 'dark' : false

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Tema değiştir"
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-amber-500/50 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400',
        className,
      )}
    >
      {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
    </button>
  )
}

type ClientLite = { id: string; name: string; colorTag: string; avatarUrl: string | null }

export function DashboardShell({ children, clients = [] }: { children: React.ReactNode; clients?: ClientLite[] }) {
  const [open, setOpen] = useState(false)
  const [privacy, setPrivacy] = useState(false)

  // Esc ile mobil menüyü kapat (modallar kendi içinde hallediyor)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Gizlilik (odak) modu — son tercihi hatırla + ⌘/Ctrl+Shift+H kısayolu
  useEffect(() => {
    setPrivacy(localStorage.getItem('derinay:privacy') === '1')
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setPrivacy((v) => {
          const next = !v
          localStorage.setItem('derinay:privacy', next ? '1' : '0')
          return next
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Kök sınıf — yalnızca .sensitive işaretli alanlar bulanır (globals.css)
  useEffect(() => {
    document.documentElement.classList.toggle('privacy', privacy)
    return () => document.documentElement.classList.remove('privacy')
  }, [privacy])

  const togglePrivacy = () =>
    setPrivacy((v) => {
      const next = !v
      localStorage.setItem('derinay:privacy', next ? '1' : '0')
      return next
    })

  return (
    <div className="min-h-screen">
      {/* Klavye kullanıcısı için içeriğe atla — odaklanınca görünür */}
      <a
        href="#main-content"
        className="sr-only rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        İçeriğe atla
      </a>

      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-500/10 px-5 pb-4 pt-6 lg:flex">
        <div className="flex-1 pr-1">
          <div className="mb-5">
            <Brand />
          </div>
          {/* Komut paleti tetikleyici */}
          <button
            onClick={() => window.dispatchEvent(new Event('derinay:open-command'))}
            className="mb-4 flex w-full items-center gap-2.5 rounded-xl border border-slate-500/15 bg-slate-500/[0.03] px-3 py-2 text-sm text-slate-400 transition-colors hover:border-indigo-500/30 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Ara…</span>
            <kbd className="rounded-md border border-slate-500/20 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <NavList />
        </div>
        <div className="shrink-0 pt-3">
          {/* Galeri ayracı */}
          <div className="mb-3 flex items-center gap-3 px-2" aria-hidden>
            <span className="h-px flex-1 bg-slate-500/15" />
            <span className="text-[10px] text-amber-500/70">✦</span>
            <span className="h-px flex-1 bg-slate-500/15" />
          </div>
          <div className="rounded-2xl border border-slate-500/10 bg-slate-500/[0.04] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 font-display text-xs font-semibold italic text-white">
                  SA
                </span>
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold text-slate-700 dark:text-slate-200">{USER.fullName}</p>
                  <p className="truncate text-slate-500 dark:text-slate-400">{USER.title}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <button
                onClick={togglePrivacy}
                aria-label="Gizlilik modu"
                title="Gizlilik modu (⌘⇧H)"
                className={cn(
                  'flex h-10 items-center justify-center rounded-xl border transition-all',
                  privacy
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-slate-500/20 text-slate-500 hover:border-amber-500/50 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400',
                )}
              >
                {privacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <div>
                <ThemeToggle className="h-10 w-full" />
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Çıkış yap"
                  title="Çıkış yap"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-rose-500/40 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('derinay:open-command'))}
            aria-label="Ara"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={togglePrivacy}
            aria-label="Gizlilik modu"
            className={cn('flex h-9 w-9 items-center justify-center rounded-xl', privacy ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400')}
          >
            {privacy ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
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

      <CommandPalette clients={clients} />

      {/* Content */}
      <main id="main-content" tabIndex={-1} className="outline-none lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Gizlilik modu göstergesi — kimlikler gizliyken geri açmak için */}
      {privacy && (
        <button
          onClick={togglePrivacy}
          className="surface fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-xl dark:text-amber-300"
        >
          <EyeOff className="h-4 w-4" /> Gizlilik açık — kimlikler gizli
        </button>
      )}
    </div>
  )
}
