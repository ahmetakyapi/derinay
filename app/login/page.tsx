import { redirect } from 'next/navigation'
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Suluboya lekeleri + orkide filigranı */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <BloomMark className="absolute -right-20 top-1/2 hidden h-[28rem] w-[28rem] -translate-y-1/2 -rotate-12 text-slate-900/[0.04] dark:text-white/[0.04] lg:block" />
        <BloomArt className="absolute bottom-10 left-10 hidden h-52 w-40 opacity-70 md:block" delay={0.8} />
      </div>

      <div className="surface relative w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        {/* Mürekkep damgası — orkide */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/20 dark:bg-slate-50">
            <BloomMark className="h-8 w-8 text-amber-50 dark:text-slate-900" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-[var(--bg)]" />
          </div>
          <h1 className="font-display text-[1.65rem] font-bold tracking-[-0.035em] text-slate-900 dark:text-white">
            Tekrar Hoş Geldin
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {APP.name} · pratiğinin sakin çalışma masası
          </p>
        </div>

        <LoginForm action={login} hasError={Boolean(searchParams.error)} />

        <p className="mt-6 text-center font-display text-xs italic text-slate-400">
          &ldquo;{quoteOfTheDay().text}&rdquo;
        </p>
      </div>
    </main>
  )
}
