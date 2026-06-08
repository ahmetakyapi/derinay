import type { Metadata } from 'next'
import { Manrope, IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

// latin-ext — Türkçe karakterler (ş, ğ, ı, İ, ç, ö, ü) için zorunlu
const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Derinay — Psikologlar için finans & danışan takibi',
    template: '%s · Derinay',
  },
  description:
    'Psikologlar için gelir-gider, fatura, vergi ve danışan takibini tek panelde toplayan sakin ve şık finans yönetimi.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning — next-themes için zorunlu (mistakes.md #1)
    <html lang="tr" suppressHydrationWarning className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <body className={manrope.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
