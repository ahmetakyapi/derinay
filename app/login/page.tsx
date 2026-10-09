import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { AuthError } from 'next-auth'
import { signIn, auth } from '@/lib/auth'
import { LoginForm } from '@/components/forms/LoginForm'
import { BloomArt } from '@/components/art/BloomArt'
import { BloomMark } from '@/components/brand/BloomMark'
import { APP } from '@/lib/constants'
import { quoteOfTheDay } from '@/lib/quotes'

export const metadata = { title: 'Giriş' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  // Zaten girişliyse panele
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  const quote = quoteOfTheDay()

  async function login(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        password: String(formData.get('password') ?? ''),
        redirectTo: '/dashboard',
      })
    } catch (e) {
      // signIn başarıda redirect fırlatır — onu yutma
      if (e instanceof AuthError) redirect('/login?error=1')
      throw e
    }
  }

  return (
    <main className="relative grid min-h-[100dvh] lg:grid-cols-[1.1fr_1fr]">
      {/* ── Sol: gece adası — orkide çizilir, günün sözü yükselir ─────────
          Perde gibi soldan açılır (`.panel-wipe`). Telefonda gizli; söz
          formun altına iner. */}
      <section
        aria-hidden
        className="panel-wipe dark relative hidden flex-col justify-between overflow-hidden bg-indigo-950 p-12 text-[var(--ink)] lg:flex xl:p-16"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[110px]" />
          <div className="absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-amber-500/10 blur-[100px]" />
          <BloomMark className="slow-spin absolute -right-48 top-1/2 h-[44rem] w-[44rem] -translate-y-1/2 text-white/[0.035]" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
            <BloomMark className="h-[22px] w-[22px] text-slate-900" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-indigo-950" />
          </div>
          <span className="font-display text-lg font-bold tracking-[-0.04em] text-slate-50">{APP.name}</span>
        </div>

        <BloomArt className="relative mx-auto h-[22rem] w-[17rem] opacity-90" delay={0.7} />

        <figure className="relative max-w-lg">
          <blockquote className="title-mask font-display text-[1.9rem] font-medium italic leading-[1.2] tracking-[-0.03em] text-slate-50 xl:text-[2.2rem]">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <figcaption className="subtitle-rise mt-5 flex items-center gap-3 font-mono text-xs text-slate-400">
            <span className="h-px w-8 bg-amber-400/70" />
            {quote.author}
          </figcaption>
        </figure>
      </section>

      {/* ── Sağ: kâğıt — form ─────────────────────────────────────────── */}
      <section className="relative flex flex-col px-6 py-10 sm:px-12">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <Link href="/" className="group inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
            ana sayfa
          </Link>
          <span>güvenli giriş</span>
        </div>

        <div className="page-enter relative mx-auto my-auto w-full max-w-sm py-16">
          <div className="relative mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20 dark:bg-slate-50 lg:hidden">
            <BloomMark className="h-8 w-8 text-amber-50 dark:text-slate-900" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-[var(--bg)]" />
          </div>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1] tracking-[-0.055em] text-slate-900 dark:text-white sm:text-[3.2rem]">
            Tekrar
            <br />
            Hoş Geldin
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {APP.name} · pratiğinin sakin çalışma masası
          </p>

          <div className="mt-10">
            <LoginForm action={login} hasError={Boolean(searchParams.error)} />
          </div>

          {/* Telefonda söz formun altında; masaüstünde sol panelde */}
          <figure className="mt-10 border-t border-slate-500/15 pt-6 lg:hidden">
            <blockquote className="font-display text-sm italic text-slate-500 dark:text-slate-400">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">{quote.author}</figcaption>
          </figure>
        </div>
      </section>
    </main>
  )
}
