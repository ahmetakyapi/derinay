import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { USER } from './constants'

/**
 * Tek kullanıcılı kilit — Simay için parola tabanlı giriş.
 * Parola env'de tutulur (APP_PASSWORD); DB/adapter yok, JWT session.
 * DİKKAT: bu dosya middleware'de (edge) çalışır — buraya asla `lib/db` import etme.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, // 30 gün
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { password: { label: 'Parola', type: 'password' } },
      authorize: async (credentials) => {
        const expected = process.env.APP_PASSWORD
        if (!expected) return null // parola tanımlı değilse giriş kapalı
        if (String(credentials?.password ?? '') === expected) {
          return { id: 'owner', name: USER.fullName, email: 'owner@derinay.app' }
        }
        // Yanlış denemeyi yavaşlat — otomatik parola denemelerini caydırır
        await new Promise((r) => setTimeout(r, 800))
        return null
      },
    }),
  ],
  callbacks: {
    // Middleware bunu kullanır: oturum yoksa /login'e yönlendirilir
    authorized: ({ auth }) => !!auth?.user,
  },
})
