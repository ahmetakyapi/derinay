'use client'

import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { initials } from '@/lib/format'
import { CLIENT_COLOR_BG } from '@/lib/constants'
import { cn } from '@/lib/utils'

const AVATAR_SIZE = 192 // px — data-URI olarak DB'de tutulur, küçük olmalı
const JPEG_QUALITY = 0.85

/**
 * Danışan fotoğrafı seçici — dosyayı istemcide kare kırpıp ~192px'e küçültür,
 * data-URI üretir (harici depolama gerekmez). Fotoğraf yoksa renkli baş harf önizlemesi.
 */
export function AvatarPicker({
  name,
  color,
  value,
  onChange,
}: {
  name: string
  color: string
  value: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // Kare kırp (cover) + küçült
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const canvas = document.createElement('canvas')
        canvas.width = AVATAR_SIZE
        canvas.height = AVATAR_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
        onChange(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // aynı dosya tekrar seçilebilsin
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={name || 'Danışan fotoğrafı'}
            className="h-16 w-16 rounded-2xl object-cover shadow-lg shadow-black/10 ring-1 ring-slate-900/10 dark:ring-white/10"
          />
        ) : (
          <span
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg shadow-black/10',
              CLIENT_COLOR_BG[color] ?? CLIENT_COLOR_BG.indigo,
            )}
          >
            {name.trim() ? initials(name) : '?'}
          </span>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Fotoğrafı kaldır"
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow transition-transform hover:scale-110"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-500/25 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
        >
          <Camera className="h-3.5 w-3.5" />
          {value ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}
        </button>
        <p className="mt-1.5 text-[11px] text-slate-400">Opsiyonel — yoksa baş harfler görünür</p>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  )
}
