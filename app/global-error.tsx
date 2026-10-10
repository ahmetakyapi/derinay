'use client'

import { useEffect } from 'react'

/**
 * Kök layout'un kendisi patlarsa devreye giren son savunma hattı.
 * app/error.tsx layout'un İÇİNDE render edilir; layout çökerse çalışamaz —
 * bu yüzden global-error kendi <html>/<body>'sini kurar ve globals.css'e
 * güvenmez (stil dosyası da yüklenmemiş olabilir → inline stil).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4eee2',
          color: '#2c2a25',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '1.5rem',
        }}
      >
        <main
          style={{
            maxWidth: '26rem',
            width: '100%',
            textAlign: 'center',
            background: 'rgba(255,253,247,0.96)',
            border: '1px solid rgba(60,55,40,0.12)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 24px 60px -30px rgba(60,55,40,0.45)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#8a6a22',
            }}
          >
            ✦ Derinay
          </p>
          <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>
            Uygulama açılamadı
          </h1>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.9rem', color: '#57534a', lineHeight: 1.6 }}>
            Beklenmedik bir hata oluştu. Sayfayı yenilemek çoğu zaman yeterlidir.
          </p>
          {error.digest && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94907f' }}>
              kod: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              cursor: 'pointer',
              border: 0,
              borderRadius: '0.75rem',
              background: '#2f635b',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.7rem 1.4rem',
            }}
          >
            Tekrar Dene
          </button>
        </main>
      </body>
    </html>
  )
}
