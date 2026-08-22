'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Seans Defteri taslağı — yazılmakta olan notu tarayıcıda saklar.
 *
 * NEDEN: Not, panelin en pahalı içeriği. Uzun bir seans notu yazarken sekme
 * yenilenirse, yanlışlıkla geri gidilirse ya da uygulama tazelenirse metin
 * tamamen kayboluyordu — ve tekrar hatırlayarak yazmak mümkün değil.
 *
 * GİZLİLİK: Taslak klinik metin içerir, bu yüzden yalnızca cihazda (localStorage)
 * ve YALNIZCA gönderilene kadar durur. Başarılı kayıtta silinir, kullanıcı elle
 * silebilir ve çıkış yapıldığında tüm taslaklar temizlenir (`clearAllNoteDrafts`).
 * Sunucuya hiçbir zaman gönderilmez.
 */

const PREFIX = 'derinay:note-draft:'
const SAVE_DEBOUNCE_MS = 600

export type NoteDraft = {
  title: string
  body: string
  kind: string
  mood: string | null
  savedAt: number
}

/** Çıkışta tüm not taslaklarını sil — paylaşılan cihazda metin arkada kalmasın */
export function clearAllNoteDrafts() {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* localStorage kapalıysa sessizce geç */
  }
}

export function useNoteDraft(clientId: string) {
  const key = PREFIX + clientId
  /** Mount'ta bulunan taslak — kullanıcıya "geri yüklendi" derken gösterilir */
  const [restored, setRestored] = useState<NoteDraft | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  // Mount'ta oku. SSR ile uyuşmazlık olmasın diye effect içinde.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return
      const d = JSON.parse(raw) as NoteDraft
      if (d?.body?.trim() || d?.title?.trim()) setRestored(d)
      else localStorage.removeItem(key)
    } catch {
      /* bozuk kayıt — yok say */
    }
  }, [key])

  const save = useCallback(
    (draft: Omit<NoteDraft, 'savedAt'>) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        try {
          if (!draft.body.trim() && !draft.title.trim()) localStorage.removeItem(key)
          else localStorage.setItem(key, JSON.stringify({ ...draft, savedAt: Date.now() }))
        } catch {
          /* kota dolu / kapalı — taslak olmadan devam */
        }
      }, SAVE_DEBOUNCE_MS)
    },
    [key],
  )

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    try {
      localStorage.removeItem(key)
    } catch {
      /* yok say */
    }
    setRestored(null)
  }, [key])

  // Unmount'ta bekleyen yazmayı düşür (aksi halde temizlenen taslak geri yazılır)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { restored, dismissRestored: () => setRestored(null), save, clear }
}
