'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArchiveRestore, FileJson, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { restoreBackup } from '@/app/actions/restore'
import { cn } from '@/lib/utils'

const CONFIRM_WORD = 'GERİ YÜKLE'

export function RestoreCard() {
  const [file, setFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, start] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function run() {
    if (!file) return
    const fd = new FormData()
    fd.set('file', file)
    start(async () => {
      const res = await restoreBackup(fd)
      setConfirmOpen(false)
      setTyped('')
      if (res.ok) {
        const c = res.counts
        setResult({
          ok: true,
          message: `Geri yüklendi: ${c.danışan} danışan, ${c.seans} seans, ${c.not} not, ${c.işlem} işlem, ${c.makbuz} makbuz, ${c.ödeme} ödeme. (Yedek tarihi: ${new Date(res.exportedAt).toLocaleString('tr-TR')})`,
        })
        setFile(null)
        if (inputRef.current) inputRef.current.value = ''
        router.refresh()
      } else {
        setResult({ ok: false, message: res.error ?? 'Bir hata oluştu' })
      }
    })
  }

  return (
    <>
      <section className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.04] p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/12 text-rose-600 dark:text-rose-400">
            <ArchiveRestore className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Yedekten Geri Yükle
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tam JSON yedeği geri yükler — mevcut TÜM veriler yedektekilerle değiştirilir
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-500/25 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300">
            <FileJson className="h-4 w-4" />
            {file ? file.name : 'Yedek dosyası seç (.json)'}
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null)
                setResult(null)
              }}
            />
          </label>
          <button
            disabled={!file || pending}
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-500 disabled:opacity-40"
          >
            <ArchiveRestore className="h-4 w-4" /> Geri Yükle…
          </button>
        </div>

        {result && (
          <p
            className={cn(
              'mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm',
              result.ok
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
            )}
          >
            {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            {result.message}
          </p>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
          İşlem atomiktir: geri yükleme yarıda kesilirse hiçbir veri değişmez. Yine de geri
          yüklemeden önce mevcut durumun tam yedeğini almanı öneririz.
        </p>
      </section>

      {/* Onay — yazarak doğrulama */}
      <Modal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setTyped('')
        }}
        title="Emin misin?"
        description="Bu işlem mevcut tüm verileri seçilen yedekle DEĞİŞTİRİR"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5 text-sm text-slate-700 dark:text-slate-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p>
              <span className="font-bold">{file?.name}</span> içeriği yüklenecek; şu an panelde
              görünen <span className="font-bold">tüm danışanlar, seanslar, notlar ve finans kayıtları</span>{' '}
              bu yedektekilerle değiştirilecek.
            </p>
          </div>

          <label className="block">
            <span className="field-label">
              Onaylamak için <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{CONFIRM_WORD}</span> yaz
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoFocus
              className="field font-mono"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setConfirmOpen(false)
                setTyped('')
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Vazgeç
            </button>
            <button
              disabled={typed !== CONFIRM_WORD || pending}
              onClick={run}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-500 disabled:opacity-40"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? 'Geri yükleniyor…' : 'Evet, Geri Yükle'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
