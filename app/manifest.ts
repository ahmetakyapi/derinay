import type { MetadataRoute } from 'next'

/**
 * PWA manifesti — Simay paneli telefonun ana ekranına eklediğinde
 * uygulama gibi (adres çubuğu olmadan, kendi ikonu ve açılış rengiyle) açılır.
 * iOS manifest ikonlarını kullanmaz; orada app/apple-icon.tsx devrededir.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Derinay — Atölye',
    short_name: 'Derinay',
    description:
      'Psikologlar için gelir-gider, fatura, vergi ve danışan takibini tek panelde toplayan sakin finans yönetimi.',
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f2e9',
    theme_color: '#f6f2e9',
    lang: 'tr',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  }
}
