import { Quote as QuoteIcon } from 'lucide-react'
import { BloomArt } from '@/components/art/BloomArt'
import type { Quote } from '@/lib/quotes'

/**
 * Günün Sözü — sayfanın üstünde, galeri yazıtı gibi yatay bir bant.
 * Sağda soluk orkide, solda altın tırnak, büyük italik söz (gerçek italik —
 * Schibsted Grotesk italik ekseni; alıntı için doğru tipografi).
 */
export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <section className="glass relative mb-6 overflow-hidden rounded-2xl px-5 py-5 sm:px-7">
      {/* Soluk orkide dokunuşu — sağ kenar */}
      <BloomArt className="pointer-events-none absolute -right-2 -top-6 hidden h-40 w-32 opacity-40 sm:block" delay={0.4} />
      {/* Altın suluboya hâle — sol */}
      <span aria-hidden className="pointer-events-none absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative flex items-start gap-4 sm:items-center sm:gap-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
          <QuoteIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600/90 dark:text-amber-400/90">
            Günün Sözü
          </p>
          <blockquote className="font-display text-lg italic leading-snug text-slate-800 dark:text-slate-100 sm:text-xl">
            {quote.text}
          </blockquote>
          <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-px w-6 bg-gradient-to-r from-amber-500/70 to-transparent" />
            {quote.author}
          </p>
        </div>
      </div>
    </section>
  )
}
