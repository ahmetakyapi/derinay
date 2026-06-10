'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { USER } from '@/lib/constants'
import { cn } from '@/lib/utils'

/** "05xx xxx xx xx" → "905xxxxxxxxx" (wa.me formatı) */
function waPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('0')) return `9${digits}`
  return `90${digits}`
}

function reminderText(clientName: string, date: Date): string {
  const firstName = clientName.trim().split(/\s+/)[0]
  const when = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return `Merhaba ${firstName} 🌿 ${when} saatindeki seansımızı hatırlatmak isterim. Görüşmek üzere! — ${USER.fullName}`
}

/**
 * Seans hatırlatma — şablon mesajı panoya kopyalar; telefon varsa
 * WhatsApp'ı hazır mesajla açar.
 */
export function ReminderButton({
  clientName,
  phone,
  date,
  className,
}: {
  clientName: string
  phone: string | null
  date: string | Date
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const text = reminderText(clientName, new Date(date))

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Mesajı kopyala:', text)
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={copy}
        aria-label="Hatırlatma mesajını kopyala"
        title={copied ? 'Kopyalandı!' : 'Hatırlatma mesajını kopyala'}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
          copied
            ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300',
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {phone && (
        <a
          href={`https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile hatırlat"
          title="WhatsApp ile hatırlat"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
      )}
    </span>
  )
}
