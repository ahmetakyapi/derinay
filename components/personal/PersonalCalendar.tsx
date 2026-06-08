'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, StickyNote } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { createTransaction, deleteTransaction } from '@/app/actions/transactions'
import { PERSONAL_CATEGORIES } from '@/lib/constants'
import { formatTRY, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type Item = { id: string; amount: number; category: string; description: string | null; date: string }
type ByDay = Record<string, { total: number; items: Item[] }>

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function PersonalCalendar({
  year,
  month,
  byDay,
  todayKey,
}: {
  year: number
  month: number
  byDay: ByDay
  todayKey: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()

  const pad = (n: number) => String(n).padStart(2, '0')
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Pzt=0

  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`)
  while (cells.length % 7 !== 0) cells.push(null)

  const dayItems = selected ? byDay[selected]?.items ?? [] : []

  function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const form = e.currentTarget
    start(async () => {
      const res = await createTransaction({
        type: 'expense',
        scope: 'personal',
        amount: Number(fd.get('amount')),
        category: String(fd.get('category')),
        description: String(fd.get('note') || ''),
        date: selected!,
      })
      if (!res.ok) return setError(res.error ?? 'Bir hata oluştu')
      form.reset()
      router.refresh()
    })
  }

  function removeExpense(id: string) {
    start(async () => {
      await deleteTransaction(id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="glass rounded-2xl p-3 sm:p-4">
        {/* Hafta günleri */}
        <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {w}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((key, i) => {
            if (!key) return <div key={i} className="min-h-[68px] sm:min-h-[116px]" />
            const day = Number(key.split('-')[2])
            const data = byDay[key]
            const isToday = key === todayKey
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  'group flex min-h-[68px] flex-col rounded-xl border p-1.5 text-left transition-all sm:min-h-[116px] sm:p-2',
                  'border-slate-500/10 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5',
                  data ? 'bg-gradient-to-b from-rose-500/[0.07] to-transparent' : 'hover:bg-indigo-500/[0.04]',
                  isToday && 'ring-1 ring-indigo-500/50',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-bold', isToday ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-300')}>
                    {day}
                  </span>
                  {data && (
                    <span className="text-[10px] font-bold text-rose-500 sm:text-[11px]">
                      −{formatTRY(data.total, { compact: true })}
                    </span>
                  )}
                </div>

                {/* Harcama chip'leri (desktop) */}
                {data && (
                  <div className="mt-1.5 hidden flex-1 flex-col gap-1 sm:flex">
                    {data.items.slice(0, 3).map((it) => (
                      <span
                        key={it.id}
                        className="flex items-center gap-1 truncate rounded-md bg-white/50 px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-500/10 dark:bg-white/[0.04] dark:text-slate-300"
                        title={it.description ? `${it.category} — ${it.description}` : it.category}
                      >
                        {it.description && <StickyNote className="h-2.5 w-2.5 shrink-0 text-amber-500" />}
                        <span className="truncate">{it.category}</span>
                      </span>
                    ))}
                    {data.items.length > 3 && (
                      <span className="text-[10px] font-medium text-slate-400">+{data.items.length - 3} daha</span>
                    )}
                  </div>
                )}

                {/* Mobil: harcama sayısı */}
                {data && (
                  <span className="mt-auto text-[10px] text-slate-400 sm:hidden">
                    {data.items.length} harcama
                  </span>
                )}

                {/* Boş gün: hover + işareti */}
                {!data && (
                  <Plus className="mt-auto hidden h-3.5 w-3.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600 sm:block" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Gün detay modalı */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? formatDate(selected) : ''}
        description={dayItems.length ? `${dayItems.length} harcama · ${formatTRY(dayItems.reduce((s, i) => s + i.amount, 0))}` : 'Bu güne kişisel harcama ekle'}
      >
        {dayItems.length > 0 && (
          <ul className="mb-5 space-y-2">
            {dayItems.map((it) => (
              <li key={it.id} className="flex items-start gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{it.category}</p>
                  {it.description && (
                    <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                      <span>{it.description}</span>
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-bold text-rose-500">−{formatTRY(it.amount)}</span>
                <button
                  onClick={() => removeExpense(it.id)}
                  disabled={pending}
                  aria-label="Sil"
                  className="shrink-0 text-slate-400 transition-colors hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addExpense} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tutar (₺)">
              <Input name="amount" type="number" step="0.01" min="0" required placeholder="0,00" autoFocus />
            </Field>
            <Field label="Ne aldın?">
              <Input name="category" list="personal-cat" required placeholder="Market…" autoComplete="off" />
              <datalist id="personal-cat">
                {PERSONAL_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </div>
          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="örn. haftalık market, kahve molası…" />
          </Field>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {pending ? 'Ekleniyor…' : 'Harcama ekle'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
