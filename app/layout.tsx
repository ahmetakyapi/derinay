import type { Metadata, Viewport } from 'next'
import { Schibsted_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { ThemeColorSync } from '@/components/theme/ThemeColorSync'
import { RouteTransition } from '@/components/motion/RouteTransition'
import './globals.css'

/**
 * Tipografi — ekosistem yığını (bkz. ~/dev-starter, Mimio & Açılış Zili):
 * TEK aile **Schibsted Grotesk** hem gövde hem başlık; ayrım ağırlık ve optik
 * sıkılıktan gelir (`.font-display` → daha dar tracking). Rakamlar IBM Plex Mono.
 *
 * `weight` listesi VERİLMEZ — aile değişken (400–900); Tailwind'in
 * font-medium/semibold/bold sınıfları ekseni doğrudan kullanır.
 * latin-ext — Türkçe karakterler (ş, ğ, ı, İ, ç, ö, ü) için zorunlu.
 *
 * TUZAK: next/font `variable` adı, globals.css'teki token adıyla AYNI olursa
 * dairesel referans oluşur (--font-sans: var(--font-sans)) ve sessizce çöker.
 * Bu yüzden burada `-face` soneki kullanılır.
 */
const schibsted = Schibsted_Grotesk({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  variable: '--font-sans-face',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  // 700 ŞART: tutar/rozet rakamlarında `font-mono font-bold` yaygın kullanılıyor;
  // ağırlık yüklenmezse tarayıcı sentetik kalın üretir ve rakamlar bulanıklaşır.
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono-face',
  display: 'swap',
})

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
      className={`${schibsted.variable} ${ibmPlexMono.variable}`}
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
