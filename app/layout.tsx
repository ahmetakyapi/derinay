import type { Metadata, Viewport } from 'next'
// Fontlar fontsource paketlerinden, SABİT aile adlarıyla (bkz. not aşağıda)
import '@fontsource-variable/schibsted-grotesk/wght.css'
import '@fontsource-variable/schibsted-grotesk/wght-italic.css'
import '@fontsource-variable/fraunces/soft-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-mono/700.css'
import { ThemeProvider } from 'next-themes'
import { ThemeColorSync } from '@/components/theme/ThemeColorSync'
import { RouteTransition } from '@/components/motion/RouteTransition'
import './globals.css'

/**
 * Tipografi — Schibsted Grotesk (gövde + başlık), IBM Plex Mono (rakam),
 * Fraunces italik (yalnız manşet vurgusu). Aileler globals.css'teki
 * `--font-*-face` tokenlarına SABİT adlarla bağlanır.
 *
 * NEDEN next/font DEĞİL (9 Ekim 2026): Vercel derlemesinde next/font'un sunucu
 * HTML'ine yazdığı `__variable_xxx` sınıf hash'i ile CSS'te tanımladığı hash
 * FARKLI çıktı (HTML e8b673, CSS 15f804). `--font-sans-face` hiç tanımlanmadı,
 * canlı site Times New Roman'a düştü. Yerel derlemede tutarlıydı — yani
 * ortama bağlı, tekrar üretilemeyen bir kırılma. fontsource dosyaları pakette,
 * aile adları sabit: hash yok, eşleşmeyecek bir şey yok.
 */

export const metadata: Metadata = {
  // metadataBase — OG/canonical URL'lerin mutlak çözülmesi için (prod uyarısını da susturur)
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Derinay — Psikologlar için finans & danışan takibi',
    template: '%s · Derinay',
  },
  description:
    'Psikologlar için gelir-gider, serbest meslek makbuzu, vergi ve danışan takibini tek panelde toplayan sakin finans yönetimi.',
  openGraph: {
    title: 'Derinay — Psikologlar için finans & danışan takibi',
    description:
      'Gelir-gider, makbuz, vergi ve danışan takibi tek, sakin panelde.',
    siteName: 'Derinay',
    locale: 'tr_TR',
    type: 'website',
  },
  robots: {
    // Kişisel panel — arama motorlarında listelenmesin
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  // viewport-fit=cover — çentikli telefonlarda safe-area değişkenlerini aktive eder
  // (tab bar / topbar env(safe-area-inset-*) paylarını kullanır)
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Statik başlangıç değeri (light varsayılan) — sonrası ThemeColorSync'te:
  // tema class-tabanlı olduğundan prefers-color-scheme media'sı yanlış olur.
  themeColor: '#f6f2e9',
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
    >
      <head>
        {/*
          Gizlilik modu, tema gibi, İLK BOYAMADAN ÖNCE uygulanmalı: React mount
          olana kadar .privacy sınıfı eklenmediği için kimlikler bir kare boyunca
          bulanıksız görünüyordu (gizlilik özelliğinde kabul edilemez bir flaş).
          next-themes'in kullandığı desenin aynısı: engelleyici satır içi script.
        */}
        <script
          dangerouslySetInnerHTML={{
            // İkinci parça: açılış perdesi oturumda bir kez — görüldüyse
            // `intro-seen` ilk boyamadan önce perdeyi CSS ile gizler.
            __html: `try{if(localStorage.getItem('derinay:privacy')==='1')document.documentElement.classList.add('privacy')}catch(e){}try{if(sessionStorage.getItem('derinay:intro'))document.documentElement.classList.add('intro-seen')}catch(e){}`,
          }}
        />
      </head>
      {/* body'ye `schibsted.className` VERİLMEZ: next/font sınıfı font-family'yi
          doğrudan Schibsted'e kilitler ve globals.css'teki `var(--font-sans)`
          yığınını (başında ₺ alt kümesi DerinayLira) ezer — ₺ her yerde £ gibi
          çiziliyordu. Aile `--font-sans-face` değişkeniyle html'den gelir. */}
      <body>
        {/* Varsayılan tema: light — "kâğıt galeri". enableSystem kapalı (bilinçli tercih). */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeColorSync />
          <RouteTransition />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
