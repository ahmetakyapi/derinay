// ─── Statüler & tipler ──────────────────────────────────────────────────────

export const CLIENT_STATUSES = ['active', 'paused', 'completed'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const SESSION_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const
export type SessionStatus = (typeof SESSION_STATUSES)[number]

export const TX_TYPES = ['income', 'expense'] as const
export type TxType = (typeof TX_TYPES)[number]

export const TX_SCOPES = ['business', 'personal'] as const
export type TxScope = (typeof TX_SCOPES)[number]

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

// ─── Etiket sözlükleri (Türkçe görünen metinler) ────────────────────────────
// KURAL: Bunlar rozet / sekme / filtre / kategori etiketidir → **Title Case**.
// Elle yazılır; `capitalize` veya `.toUpperCase()` KULLANILMAZ (Türkçede i → I
// üretir, İ değil). Küçük bağlaçlar (ve, ile, için) başta değilse küçük kalır;
// kısaltmalar olduğu gibi durur (KDV, CSV, VKN, EFT).

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active:    'Aktif',
  paused:    'Duraklatıldı',
  completed: 'Tamamlandı',
}

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  scheduled: 'Planlandı',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
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

// ─── Seans Defteri: not türleri & duygu skalası ──────────────────────────────

export const NOTE_KINDS = ['session', 'observation', 'homework', 'important'] as const
export type NoteKind = (typeof NOTE_KINDS)[number]

export const NOTE_KIND_LABEL: Record<NoteKind, string> = {
  session:     'Seans Notu',
  observation: 'Gözlem',
  homework:    'Ödev',
  important:   'Önemli',
}

export const NOTE_KIND_TONE: Record<NoteKind, 'indigo' | 'sky' | 'amber' | 'red'> = {
  session: 'indigo', observation: 'sky', homework: 'amber', important: 'red',
}

/** Danışanın seanstaki duygu durumu — 5'li skala (duygu izleği bunu kullanır) */
export const MOODS = ['great', 'good', 'neutral', 'low', 'difficult'] as const
export type Mood = (typeof MOODS)[number]

export const MOOD_LABEL: Record<Mood, string> = {
  great:     'Çok İyi',
  good:      'İyi',
  neutral:   'Nötr',
  low:       'Düşük',
  difficult: 'Zorlu',
}

// Tam yazılmış Tailwind sınıfları (JIT) — duygu noktaları
export const MOOD_BG: Record<Mood, string> = {
  great:     'bg-emerald-500',
  good:      'bg-teal-400',
  neutral:   'bg-amber-400',
  low:       'bg-sky-500',
  difficult: 'bg-rose-500',
}

export const MOOD_RING: Record<Mood, string> = {
  great:     'ring-emerald-500/40',
  good:      'ring-teal-400/40',
  neutral:   'ring-amber-400/40',
  low:       'ring-sky-500/40',
  difficult: 'ring-rose-500/40',
}

// ─── Kategoriler ─────────────────────────────────────────────────────────────

export const INCOME_CATEGORIES = [
  'Seans Geliri',
  'Online Seans',
  'Grup Terapisi',
  'Danışmanlık',
  'Eğitim / Atölye',
  'Diğer Gelir',
] as const

export const EXPENSE_CATEGORIES = [
  'Ofis Kirası',
  'Faturalar (elektrik/su/internet)',
  'Süpervizyon',
  'Eğitim / Sertifika',
  'Yazılım & Abonelikler',
  'Pazarlama',
  'Ulaşım',
  'Vergi & SGK',
  'Diğer Gider',
] as const

export const CATEGORY_BY_TYPE: Record<TxType, readonly string[]> = {
  income: INCOME_CATEGORIES,
  expense: EXPENSE_CATEGORIES,
}

// Kişisel harcama kategorileri (iş dışı) — kullanıcı özel kategori de yazabilir
export const PERSONAL_CATEGORIES = [
  'Market',
  'Yemek & Kafe',
  'Ulaşım',
  'Kira',
  'Faturalar',
  'Sağlık',
  'Giyim',
  'Eğlence',
  'Abonelikler',
  'Kişisel Bakım',
  'Hediye',
  'Tatil',
  'Diğer',
] as const

/** Türkiye'de yürürlükteki KDV oranları — makbuz ve gider belgesi seçicileri */
export const KDV_RATE_OPTIONS = [0, 1, 10, 20] as const

// ─── Vergi oranları (tahmini) ────────────────────────────────────────────────

export const TAX = {
  /** Standart KDV oranı (%) */
  KDV_RATE: 20,
  /** Basitleştirilmiş gelir vergisi tahmin oranı (%) — net kâr üzerinden */
  INCOME_TAX_ESTIMATE_RATE: 20,
  /** Serbest meslek makbuzu gelir vergisi stopaj (tevkifat) oranı (%) */
  STOPAJ_RATE: 20,
} as const

// ─── Danışan etiket renkleri (avatar) ────────────────────────────────────────

export const CLIENT_COLORS = [
  'indigo', 'emerald', 'sky', 'violet', 'amber', 'rose', 'teal', 'cyan',
] as const
export type ClientColor = (typeof CLIENT_COLORS)[number]

