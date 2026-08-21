import Link from 'next/link'
import { UserX } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata = { title: 'Danışan bulunamadı' }

/**
 * Danışan kaydı yoksa (silinmiş ya da bağlantı bozuksa) panel kabuğunun
 * İÇİNDE kalan bir boş durum — kök 404'ün tam ekran haline düşmez.
 */
export default function ClientNotFound() {
  return (
    <EmptyState
      icon={UserX}
      title="Bu danışan bulunamadı"
      description="Kayıt silinmiş ya da bağlantı geçersiz olabilir."
      action={
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500"
        >
          Danışan listesine dön
        </Link>
      }
    />
  )
}
