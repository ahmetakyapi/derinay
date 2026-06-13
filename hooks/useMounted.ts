'use client'

import { useEffect, useState } from 'react'

/**
 * İstemcide mount olduktan sonra true döner. SSR/ilk render'da false.
 * Recharts ResponsiveContainer gibi yalnızca istemcide doğru ölçülen
 * bileşenleri hydration uyuşmazlığı olmadan render etmek için kullanılır.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
