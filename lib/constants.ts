// ─── Statüler & tipler ──────────────────────────────────────────────────────

export const CLIENT_STATUSES = ['active', 'paused', 'completed'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const SESSION_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const TX_TYPES = ['income', 'expense'] as const
export type TxType = (typeof TX_TYPES)[number]

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

// ─── Etiket sözlükleri (Türkçe görünen metinler) ────────────────────────────

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active:    'Aktif',
  paused:    'Duraklatıldı',
  completed: 'Tamamlandı',
}

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi',
  no_show:   'Gelmedi',
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft:   'Taslak',
  sent:    'Gönderildi',
  paid:    'Ödendi',
  overdue: 'Gecikmiş',
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash:     'Nakit',
  card:     'Kart',
  transfer: 'Havale/EFT',
}

// Statü → renk anahtarı (StatusBadge bunu kullanır)
export const STATUS_TONE: Record<string, 'emerald' | 'amber' | 'slate' | 'sky' | 'red'> = {
  active: 'emerald', paused: 'amber', completed: 'slate',
  scheduled: 'sky', cancelled: 'red', no_show: 'amber',
  draft: 'slate', sent: 'sky', paid: 'emerald', overdue: 'red',
}

// ─── Kategoriler ─────────────────────────────────────────────────────────────

export const INCOME_CATEGORIES = [
  'Seans geliri',
  'Online seans',
  'Grup terapisi',
  'Danışmanlık',
  'Eğitim / atölye',
  'Diğer gelir',
] as const

export const EXPENSE_CATEGORIES = [
  'Ofis kirası',
  'Faturalar (elektrik/su/internet)',
  'Süpervizyon',
  'Eğitim / sertifika',
  'Yazılım & abonelikler',
  'Pazarlama',
  'Ulaşım',
  'Vergi & SGK',
  'Diğer gider',
] as const

export const CATEGORY_BY_TYPE: Record<TxType, readonly string[]> = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
}

// ─── Vergi oranları (tahmini) ────────────────────────────────────────────────

export const TAX = {
  /** Standart KDV oranı (%) */
  KDV_RATE: 20,
  /** Basitleştirilmiş gelir vergisi tahmin oranı (%) — net kâr üzerinden */
  INCOME_TAX_ESTIMATE_RATE: 20,
} as const

// ─── Danışan etiket renkleri (avatar) ────────────────────────────────────────

export const CLIENT_COLORS = [
  'indigo', 'emerald', 'sky', 'violet', 'amber', 'rose', 'teal', 'cyan',
] as const
export type ClientColor = (typeof CLIENT_COLORS)[number]

// Tailwind sınıf eşlemesi (avatar arka planı için — JIT'in görmesi adına tam yazıldı)
export const CLIENT_COLOR_BG: Record<string, string> = {
  indigo:  'from-indigo-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  sky:     'from-sky-500 to-cyan-500',
  violet:  'from-violet-500 to-purple-500',
  amber:   'from-amber-500 to-orange-500',
  rose:    'from-rose-500 to-pink-500',
  teal:    'from-teal-500 to-emerald-500',
  cyan:    'from-cyan-500 to-sky-500',
}

export const CURRENCY = 'TRY' as const
export const LOCALE = 'tr-TR' as const

// ─── İşletme bilgisi (fatura başlığı) ────────────────────────────────────────
// Faturalarda görünen bilgiler — kendi bilgilerinle güncelle.
export const BUSINESS = {
  name: 'Derinay',
  owner: 'Uzm. Psk. [Ad Soyad]',
  title: 'Klinik Psikolog',
  taxOffice: '[Vergi Dairesi]',
  taxId: '[VKN / TC No]',
  address: '[Adres satırı, İlçe / İl]',
  phone: '[05xx xxx xx xx]',
  email: '[ornek@mail.com]',
} as const
