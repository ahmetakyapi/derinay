import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string
  children: React.ReactNode
  /** Alanın altında gri ipucu satırı (opsiyonel) */
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate-400">{hint}</span>}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('field', props.className)} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('field resize-none', props.className)} />
}

/**
 * Select — `appearance-none` yerli oku siler, bu yüzden kendi chevron'umuzu
 * mutlak konumda çiziyoruz (token renkli; data-URI hardcoded hex yok).
 * Sarmalayıcı `inline` değil `block` — <Field> label'ı içinde tam genişlik alır.
 */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...props} className={cn('field appearance-none pr-9', props.className)} />
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </span>
  )
}
