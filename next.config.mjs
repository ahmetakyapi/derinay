/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: {
      // Yedek geri yükleme (JSON, avatar data-URI'leriyle) için yükseltildi
      bodySizeLimit: '16mb',
    },
  },
}

export default nextConfig
