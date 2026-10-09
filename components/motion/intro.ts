'use client'

import { useSyncExternalStore } from 'react'

/**
 * Açılış perdesinin durumu — modül düzeyinde küçük bir depo.
 *
 * Landing kahramanı perde kalkarken oynamalı; perde hiç oynamadıysa (oturumda
 * ikinci ziyaret, hareket azaltma) hemen oynamalı. İkisini de bu depo söyler.
 * Değer modülde yaşar: istemci tarafı gezinmelerde (panel → landing) perde
 * tekrar beklenmez.
 */
export const INTRO_KEY = 'derinay:intro'

let done = false
const listeners = new Set<() => void>()

export function markIntroDone() {
  if (done) return
  done = true
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** Perde kalktı mı? SSR ve hidrasyon anında daima false. */
export function useIntroDone() {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => false,
  )
}

export function subscribeIntro(cb: () => void) {
  return subscribe(cb)
}

export function isIntroDone() {
  return done
}
