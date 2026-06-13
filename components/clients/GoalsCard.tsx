'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Plus, Check, Pause, Play, Trash2 } from 'lucide-react'
import { addGoal, setGoalStatus, deleteGoal } from '@/app/actions/goals'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

type Goal = {
  id: string
  title: string
  status: 'active' | 'achieved' | 'paused'
  note: string | null
  achievedAt: string | null
}

/**
 * Tedavi Hedefleri — hafif tedavi planı. Hedef ekle, tamamla (kutlama tonu),
 * duraklat, sil. Tamamlanma oranı üstte ince çubukla görselleşir.
 */
export function GoalsCard({ clientId, goals }: { clientId: string; goals: Goal[] }) {
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Goal | null>(null)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const achieved = goals.filter((g) => g.status === 'achieved').length
  const pct = goals.length ? Math.round((achieved / goals.length) * 100) : 0

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const title = inputRef.current?.value ?? ''
    start(async () => {
      const res = await addGoal({ clientId, title })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      if (inputRef.current) inputRef.current.value = ''
      router.refresh()
    })
  }

  function setStatus(id: string, status: Goal['status']) {
    start(async () => {
      await setGoalStatus(id, clientId, status)
      router.refresh()
    })
  }

  async function remove() {
    if (!toDelete) return
    await deleteGoal(toDelete.id, clientId)
    router.refresh()
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
          <Target className="h-4 w-4 text-amber-500 dark:text-amber-400" /> Tedavi Hedefleri
        </h2>
        {goals.length > 0 && (
          <span className="text-xs font-semibold text-slate-400">
            {achieved}/{goals.length} tamamlandı
          </span>
        )}
      </div>

      {/* Tamamlanma çubuğu */}
      {goals.length > 0 && (
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-500/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {goals.length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {goals.map((g) => (
            <li
              key={g.id}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl border border-slate-500/10 px-3 py-2 transition-colors',
                g.status === 'achieved' && 'border-emerald-500/20 bg-emerald-500/[0.05]',
                g.status === 'paused' && 'opacity-55',
              )}
            >
              <button
                onClick={() => setStatus(g.id, g.status === 'achieved' ? 'active' : 'achieved')}
                disabled={pending}
                aria-label={g.status === 'achieved' ? 'Aktife çevir' : 'Tamamlandı işaretle'}
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
                  g.status === 'achieved'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-400/40 text-transparent hover:border-emerald-500/60 hover:text-emerald-500/50',
                )}
              >
                <Check className="h-3 w-3" />
              </button>
              <span
                className={cn(
                  'min-w-0 flex-1 text-sm text-slate-700 dark:text-slate-200',
                  g.status === 'achieved' && 'text-slate-400 line-through dark:text-slate-500',
                )}
              >
                {g.title}
              </span>
              {g.status !== 'achieved' && (
                <button
                  onClick={() => setStatus(g.id, g.status === 'paused' ? 'active' : 'paused')}
                  disabled={pending}
                  aria-label={g.status === 'paused' ? 'Devam et' : 'Duraklat'}
                  title={g.status === 'paused' ? 'Devam et' : 'Duraklat'}
                  className="shrink-0 text-slate-300 opacity-0 transition-all hover:text-amber-500 group-hover:opacity-100 dark:text-slate-600"
                >
                  {g.status === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              )}
              <button
                onClick={() => setToDelete(g)}
                disabled={pending}
                aria-label="Sil"
                className="shrink-0 text-slate-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100 dark:text-slate-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="flex items-center gap-2">
        <input
          ref={inputRef}
          required
          placeholder="Yeni hedef — örn. uyku düzenini iyileştirmek"
          className="field flex-1 !py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Hedef ekle"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-rose-500">{error}</p>}
      {!goals.length && (
        <p className="mt-2 text-[11px] text-slate-400">
          Danışanla birlikte belirlediğiniz hedefleri ekle — tamamlandıkça ilerleme görünür.
        </p>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Hedef silinsin mi?"
        description={toDelete ? `“${toDelete.title}” hedefi kaldırılacak.` : undefined}
      />
    </section>
  )
}
