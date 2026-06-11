import { Quote as QuoteIcon } from 'lucide-react'
import { BloomArt } from '@/components/art/BloomArt'
import type { Quote } from '@/lib/quotes'

/**
 * Günün Sözü — galeri duvarındaki bir yazıt gibi vurgulu kart.
 * Köşede soluk orkide dalı, büyük Fraunces italik söz, altın tırnak.
 */
export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <section className="glass relative h-full overflow-hidden rounded-2xl p-6 sm:p-7">
      {/* Soluk orkide dokunuşu */}
      <BloomArt className="pointer-events-none absolute -right-6 -top-4 h-48 w-36 opacity-50" delay={0.5} />

      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-600/90 dark:text-amber-400/90">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/12">
            <QuoteIcon className="h-3.5 w-3.5" />
          </span>
          Günün Sözü
        </div>

        <blockquote className="flex flex-1 flex-col">
          <span aria-hidden className="-mb-4 font-display text-5xl italic leading-none text-amber-500/30">
            &ldquo;
          </span>
          <p className="font-display text-xl italic leading-snug text-slate-800 dark:text-slate-100 sm:text-2xl">
            {quote.text}
          </p>
          <footer className="mt-4 flex items-center gap-2.5">
            <span className="h-px w-7 bg-gradient-to-r from-amber-500/70 to-transparent" />
            <cite className="text-sm font-semibold not-italic text-slate-500 dark:text-slate-400">
              {quote.author}
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
