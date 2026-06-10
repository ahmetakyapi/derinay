'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCcw, Check } from 'lucide-react'
import { copyRecurring } from '@/app/actions/transactions'

/**
 * Önceki ayın tekrarlayan (sabit) kalemlerini görüntülenen aya kopyalar.
 */
export function CopyRecurringButton({ month }: { month: string }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<number | null>(null)
  const router = useRouter()

  function run() {
    start(async () => {
      const res = await copyRecurring(month)
      setResult(res.ok ? res.copied : 0)
      router.refresh()
      setTimeout(() => setResult(null), 4000)
    })
  }

  return (
    <button
      onClick={run}
      disabled={pending}
      title="Önceki ayın 'her ay tekrarlanır' işaretli kalemlerini bu aya kopyala"
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-500/20 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 disabled:opacity-60 dark:text-slate-300 dark:hover:text-indigo-300"
    >
      {result !== null ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          {result > 0 ? `${result} kalem kopyalandı` : 'Kopyalanacak yeni kalem yok'}
        </>
      ) : (
        <>
          <RefreshCcw className={pending ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
          {pending ? 'Kopyalanıyor…' : 'Sabit Giderleri Kopyala'}
        </>
      )}
    </button>
  )
}
