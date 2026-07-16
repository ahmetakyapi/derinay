import Link from 'next/link'
import { LayoutDashboard, ArrowLeft } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'

export const metadata = { title: 'Sayfa bulunamadı' }

/** 404 — galeri dilinde: "bu duvarda böyle bir eser yok". */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="surface w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
        <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20 dark:bg-slate-50">
          <BloomMark className="h-8 w-8 text-amber-50 dark:text-slate-900" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-[var(--bg)]" />
        </div>
        <p className="mb-1.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/90 dark:text-amber-400/90">
          <span aria-hidden className="text-amber-500/70">✦</span> 404
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Bu duvarda böyle bir eser yok
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
          >
            <LayoutDashboard className="h-4 w-4" /> Panele dön
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-500/20 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/40 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" /> Ana sayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
