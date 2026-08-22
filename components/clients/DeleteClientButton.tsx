'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { deleteClient } from '@/app/actions/clients'

/**
 * Danışan silme — yüksek riskli işlem (cascade: seans, not, ödeme, paket,
 * ölçüm, belge hepsi gider). Yanlışlıkla silmeyi önlemek için danışanın
 * adı yazılarak onaylanır.
 */
export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const match = typed.trim().toLocaleLowerCase('tr') === clientName.trim().toLocaleLowerCase('tr')

  function run() {
    start(async () => {
      await deleteClient(clientId)
      setOpen(false)
      router.push('/dashboard/clients')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Danışanı sil"
        title="Danışanı Sil"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-500/20 text-slate-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setTyped('')
        }}
        title="Danışanı Sil"
        description="Bu işlem geri alınamaz"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5 text-sm text-slate-700 dark:text-slate-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p>
              <span className="sensitive font-bold">{clientName}</span> ile birlikte{' '}
              <span className="font-semibold">tüm seansları, seans defteri notları, ödemeleri,
              paketleri, ölçümleri ve belge bağlantıları</span> kalıcı olarak silinir.
              Silmeden önce <span className="font-semibold">Yedekleme</span> sayfasından tam yedek almanı öneririz.
            </p>
          </div>

          <label className="block">
            <span className="field-label">
              Onaylamak için danışanın adını yaz: <span className="sensitive font-bold text-rose-600 dark:text-rose-400">{clientName}</span>
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Danışanın adını yaz"
              autoFocus
              className="field"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setOpen(false)
                setTyped('')
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Vazgeç
            </button>
            <button
              disabled={!match || pending}
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500 disabled:opacity-40"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? 'Siliniyor…' : 'Kalıcı Olarak Sil'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
