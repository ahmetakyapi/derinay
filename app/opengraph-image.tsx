import { ImageResponse } from 'next/og'

/**
 * OG görseli — link paylaşımlarında görünen kart (1200×630).
 * Atölye kimliği: fildişi kâğıt + suluboya yıkamaları + mürekkep damgası +
 * sıkı grotesk manşet (uygulamayla aynı aile: Schibsted Grotesk). Fontlar
 * Google Fonts'tan istek anında çekilir; çekilemezse varsayılan fontla
 * (tasarım bozulmadan) render edilir.
 */

export const alt = 'Derinay — Psikologlar için finans & danışan takibi'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TITLE = 'Derinay'
const SUBTITLE = 'Psikologlar için finans & danışan takibi'
const EYEBROW = 'ATÖLYE · KLİNİK PANELİ'

async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)
    ).text()
    const url = css.match(/src: url\((.+?)\)/)?.[1]
    if (!url) return null
    const res = await fetch(url)
    return res.ok ? await res.arrayBuffer() : null
  } catch {
    return null
  }
}

function OrchidStamp() {
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: 128,
        height: 128,
        borderRadius: 32,
        background: 'linear-gradient(135deg, #2c2a25, #131210)',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 24px 48px -16px rgba(30,28,24,0.45)',
      }}
    >
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <g fill="#faf5e9">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="12"
              cy="6.3"
              rx="2.45"
              ry="5.1"
              opacity="0.92"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="2.35" />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          top: -8,
          right: -8,
          width: 26,
          height: 26,
          borderRadius: 999,
          background: '#c8a04b',
          border: '5px solid #f6f2e9',
        }}
      />
    </div>
  )
}

export default async function OgImage() {
  const [display, body] = await Promise.all([
    loadGoogleFont('Schibsted+Grotesk:wght@800', TITLE),
    loadGoogleFont('Schibsted+Grotesk:wght@500', `${SUBTITLE}${EYEBROW}`),
  ])

  const fonts = [
    display && { name: 'DerinayDisplay', data: display, style: 'normal' as const, weight: 800 as const },
    body && { name: 'DerinayBody', data: body, style: 'normal' as const, weight: 500 as const },
  ].filter((f): f is NonNullable<typeof f> => f !== null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f6f2e9',
          // Satori radial-gradient'te boyut sözdizimini desteklemez — 'circle at' kullan
          backgroundImage:
            'radial-gradient(circle at 10% -10%, rgba(63,124,114,0.16) 0%, transparent 45%), ' +
            'radial-gradient(circle at 100% 0%, rgba(179,137,46,0.14) 0%, transparent 40%), ' +
            'radial-gradient(circle at 70% 115%, rgba(187,96,62,0.10) 0%, transparent 45%)',
        }}
      >
        <OrchidStamp />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 44,
            fontFamily: 'DerinayBody',
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: 10,
            color: '#957022',
          }}
        >
          {/* ✦ glifi fontlarda yok — altın nokta ile aynı jest */}
          <div style={{ width: 9, height: 9, borderRadius: 999, background: '#c8a04b' }} />
          {EYEBROW}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 10,
            fontFamily: 'DerinayDisplay',
            fontWeight: 800,
            fontSize: 130,
            color: '#1e1c18',
            letterSpacing: -5,
          }}
        >
          {TITLE}
        </div>
        {/* Fırça vurgusu — başlık altındaki el çizimi jest */}
        <svg width="220" height="16" viewBox="0 0 64 8" fill="none" preserveAspectRatio="none">
          <path
            d="M1.5 5.8C13 2.4 38 1.6 62.5 4.6"
            stroke="rgba(179,137,46,0.85)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            display: 'flex',
            marginTop: 22,
            fontFamily: 'DerinayBody',
            fontWeight: 500,
            fontSize: 34,
            color: '#57534a',
          }}
        >
          {SUBTITLE}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
