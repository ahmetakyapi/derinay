/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOT: `images` yapılandırması yok — projede `next/image` KULLANILMIYOR.
  // Danışan avatarları istemcide küçültülmüş data-URI'lerdir ve düz <img> ile
  // basılır (next/image data-URI'yi optimize edemez). Şablondan kalan
  // `remotePatterns: avatars.githubusercontent.com` kaydı, hiçbir uzak görsel
  // yüklenmediği için gereksiz yere izin yüzeyi açıyordu; kaldırıldı.
  experimental: {
    serverActions: {
      // Yedek geri yükleme (JSON, avatar data-URI'leriyle) için yükseltildi
      bodySizeLimit: '16mb',
    },
  },
}

export default nextConfig
