'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Özellikler', href: '#features' },
  { label: 'Nasıl çalışır', href: '#how' },
]

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => {
    setMounted(true)
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const isDark = mounted ? resolvedTheme === 'dark' : true

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-300 ${
          scrolled ? 'glass shadow-xl shadow-black/10' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 shadow-lg shadow-indigo-500/20 transition-shadow group-hover:shadow-indigo-500/40">
                <span className="text-sm font-extrabold tracking-tight text-white">D</span>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-800 transition-colors group-hover:text-indigo-500 dark:text-slate-100 dark:group-hover:text-indigo-400">
                Derinay
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Tema değiştir"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/20 text-slate-500 transition-all hover:border-indigo-500/50 hover:text-indigo-400 dark:text-slate-400"
            >
              {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </button>

            <Link
              href="/dashboard"
              className="hidden rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 sm:inline-flex"
            >
              Panele git
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menü"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-slate-100 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface fixed inset-x-4 top-20 z-40 rounded-2xl p-4 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-500/10 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Panele git
          </Link>
        </motion.div>
      )}
    </>
  )
}
