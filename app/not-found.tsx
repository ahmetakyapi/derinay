import Link from 'next/link'
import { LayoutDashboard, ArrowLeft } from 'lucide-react'
import { BloomArt } from '@/components/art/BloomArt'

export const metadata = { title: 'Sayfa Bulunamadı' }

/** 404 — düz söz: başlık ne olduğunu söyler, metin ne yapılacağını.
 *  (Eski "Bu duvarda böyle bir eser yok" galeri benzetmesiydi; sahibinin
 *  "günlük Türkçe, edebi kurgu yok" kuralına takılıyordu.) */
export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Boş pencere: kahramandaki galeri penceresinin gece hâli — güneş yok,
          hilal ve yıldızlar; yanında orkide kendi kendine çizilir. "Burada bir
          şey olmalıydı" duygusunu sözsüz verir; metin düz kalır. */}
      <div aria-hidden className="card-rise relative mb-[-3.5rem] h-56 w-44 sm:h-64 sm:w-52">
        <div className="absolute inset-0 overflow-hidden rounded-b-3xl rounded-t-[50%_40%] bg-linear-to-b from-slate-950 via-indigo-950 to-indigo-950 shadow-2xl shadow-indigo-950/30 ring-1 ring-white/10">
          {[[22, 16], [64, 10], [78, 30], [38, 34], [54, 22]].map(([x, y], n) => (
            <span
              key={n}
              className="absolute h-[2px] w-[2px] animate-[twinkle_3.6s_ease-in-out_infinite] rounded-full bg-amber-100 motion-reduce:animate-none"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${n * -0.8}s` }}
            />
          ))}
          {/* Hilal: saydam dairenin kaydırılmış gölgesi — renk token'dan, ek katman yok */}
          <span className="absolute left-[58%] top-[18%] h-9 w-9 rounded-full shadow-[-9px_6px_0_0_rgba(var(--gold),0.95)]" />
          <span className="absolute left-[50%] top-[16%] h-14 w-14 rounded-full bg-[radial-gradient(closest-side,rgba(var(--gold),0.22),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 top-[68%] bg-indigo-950">
            {[0, 1, 2].map((n) => (
              <span key={n} className="absolute h-[2px] rounded-full bg-amber-300/30" style={{ top: `${18 + n * 22}%`, left: `${30 + n * 6}%`, width: `${40 - n * 12}%` }} />
            ))}
          </div>
          <div className="absolute inset-x-0 top-[68%] h-px bg-amber-200/40" />
        </div>
        <div className="absolute -left-10 bottom-6 h-40 w-24 sm:-left-14 sm:h-48 sm:w-28">
          <BloomArt className="h-full w-full" delay={0.5} />
        </div>
      </div>

      <div className="card-rise surface relative w-full max-w-md rounded-3xl p-8 pt-20 text-center shadow-2xl [animation-delay:120ms]">
        {/* Başlık üstündeki "404" künyesi de gitti: başlık artık durumu kendisi
            söylüyor ("Sayfa Bulunamadı"), kod bilgisi tekrar olurdu. */}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Sayfa Bulunamadı
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.98]"
          >
            <LayoutDashboard className="h-4 w-4" /> Panele Dön
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-500/20 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-500/40 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" /> Ana Sayfa
          </Link>
        </div>
      </div>
    </main>
  )
}
