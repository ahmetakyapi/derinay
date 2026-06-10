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
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
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
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        blink:        'blink 1.1s step-end infinite',
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
      },
    },
  },
  plugins: [],
}

export default config
