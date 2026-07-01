import type { Metadata, Viewport } from 'next'
import { Manrope, IBM_Plex_Mono, Fraunces } from 'next/font/google'
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

// Display serif — başlıklar ve büyük rakamlar için sanatsal tipografi
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-display',
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

export const viewport: Viewport = {
  // viewport-fit=cover — çentikli telefonlarda safe-area değişkenlerini aktive eder
  // (tab bar / topbar env(safe-area-inset-*) paylarını kullanır)
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f2e9' },
    { media: '(prefers-color-scheme: dark)', color: '#04070d' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning — next-themes için zorunlu (mistakes.md #1)
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${manrope.variable} ${ibmPlexMono.variable} ${fraunces.variable}`}
    >
      <body className={manrope.className}>
        {/* Varsayılan tema: light — "kâğıt galeri". enableSystem kapalı (bilinçli tercih). */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