/** Renk seçicinin erişilebilir adı — İngilizce token ekran okuyucuya okunmamalı */
export const CLIENT_COLOR_LABEL: Record<ClientColor, string> = {
  indigo:  'Çam',
  emerald: 'Adaçayı',
  sky:     'Pus Mavisi',
  violet:  'Erik',
  amber:   'Okra Altını',
  rose:    'Terracotta',
  teal:    'Okaliptüs',
  cyan:    'Su Yeşili',
}

/**
 * Danışan rengi → nokta sınıfı. Takvimlerde/ajandada kullanılır.
 * TEK KAYNAK: üç dosyada kopyalanınca tonları da kaymıştı (400 vs 500).
 */
export const CLIENT_COLOR_DOT: Record<string, string> = {
  indigo:  'bg-indigo-500',
  emerald: 'bg-emerald-500',
  sky:     'bg-sky-500',
  violet:  'bg-violet-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  teal:    'bg-teal-500',
  cyan:    'bg-cyan-500',
}

// Tailwind sınıf eşlemesi (avatar arka planı için — JIT'in görmesi adına tam yazıldı)
// Yalnızca Atölye paletine remap edilmiş aileler kullanılır (blue/purple/orange/pink YOK).
export const CLIENT_COLOR_BG: Record<string, string> = {
  indigo:  'from-indigo-500 to-indigo-700',
  emerald: 'from-emerald-500 to-teal-600',
  sky:     'from-sky-500 to-sky-700',
  violet:  'from-violet-500 to-violet-700',
  amber:   'from-amber-500 to-rose-500',
  rose:    'from-rose-500 to-rose-700',
  teal:    'from-teal-500 to-emerald-600',
  cyan:    'from-cyan-500 to-teal-600',
}

export const CURRENCY = 'TRY' as const
export const LOCALE = 'tr-TR' as const

// ─── İşletme bilgisi (fatura/makbuz başlığı) ─────────────────────────────────
// Varsayılanlar — Ayarlar sayfasından düzenlenince settings tablosundan okunur.
export type BusinessInfo = {
  name: string
  owner: string
  title: string
  taxOffice: string
  taxId: string
  address: string
  phone: string
  email: string
  iban: string
}

export const BUSINESS: BusinessInfo = {
  name: 'Derinay',
  owner: '',
  title: 'Klinik Psikolog',
  taxOffice: '[Vergi Dairesi]',
  taxId: '[VKN / TC No]',
  address: '[Adres satırı, İlçe / İl]',
  phone: '[05xx xxx xx xx]',
  email: '[ornek@mail.com]',
  iban: '',
}

/** Ayarlar'da doldurulmamış alanların belgelerde göründüğü yer tutucu */
export const OWNER_PLACEHOLDER = '[Ad Soyad]' as const

/**
 * Bir işletme alanı gerçekten doldurulmuş mu?
 * Varsayılanlar köşeli parantezli yer tutucudur ("[Vergi Dairesi]") — bunlar
 * belgede "burayı doldur" işareti olarak durur ama DOLU sayılmaz.
 */
export function isPlaceholderValue(value: string): boolean {
  const v = value.trim()
  return v.length === 0 || (v.startsWith('[') && v.endsWith(']'))
}

/** İşletme kimliğinde makbuz için anlamlı alanlar + Türkçe etiketleri */
export const BUSINESS_FIELD_LABELS: Partial<Record<keyof BusinessInfo, string>> = {
  owner: 'Ad Soyad',
  taxOffice: 'Vergi Dairesi',
  taxId: 'VKN / TC Kimlik No',
  address: 'Adres',
  phone: 'Telefon',
  email: 'E-posta',
}

// ─── Hatırlatma mesajı şablonu ───────────────────────────────────────────────
// Yer tutucular: {ad} = danışanın adı, {tarih} = seans tarihi+saati, {terapist} = terapist adı
export const REMINDER_TEMPLATE_DEFAULT =
  'Merhaba {ad} 🌿 {tarih} saatindeki seansımızı hatırlatmak isterim. Görüşmek üzere! — {terapist}'

/**
 * Tahsilat hatırlatması — bekleyen bakiye için ayrı, daha ölçülü bir metin.
 * Seans hatırlatmasıyla AYNI şablon kullanılamaz: biri randevu, diğeri para.
 * `{tarih}` burada bugünün tarihidir; tutar bilinçli olarak YAZILMAZ —
 * WhatsApp'a rakam düşürmek gizlilik açısından gereksiz risk.
 */
export const DEBT_REMINDER_TEMPLATE_DEFAULT =
  'Merhaba {ad}, bekleyen bir ödemeniz göründüğünü fark ettim. Uygun olduğunuzda ' +
  'birlikte bakabiliriz. İyi günler — {terapist}'

// Uygulama kimliği — panelde/oturumda görünen sabit marka adı.
// Kullanıcının kendi adı Ayarlar → İşletme Kimliği'nden gelir (BUSINESS.owner),
// burada KİŞİ adı tutulmaz.
export const APP = {
  name: 'Derinay',
  tagline: 'Atölye',
} as const
