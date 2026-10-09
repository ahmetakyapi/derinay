'use client'

import { useState, useTransition } from 'react'
import { ArrowRight, Loader2, Lock, TriangleAlert } from 'lucide-react'

/**
 * Giriş formu.
 *
 * Neden istemci bileşeni: `authorize` yanlış parolada BİLEREK 800ms bekletir
 * (otomatik deneme caydırıcısı). Düz bir `<form action>` ile o süre boyunca
 * düğme ölü görünüyordu. `useTransition` ile bekleme görünür oluyor.
 *
 * Ayrıca iki küçük ama gerçek fayda:
 *  - Hata `role="alert"` taşır; yanlış parola ekran okuyucuya duyurulur.
 *  - Caps Lock açıkken uyarır — parola alanında yazdığını göremediğin için
 *    tekrar tekrar "yanlış parola" almanın en sık sebebi.
 */
export function LoginForm({
  action,
  hasError,
}: {
  action: (formData: FormData) => Promise<void>
  hasError?: boolean
}) {
  const [pending, start] = useTransition()
  const [caps, setCaps] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    start(async () => {
      await action(fd)
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="field-label">Şifre</span>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') ?? false)}
            className="field !pl-9"
          />
        </div>
      </label>

      {caps && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" /> Caps Lock açık
        </p>
      )}

      {hasError && (
        <p
          role="alert"
          className="rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3 py-2 text-sm text-rose-600 dark:text-rose-400"
        >
          Şifre hatalı. Tekrar dene.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        {/* Mürekkep dolgu aşağıdan yükselir */}
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-slate-900 transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 dark:bg-indigo-500"
        />
        {pending ? (
          <>
            <span className="relative flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Kontrol Ediliyor…
            </span>
          </>
        ) : (
          <>
            <span className="relative flex items-center gap-2">
              Panele Gir
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </span>
          </>
        )}
      </button>
    </form>
  )
}
