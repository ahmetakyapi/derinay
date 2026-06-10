'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'

/**
 * Yazdır / PDF butonu. window.print() ile tarayıcının "PDF olarak kaydet"
 * diyaloğunu açar. ?auto=1 ile sayfa açılır açılmaz otomatik tetiklenir.
 */
export function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [auto])

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
    >
      <Printer className="h-4 w-4" /> Yazdır / PDF Kaydet
    </button>
  )
}
