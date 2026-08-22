'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
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
  Hourglass,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP } from '@/lib/constants'
import { initials } from '@/lib/format'
import { BloomMark } from '@/components/brand/BloomMark'
import { PageTransition } from '@/components/dashboard/PageTransition'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
import { logoutAction } from '@/app/actions/auth'
import { clearAllNoteDrafts } from '@/hooks/useNoteDraft'

// Gruplu navigasyon — galeri katalogu gibi bölümlenmiş
const NAV_GROUPS = [
  {
    label: 'Klinik',
    items: [
      { label: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Ajanda', href: '/dashboard/agenda', icon: CalendarRange },
      { label: 'Danışanlar', href: '/dashboard/clients', icon: Users },
      { label: 'Bekleme Listesi', href: '/dashboard/waitlist', icon: Hourglass },
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

// Mobil alt sekme çubuğu — "galeri rafı": en sık kullanılan dört durak + menü.
// Aktif sekme çam mürekkebi alır, altında küçük altın nokta (galeri plaketi işareti).
const TAB_ITEMS = [
  { label: 'Genel', href: '/dashboard', icon: LayoutDashboard, match: ['/dashboard'] },
  { label: 'Ajanda', href: '/dashboard/agenda', icon: CalendarRange, match: ['/dashboard/agenda'] },
  { label: 'Danışan', href: '/dashboard/clients', icon: Users, match: ['/dashboard/clients', '/dashboard/waitlist'] },
  {
    label: 'Finans',
    href: '/dashboard/finances',
    icon: ArrowLeftRight,
    match: ['/dashboard/finances', '/dashboard/analytics', '/dashboard/invoices', '/dashboard/payments', '/dashboard/taxes'],
  },
] as const

function MobileTabBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname()
  const isActive = (item: (typeof TAB_ITEMS)[number]) =>
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : item.match.some((m) => pathname.startsWith(m))
  const anyTabActive = TAB_ITEMS.some(isActive)

  return (
    <nav
      aria-label="Alt gezinme"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-slate-500/10 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid grid-cols-5">
        {TAB_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-0.5 pb-2 pt-2.5 text-[10px] font-semibold transition-colors',
                active
                  ? 'text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 active:text-slate-700 dark:text-slate-400 dark:active:text-slate-200',
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 h-1 w-1 rounded-full transition-all',
                  active ? 'bg-amber-500' : 'bg-transparent',
                )}
              />
            </Link>
          )
        })}
        <button
          onClick={onOpenMenu}
          aria-label="Tüm menü"
          className={cn(
            'relative flex flex-col items-center gap-0.5 pb-2 pt-2.5 text-[10px] font-semibold transition-colors',
            !anyTabActive
              ? 'text-indigo-700 dark:text-indigo-300'
              : 'text-slate-500 active:text-slate-700 dark:text-slate-400 dark:active:text-slate-200',
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={1.8} />
          Menü
          <span
            aria-hidden
            className={cn('mt-0.5 h-1 w-1 rounded-full', !anyTabActive ? 'bg-amber-500' : 'bg-transparent')}
          />
        </button>
      </div>
    </nav>
  )
}

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
          {APP.name}
        </span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {APP.tagline}
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
                  aria-current={active ? 'page' : undefined}
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
/** Panel sahibi — Ayarlar → İşletme Kimliği'nden gelir (kodda sabit kişi adı yok) */
export type Owner = { name: string; title: string; isSet: boolean }

/** Sidebar/drawer kimlik kartı — masaüstü ve mobilde tek kaynak */
function OwnerCard({ owner, onNavigate, children }: { owner: Owner; onNavigate?: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        title="Kimlik Bilgilerini Düzenle"
        className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl transition-opacity hover:opacity-80"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-600 font-display text-xs font-bold text-white">
          {owner.isSet ? initials(owner.name) : <BloomMark className="h-4 w-4" />}
        </span>
        <div className="min-w-0 text-xs">
          <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
            {owner.isSet ? owner.name : 'Adını ekle'}
          </p>
          <p className="truncate text-slate-500 dark:text-slate-400">
            {owner.isSet ? owner.title : 'Ayarlar → İşletme Kimliği'}
          </p>
        </div>
      </Link>
      {children}
    </div>
  )
}

