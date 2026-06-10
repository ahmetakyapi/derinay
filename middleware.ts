export { auth as middleware } from '@/lib/auth'

// Korunan alanlar — landing (/), /login ve /api/health herkese açık kalır
export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/reports/:path*', '/api/export'],
}
