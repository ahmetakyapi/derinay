'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, Loader2 } from 'lucide-react'
import { convertWaitlist } from '@/app/actions/waitlist'

/** Bekleme listesindeki kişiyi danışana dönüştürür ve detayına gider */
export function ConvertWaitlistButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await convertWaitlist(id)
          if (res.ok && res.clientId) router.push(`/dashboard/clients/${res.clientId}`)
          else router.refresh()
        })
      }
      disabled={pending}
      title="Danışana dönüştür"
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-300"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
      Danışana çevir
    </button>
  )
}
