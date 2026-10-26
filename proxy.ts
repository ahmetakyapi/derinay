export { auth as proxy } from '@/lib/auth'

// Korunan alanlar — landing (/), /login ve /api/health herkese açık kalır.
// Next 16: `middleware` → `proxy` (dosya ve dışa aktarım adı); proxy her zaman
// Node çalışma zamanında koşar. lib/auth.ts yine de DB'siz kalır (bkz. orası).
export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/reports/:path*', '/clients/:path*', '/api/export'],
}
