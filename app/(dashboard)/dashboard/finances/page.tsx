import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { NewTransactionDialog } from '@/components/forms/NewTransactionDialog'
import { listTransactions, clientOptions } from '@/lib/queries'
import { deleteTransaction } from '@/app/actions/transactions'
import { formatTRY, formatDateShort } from '@/lib/format'

export default async function FinancesPage() {
  const [txs, clients] = await Promise.all([listTransactions({ scope: 'business' }), clientOptions()])

  const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <PageHeader
        title="Gelir & Gider"
        subtitle="Tüm finansal hareketler"
        action={<NewTransactionDialog clients={clients} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Toplam gelir</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{formatTRY(income)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Toplam gider</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-rose-600 dark:text-rose-400">{formatTRY(expense)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">Net</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatTRY(income - expense)}</p>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        {txs.length ? (
          <div className="divide-y divide-slate-500/10">
            {txs.map((t) => {
              const inc = t.type === 'income'
              return (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      inc ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {inc ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.category}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {[t.clientName, t.description].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                    {formatDateShort(t.date)}
                  </span>
                  <span className={`w-28 text-right font-mono text-[13px] font-semibold tabular-nums ${inc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {inc ? '+' : '−'}{formatTRY(t.amount)}
                  </span>
                  <DeleteButton action={deleteTransaction.bind(null, t.id)} />
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={Wallet} title="Henüz işlem yok" description="İlk gelir veya gider kaydını ekleyin." />
        )}
      </div>
    </>
  )
}
