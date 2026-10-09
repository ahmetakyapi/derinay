'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Sık kullanılan terapi etiketleri — öneri olarak gösterilir
const SUGGESTIONS = ['EMDR', 'BDT', 'Çift terapisi', 'Online', 'Çocuk-ergen', 'Şema terapi', 'Travma'] as const

/**
 * Danışan etiketleri — çip tabanlı giriş. Enter/virgülle ekle, öneriye dokun.
 */
export function TagInput({
  value,
  onChange,
}: {
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function add(tag: string) {
    const t = tag.trim()
    if (!t) return
    if (value.some((x) => x.toLowerCase() === t.toLowerCase())) return
    onChange([...value, t])
    setDraft('')
  }

  function remove(tag: string) {
    onChange(value.filter((x) => x !== tag))
  }

  const remainingSuggestions = SUGGESTIONS.filter(
    (s) => !value.some((x) => x.toLowerCase() === s.toLowerCase()),
  )

  return (
    <div>
      <span className="field-label">Etiketler (opsiyonel)</span>

      <div className="field flex min-h-[44px] flex-wrap items-center gap-1.5 !py-2">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              aria-label={`${t} etiketini kaldır`}
              className="text-indigo-400 transition-colors hover:text-rose-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add(draft)
            } else if (e.key === 'Backspace' && !draft && value.length) {
              remove(value[value.length - 1])
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? '' : 'EMDR, Online…'}
          className="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-slate-500/20 px-2 py-1 text-xs font-medium text-slate-500',
                'transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300',
              )}
            >
              <Plus className="h-2.5 w-2.5" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
