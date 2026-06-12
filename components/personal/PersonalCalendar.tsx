'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, StickyNote } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { createTransaction, deleteTransaction } from '@/app/actions/transactions'
import { PERSONAL_CATEGORIES } from '@/lib/constants'
import { personalCategoryIcon } from '@/components/personal/categoryIcon'
import { formatTRY, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type Item = { id: string; amount: number; category: string; description: string | null; date: string }
type ByDay = Record<string, { total: number; items: Item[] }>

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

/** Gün toplamı / ay maksimumu → ısı katmanı opaklığı (kil tonu) */
function heatAlpha(total: number, max: number): number {
  if (!total || !max) return 0
  const r = total / max
  if (r > 0.66) return 0.18
  if (r > 0.33) return 0.11
  return 0.06
}

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
  const [category, setCategory] = useState('')
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

  const maxDayTotal = Math.max(...Object.values(byDay).map((d) => d.total), 0)
  const dayItems = selected ? byDay[selected]?.items ?? [] : []
  const isTodayInMonth = todayKey.startsWith(`${year}-${pad(month + 1)}`)

  function closeModal() {
    setSelected(null)
    setCategory('')
    setError(null)
  }

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
      setCategory('')
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
        <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-[11px]">
              {w}
            </div>
          ))}
        </div>

        {/* Günler — ısı haritalı; tutar her ekran boyutunda görünür */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((key, i) => {
            if (!key) return <div key={i} className="min-h-[58px] sm:min-h-[88px]" />
            const day = Number(key.split('-')[2])
            const data = byDay[key]
            const isToday = key === todayKey
            const hasNote = data?.items.some((it) => it.description)
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                aria-label={`${day} — ${data ? formatTRY(data.total) : 'harcama yok'}`}
                className={cn(
                  'group relative flex min-h-[58px] flex-col justify-between rounded-lg border p-1 text-left transition-all sm:min-h-[88px] sm:rounded-xl sm:p-2',
                  'border-slate-500/10 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5',
                  isToday && 'border-indigo-500/50 ring-1 ring-indigo-500/40',
                )}
                style={data ? { backgroundColor: `rgba(var(--clay), ${heatAlpha(data.total, maxDayTotal)})` } : undefined}
              >
                <div className="flex items-start justify-between gap-0.5">
                  <span
                    className={cn(
                      'font-bold leading-none',
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white sm:h-6 sm:w-6 sm:text-[11px]'
                        : 'text-[11px] text-slate-500 dark:text-slate-300 sm:text-xs',
                    )}
                  >
                    {day}
                  </span>
                  {hasNote && <StickyNote className="mt-0.5 h-2.5 w-2.5 shrink-0 text-amber-500" />}
                </div>

                {data ? (
                  <div className="min-w-0">
                    {/* İşlem noktaları (sm+) */}
                    <div className="mb-0.5 hidden items-center gap-0.5 sm:flex">
                      {data.items.slice(0, 4).map((it) => (
                        <span key={it.id} className="h-1 w-1 rounded-full bg-rose-500/70" />
                      ))}
                      {data.items.length > 4 && (
                        <span className="text-[8px] leading-none text-slate-400">+{data.items.length - 4}</span>
                      )}
                    </div>
                    <p className="sensitive truncate font-mono text-[9px] font-bold tabular-nums text-rose-700 dark:text-rose-300 sm:text-[11px]">
                      {formatTRY(data.total, { compact: true })}
                    </p>
                  </div>
                ) : (
                  <Plus className="h-3 w-3 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
                )}
              </button>
            )
          })}
        </div>

        {/* Isı lejantı */}
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
          <span>az</span>
          {[0.06, 0.11, 0.18].map((a) => (
            <span
              key={a}
              className="h-2.5 w-2.5 rounded-[4px] border border-slate-500/10"
              style={{ backgroundColor: `rgba(var(--clay), ${a})` }}
            />
          ))}
          <span>çok</span>
        </div>
      </div>

      {/* Mobil FAB — bugüne hızlı harcama ekle */}
      {isTodayInMonth && (
        <button
          onClick={() => setSelected(todayKey)}
          aria-label="Bugüne harcama ekle"
          className="fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-90 lg:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Gün detay modalı */}
      <Modal
        open={selected !== null}
        onClose={closeModal}
        title={selected ? formatDate(selected) : ''}
        description={
          dayItems.length
            ? `${dayItems.length} harcama · ${formatTRY(dayItems.reduce((s, i) => s + i.amount, 0))}`
            : 'Bu güne kişisel harcama ekle'
        }
      >
        {dayItems.length > 0 && (
          <ul className="mb-5 space-y-2">
            {dayItems.map((it) => {
              const Icon = personalCategoryIcon(it.category)
              return (
                <li key={it.id} className="flex items-start gap-3 rounded-xl border border-slate-500/10 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{it.category}</p>
                    {it.description && (
                      <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <StickyNote className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <span>{it.description}</span>
                      </p>
                    )}
                  </div>
                  <span className="sensitive shrink-0 font-mono text-[13px] font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    −{formatTRY(it.amount)}
                  </span>
                  <button
                    onClick={() => removeExpense(it.id)}
                    disabled={pending}
                    aria-label="Sil"
                    className="shrink-0 text-slate-400 transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <form onSubmit={addExpense} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tutar (₺)">
              <Input name="amount" type="number" step="0.01" min="0" required placeholder="0,00" autoFocus inputMode="decimal" />
            </Field>
            <Field label="Ne aldın?">
              <Input
                name="category"
                required
                placeholder="Market…"
                autoComplete="off"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </Field>
          </div>

          {/* Kategori çipleri — dokunmatik dostu hızlı seçim */}
          <div className="flex flex-wrap gap-1.5">
            {PERSONAL_CATEGORIES.map((c) => {
              const Icon = personalCategoryIcon(c)
              const active = category === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(active ? '' : c)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-all',
                    active
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-500/20 text-slate-500 hover:border-slate-500/40 hover:text-slate-700 dark:hover:text-slate-300',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {c}
                </button>
              )
            })}
          </div>

          <Field label="Not (opsiyonel)">
            <Input name="note" placeholder="örn. haftalık market, kahve molası…" />
          </Field>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {pending ? 'Ekleniyor…' : 'Harcama Ekle'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