export function DashboardShell({
  children,
  clients = [],
  owner,
}: {
  children: React.ReactNode
  clients?: ClientLite[]
  owner: Owner
}) {
  const [open, setOpen] = useState(false)
  /**
   * Gizlilik modu iki katmanlı:
   *  - GÖRSEL katman: layout'taki engelleyici script `html.privacy` sınıfını daha
   *    ilk boyamadan önce koyar, bulanıklık saf CSS olduğu için hidrasyonu beklemez.
   *  - REACT katmanı: state SSR ile aynı değerle (false) başlar — DOM'dan okuyup
   *    başlatmak hidrasyon uyuşmazlığı üretirdi. Mount sonrası senkronlanır;
   *    yalnızca göz ikonu bir kare geç döner, veri hiçbir an açıkta kalmaz.
   */
  const [privacy, setPrivacy] = useState(false)
  const privacySynced = useRef(false)

  // Esc ile mobil menüyü kapat + arka plan kaydırmasını kilitle (modal davranışı)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
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

  // Kök sınıf — yalnızca .sensitive işaretli alanlar bulanır (globals.css).
  // İLK çalıştırmada sınıfa DOKUNMAZ: state henüz localStorage'dan okunmadan
  // toggle(false) çağırmak, script'in koyduğu sınıfı silip flaş yaratıyordu.
  useEffect(() => {
    if (!privacySynced.current) {
      privacySynced.current = true
      return
    }
    document.documentElement.classList.toggle('privacy', privacy)
  }, [privacy])

  // Panelden çıkarken sınıfı temizle (landing/login bulanık kalmasın)
  useEffect(() => () => document.documentElement.classList.remove('privacy'), [])

  const togglePrivacy = () =>
    setPrivacy((v) => {
      const next = !v
      localStorage.setItem('derinay:privacy', next ? '1' : '0')
      return next
    })

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen">
      {/* Klavye kullanıcısı için içeriğe atla — odaklanınca görünür */}
      <a
        href="#main-content"
        className="sr-only rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
      >
        İçeriğe Atla
      </a>

      {/* Desktop sidebar */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-500/10 px-5 pb-4 pt-6 lg:flex">
        {/* min-h-0 + overflow-y-auto: kısa ekranlarda (13" dizüstü) menü kesilmesin,
            alttaki kimlik kartı her zaman görünür kalsın */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
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
            <OwnerCard owner={owner} />

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <button
                onClick={togglePrivacy}
                aria-label="Gizlilik modu"
                aria-pressed={privacy}
                title="Gizlilik Modu (⌘⇧H)"
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
              <form action={logoutAction} onSubmit={clearAllNoteDrafts}>
                <button
                  type="submit"
                  aria-label="Çıkış yap"
                  title="Çıkış Yap"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-rose-500/40 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile topbar — safe-area (çentik) payı */}
      {/* Yükseklik çentik payını İÇERİR — sabit h-16 üstüne pt eklenince
          içerik kutusu eziliyor ve 40px marka damgası taşıyordu. */}
      <header className="glass sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between px-4 pt-[env(safe-area-inset-top)] lg:hidden">
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
            aria-pressed={privacy}
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
              role="dialog"
              aria-modal="true"
              aria-label="Gezinme menüsü"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="surface absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            >
              <div className="mb-8 flex items-center justify-between">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <NavList onNavigate={() => setOpen(false)} />
              </div>

              {/* Kullanıcı kartı + çıkış — masaüstü sidebar'daki kimlik bloğunun mobil hali */}
              <div className="mt-6 shrink-0">
                <div className="mb-3 flex items-center gap-3 px-2" aria-hidden>
                  <span className="h-px flex-1 bg-slate-500/15" />
                  <span className="text-[10px] text-amber-500/70">✦</span>
                  <span className="h-px flex-1 bg-slate-500/15" />
                </div>
                <div className="rounded-2xl border border-slate-500/10 bg-slate-500/[0.04] p-3">
                  <OwnerCard owner={owner} onNavigate={() => setOpen(false)}>
                    <form action={logoutAction} onSubmit={clearAllNoteDrafts}>
                      <button
                        type="submit"
                        aria-label="Çıkış yap"
                        title="Çıkış Yap"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-rose-500/40 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </form>
                  </OwnerCard>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette clients={clients} />

      {/* Content — mobilde alt sekme çubuğuna pay bırak */}
      <main id="main-content" tabIndex={-1} className="outline-none lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-10">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      <MobileTabBar onOpenMenu={() => setOpen(true)} />

      {/* Gizlilik modu göstergesi — mobilde tab bar'ın üstünde durur.
          Çekmece açıkken gizlenir: aksi halde z-[120] ile z-50'lik çekmecenin
          üstüne çıkıp menünün üzerinde yüzüyordu. */}
      {privacy && !open && (
        <button
          onClick={togglePrivacy}
          className="surface fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-xl dark:text-amber-300 lg:bottom-5"
        >
          <EyeOff className="h-4 w-4" /> Gizlilik açık — kimlikler gizli
        </button>
      )}
    </div>
    </MotionConfig>
  )
}
