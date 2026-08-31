'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, LayoutDashboard } from 'lucide-react'
import { BloomMark } from '@/components/brand/BloomMark'

/**
 * Uygulama geneli hata sınırı — production'da beklenmedik bir hata (ör. anlık
 * DB kesintisi) olduğunda Next'in İngilizce/temasız ekranı yerine Atölye
 * dilinde sakin bir kart gösterir. "Tekrar dene" segment'i yeniden render eder.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Vercel log'larında görünsün — kullanıcıya stack sızdırılmaz
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="surface w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
        <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20 dark:bg-slate-50">
          <BloomMark className="h-8 w-8 text-amber-50 dark:text-slate-900" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-[var(--bg)]" />
        </div>
        {/* Üstteki "Beklenmedik bir aksama" etiketi KALDIRILDI: başlığın
            söylediğini ikinci kez söylüyordu ve dekoratif ✦ işareti taşıyordu.
            Hata ekranında her öğe tek iş yapar. */}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Bir şeyler ters gitti
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Geçici bir sorun olabilir. Tekrar denemek çoğu zaman yeterlidir.
          {error.digest && (
            <span className="mt-1 block font-mono text-xs text-slate-500 dark:text-slate-400">kod: {error.digest}</span>
          )}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" /> Tekrar Dene
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-500/20 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/40 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <LayoutDashboard className="h-4 w-4" /> Panele Dön
          </Link>
        </div>
      </div>
    </main>
  )
}
