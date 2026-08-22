'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { convertWaitlist } from '@/app/actions/waitlist'

/**
 * Bekleme listesindeki kişiyi danışana dönüştürür ve detayına gider.
 * Onay ŞART: işlem bekleme kaydını kalıcı olarak siler (kayıt clients'a taşınır),
 * yanındaki basit silme düğmesi bile onay istiyorken bunun istememesi tutarsızdı.
 */
export function ConvertWaitlistButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false)
  const [pending, start] = useTransition()
  const router = useRouter()

  function convert() {
    return new Promise<void>((resolve) => {
      start(async () => {
        const res = await convertWaitlist(id)
        if (res.ok && res.clientId) router.push(`/dashboard/clients/${res.clientId}`)
        else router.refresh()
        resolve()
      })
    })
  }

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        disabled={pending}
        title="Danışana Dönüştür"
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-60 dark:text-emerald-300"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
        Danışana Çevir
      </button>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={convert}
        tone="default"
        icon={<UserCheck className="h-5 w-5" />}
        title="Danışana çevrilsin mi?"
        description={
          <>
            <span className="sensitive">{name}</span> danışan listesine taşınacak ve bekleme
            listesinden kaldırılacak.
          </>
        }
        confirmLabel="Danışana Çevir"
      />
    </>
  )
}
