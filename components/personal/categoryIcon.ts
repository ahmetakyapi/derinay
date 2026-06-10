import {
  ShoppingBasket,
  Coffee,
  Bus,
  Home,
  Plug,
  HeartPulse,
  Shirt,
  Clapperboard,
  MonitorSmartphone,
  Sparkles,
  Gift,
  Plane,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

// Kişisel harcama kategorisi → ikon (anahtar kelimeyle eşler, serbest metinle de çalışır)
const PERSONAL_ICONS: [RegExp, LucideIcon][] = [
  [/market|gıda/i, ShoppingBasket],
  [/yemek|kafe|kahve|restoran/i, Coffee],
  [/ulaşım|otobüs|metro|taksi|benzin/i, Bus],
  [/kira/i, Home],
  [/fatura|elektrik|su|internet/i, Plug],
  [/sağlık|eczane|doktor/i, HeartPulse],
  [/giyim|kıyafet|ayakkabı/i, Shirt],
  [/eğlence|sinema|konser|oyun/i, Clapperboard],
  [/abonelik|netflix|spotify/i, MonitorSmartphone],
  [/bakım|kuaför|kozmetik/i, Sparkles],
  [/hediye/i, Gift],
  [/tatil|seyahat|uçak|otel/i, Plane],
]

export function personalCategoryIcon(category: string): LucideIcon {
  for (const [re, icon] of PERSONAL_ICONS) if (re.test(category)) return icon
  return Wallet
}
