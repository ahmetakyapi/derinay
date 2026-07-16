import { ImageResponse } from 'next/og'

/**
 * iOS ana ekran ikonu (180×180 PNG). iOS köşeleri kendisi yuvarlar —
 * bu yüzden tam kanama mürekkep zemin + ortada orkide damgası.
 */

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2c2a25, #131210)',
        }}
      >
        <svg width="116" height="116" viewBox="0 0 24 24" fill="none">
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
        {/* Altın nokta — marka imzası */}
        <div
          style={{
            position: 'absolute',
            top: 26,
            right: 26,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: '#c8a04b',
          }}
        />
      </div>
    ),
    size,
  )
}
