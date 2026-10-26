import type { Config } from 'tailwindcss'

/**
 * Derinay "Atölye" paleti — sanat galerisi estetiği.
 *
 * Var olan sınıf adları (slate/indigo/emerald/rose/amber/sky/violet/teal/cyan)
 * korunur ama değerleri Derinay'ın sanatsal paletine remap edilir. Böylece tüm
 * uygulama tek noktadan tutarlı tonlanır (hardcoded renk yasağının token hali).
 *
 *   slate   → mürekkep (sıcak, hafif yeşil alt tonlu nötrler)
 *   indigo  → çam/petrol (birincil aksiyon rengi — "Derin")
 *   emerald → adaçayı yeşili (gelir)
 *   rose    → terracotta / kil (gider)
 *   amber   → okra altını (vergi & sanatsal vurgu)
 *   sky     → pus mavisi (bilgi)
 *   violet  → erik (ikincil vurgu)
 *   teal    → okaliptüs, cyan → su yeşili (avatar/donut çeşitleri)
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // lib'de tanımlı sınıf haritaları (CLIENT_COLOR_BG, STATUS_TONE vb.) JIT'in
    // görmesi için ŞART — yoksa avatar gradientleri üretilmez (görünmez avatar bug'ı).
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  // Koyu tema varyantı v4'te globals.css → `@custom-variant dark (&:is(.dark *))`
  // (v3 'class' stratejisinin birebir seçicisi); burada ikinci tanım yok.
  theme: {
    extend: {
      /**
       * Opaklık adımları 8 ve 12 — v3 mirası.
       *
       * v3'te (ölçüldü) yalnız 5'in katları config'siz çalışıyordu; /12, /8
       * hiç CSS üretmiyordu, bu yüzden buraya eklenmişti. v4'te renk
       * modifier'ı her tam sayıyı kabul eder (`bg-rose-500/12`, `/7`); bu
       * kayıt artık yalnız `opacity-8` / `opacity-12` yardımcılarını üretir.
       * Kaldırmak zararsız ama gereksiz risk — dokunma, yenisini ekleme.
       */
      opacity: {
        8: '0.08',
        12: '0.12',
      },
      /**
       * Punto ölçeği — v3 değerleri, satır yüksekliği MUTLAK (rem).
       *
       * ÖLÇÜLDÜ (Tailwind v4 geçişi, Ekim 2026): v4 varsayılanı satır
       * yüksekliğini oran olarak yazar (`text-sm` → 1.4286). Oran mirasla
       * çocuğa geçer ve çocuğun kendi puntosuyla çarpılır: `text-sm` tablonun
       * `text-[13px]` başlık satırı 20px yerine 18.6px oldu, Vergiler tablosu
       * 3px kısaldı. v3'te mutlak değer miras alınıyordu; ekran aynı kalsın
       * diye v3 ölçeği burada sabit.
       */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      // Fallback zinciri CSS değişkeninin İÇİNDE (globals.css :root) —
      // burada tek kaynak kullanılır, iki yerde fallback tutulmaz.
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
        serif: ['var(--font-serif)'],
      },
      colors: {
        // Mürekkep — sıcak nötr skala
        slate: {
          50: '#f7f5ef', 100: '#edeae0', 200: '#dcd8ca', 300: '#bfbaa9',
          400: '#94907f', 500: '#6f6b5d', 600: '#57534a', 700: '#423f37',
          800: '#2c2a25', 900: '#1e1c18', 950: '#131210',
        },
        // Çam / petrol — birincil
        indigo: {
          50: '#eef4f2', 100: '#d8e6e2', 200: '#b4cec8', 300: '#87afa7',
          400: '#6aa39a', 500: '#3f7c72', 600: '#2f635b', 700: '#275048',
          800: '#203f3a', 900: '#1a332f', 950: '#0d1b19',
        },
        // Adaçayı — gelir
        emerald: {
          50: '#eff6f0', 100: '#dcebde', 200: '#bcd8c2', 300: '#95bfa0',
          400: '#6fa37f', 500: '#4f8a63', 600: '#3f7050', 700: '#335c43',
          800: '#2a4936', 900: '#233c2e', 950: '#11201a',
        },
        // Terracotta / kil — gider
        rose: {
          50: '#faf1ec', 100: '#f3ded3', 200: '#e5bea9', 300: '#d89a76',
          400: '#cd7c58', 500: '#bb603e', 600: '#9f4c2f', 700: '#833d26',
          800: '#68301f', 900: '#552818', 950: '#2e150c',
        },
        // Okra altını — vergi & vurgu
        amber: {
          50: '#faf5e9', 100: '#f2e7c8', 200: '#e4d099', 300: '#d4b86e',
          400: '#c8a04b', 500: '#b3892e', 600: '#957022', 700: '#785a1d',
          800: '#5c4517', 900: '#4a3813', 950: '#281e0a',
        },
        // Pus mavisi — bilgi
        sky: {
          50: '#f0f4f8', 100: '#dee7ef', 200: '#c0d0de', 300: '#9fb6ca',
          400: '#7f9cba', 500: '#5e80a3', 600: '#4b6886', 700: '#3d5469',
          800: '#324354', 900: '#2a3745', 950: '#161e26',
        },
        // Erik — ikincil vurgu
        violet: {
          50: '#f6f1f7', 100: '#eadfec', 200: '#d5c2d8', 300: '#bfa4c4',
          400: '#a988b0', 500: '#8f6a97', 600: '#76547d', 700: '#5f4465',
          800: '#4b364f', 900: '#3d2c41', 950: '#211724',
        },
        // Okaliptüs
        teal: {
          50: '#eef6f3', 100: '#d9eae3', 200: '#b5d5c9', 300: '#8cbcab',
          400: '#69a78f', 500: '#4b8a74', 600: '#3b6f5e', 700: '#30594c',
          800: '#28463d', 900: '#213a33', 950: '#101f1b',
        },
        // Su yeşili
        cyan: {
          50: '#eff5f5', 100: '#dceaea', 200: '#bcd6d8', 300: '#93bcbf',
          400: '#7eb3b9', 500: '#5b969d', 600: '#487a80', 700: '#3b6166',
          800: '#314d51', 900: '#2a4043', 950: '#142224',
        },
        brand: {
          pine: 'rgba(47,99,91,<alpha-value>)',
          sage: 'rgba(79,138,99,<alpha-value>)',
          gold: 'rgba(179,137,46,<alpha-value>)',
          clay: 'rgba(187,96,62,<alpha-value>)',
        },
      },
      backgroundImage: {
        'grid-dark':  'linear-gradient(rgba(106,163,154,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(106,163,154,0.05) 1px, transparent 1px)',
        'grid-light': 'linear-gradient(rgba(47,99,91,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(47,99,91,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      animation: {
        float:        'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        blink:        'blink 1.1s step-end infinite',
        marquee:      'marquee 38s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-16px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
