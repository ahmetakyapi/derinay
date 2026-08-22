# Derinay — Proje Rehberi (CLAUDE.md)

> Bu dosya projenin **canlı dokümantasyonudur**. Yeni bir özellik eklerken önce burayı
> oku; mevcut desenleri, dosya konumlarını ve tuzakları takip et. Yapı değiştiğinde
> (yeni tablo, yeni sayfa, yeni desen) bu dosyayı da güncelle.

---

## 1. Proje Nedir

**Derinay**, tek kişilik bir klinik psikoloji pratiği için yönetim panelidir.
Amaç: gelir-gider, danışan, seans, fatura, ödeme, vergi ve kişisel harcamaları tek,
sakin ve görsel bir arayüzde toplamak.

- **Kullanan kişi**: panel sahibi tek terapist. Adı/unvanı **kodda tutulmaz** — Ayarlar →
  İşletme Kimliği'nden gelir (`getOwnerIdentity`). **Tek kullanıcılı parola kilidi VAR** (next-auth v5
  credentials, bkz. §9) — `APP_PASSWORD` + `AUTH_SECRET` env'leri zorunlu.
- **Dil**: Tüm arayüz **Türkçe**. Para **₺ / tr-TR**. Tarihler Türkçe ay/gün adları.
- **Marka**: Derinay, logo "D", fatura no öneki `DER-YYYY-NNN`.

---

## 2. Teknoloji Yığını

| Katman | Seçim | Not |
|--------|-------|-----|
| Framework | Next.js 14 App Router | Server Component varsayılan |
| Stil | Tailwind CSS 3 (`darkMode: 'class'`) | `postcss.config.js` ŞART (yoksa derlenmez) |
| Animasyon | Framer Motion 11 | GSAP yok. EASE = `[0.22,1,0.36,1]` |
| Grafik | Recharts | `components/charts/` altında, hepsi `'use client'`. Sayfalar **`charts/lazy`den import eder** (dynamic, ssr:false — Recharts ana pakete girmez) |
| DB | Neon Postgres + Drizzle ORM | `@neondatabase/serverless` (pg değil) |
| Tema | next-themes | **light varsayılan** ("kâğıt galeri") + dark ("gece galerisi") — enableSystem kapalı |
| İkonlar | lucide-react | |
| Deploy | Vercel (bölge `fra1`) | GitHub: `ahmetakyapi/derinay` (private) |

---

## 3. Komutlar

```bash
npm run dev        # geliştirme — http://localhost:3000
npm run build      # production build (DEV AÇIKKEN ÇALIŞTIRMA — .next bozulur, bkz §10)
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # next lint
npm run db:push    # şemayı Neon'a uygula (drizzle-kit push)
npm run db:seed    # örnek Türkçe veriyle doldur (scripts/seed.ts — önce TÜM tabloları siler)
npm run db:studio  # Drizzle Studio
```

Kurulum: `.env.local` içine `DATABASE_URL` (Neon) → `db:push` → `db:seed` → `dev`.

---

## 4. Mimari — Veri Akışı

**Okuma** (Server Component → DB):
- Sayfalar Server Component'tir, doğrudan `lib/queries.ts` fonksiyonlarını `await` eder.
- `queries.ts` `import 'server-only'` ile korunur, Drizzle ile sorgular, **düz/serileştirilebilir
  obje** döner (numeric → `Number()`).

**Yazma** (Client → Server Action):
- Mutasyonlar `app/actions/*.ts` içinde `'use server'` fonksiyonlardır.
- Form bileşenleri (`components/forms/`) `'use client'`, `useTransition` + `router.refresh()` kullanır.
- Her action sonunda ilgili yolları `revalidatePath(...)` ile tazeler ve `{ ok, error? }` döner.
- API route YOK (sadece `app/api/health`). Yeni mutasyon = yeni action.

**DB bağlantısı** (`lib/db.ts`):
- **Lazy Proxy** — `neon()` yalnızca ilk sorguda çağrılır. Böylece `DATABASE_URL` olmadan
  `next build` patlamaz. Dashboard route grubu `export const dynamic = 'force-dynamic'`.

---

## 5. Dizin Yapısı

```
app/
  layout.tsx                       # ThemeProvider + ThemeColorSync, Schibsted Grotesk + IBM Plex Mono (subset latin+latin-ext), metadataBase/OG/noindex
  globals.css                      # tema tokenları, .glass/.surface/.chip/.field, print + dark/light
  page.tsx                         # Landing (hero/özellikler/CTA) — 'use client'
  error.tsx / not-found.tsx        # Atölye dilinde hata sınırı + 404 (Next varsayılanı ASLA görünmesin)
  manifest.ts                      # PWA manifesti (ana ekrana ekleme — standalone, /dashboard)
  opengraph-image.tsx              # OG kartı (ImageResponse — sıkı grotesk manşet, mürekkep damgası)
  apple-icon.tsx                   # iOS ana ekran ikonu (180px PNG, ImageResponse)
  (dashboard)/
    layout.tsx                     # DashboardShell + force-dynamic
    dashboard/
      page.tsx                     # Genel Bakış: KPI + haftalık takvim + grafikler + son işlemler
      agenda/page.tsx              # Ajanda: haftalık saat ızgarası (sürükle-bırak) + aylık görünüm
      clients/page.tsx             # Danışan listesi (kart grid + arama + statü/etiket filtresi)
      waitlist/page.tsx            # Bekleme listesi (başvuru adayları → tek tıkla danışana çevir)
      backup/page.tsx              # Yedekleme: CSV/JSON dışa aktarım kartları
      clients/[id]/page.tsx        # Danışan detayı: not/seans/ödeme/makbuz/düzenle/sil (+ doğum günü, no-show)
      finances/page.tsx            # Gelir & gider (scope=business)
      personal/page.tsx            # Kişisel harcamalar — gün bazlı takvim (scope=personal)
      invoices/page.tsx            # Makbuzlar (Serbest Meslek Makbuzu — KDV + stopaj, durum, PDF)
      payments/page.tsx            # Ödemeler
      taxes/page.tsx               # Vergi özeti (KDV + gelir vergisi tahmini + kesilen stopaj)
      settings/page.tsx            # Ayarlar: işletme/makbuz kimliği + hatırlatma şablonu (settings tablosu)
  invoices/[id]/print/page.tsx     # Yazdırılabilir Serbest Meslek Makbuzu (PDF) — dashboard kabuğu DIŞINDA
  reports/[year]/print/page.tsx    # Yıllık finans raporu (PDF) — muhasebeci formatı
  actions/                         # clients, transactions, invoices, payments, notes (+sessions), settings, waitlist, packages
lib/
  schema.ts        # Drizzle tablolar + tip çıkarımı
  constants.ts     # Statüler, kategoriler, etiketler, renkler, BUSINESS/USER, TAX oranları
  queries.ts       # Tüm okuma fonksiyonları (server-only)
  finance.ts       # calcMakbuz (KDV + stopaj — makbuzun TEK hesap yolu), estimateIncomeTax,
                   # taxSummary (kesilen stopajı gelir vergisinden MAHSUP eder)
  palette.ts       # Chart renkleri (CHART, CHART_SERIES) — Atölye paleti
  format.ts        # formatTRY, formatDate*, monthKey, durationSince, initials, pctChange
  quotes.ts        # Günün sözü (gün-deterministik) + greetingNow (Europe/Istanbul)
  db.ts            # lazy Drizzle/Neon proxy
  utils.ts         # cn()
  variants.ts      # Framer Motion varyantları + EASE
components/
  dashboard/       # DashboardShell (sidebar/topbar/drawer), PageHeader, PageTransition, WeekCalendar
  clients/         # NoteCard (Seans Defteri kartı), MoodTrail (duygu izleği)
  charts/          # AreaTrendChart, CategoryDonut, MonthlyBar, TaxRadial, CumulativeArea ('use client')
                   # lazy.tsx = TEK GİRİŞ: sayfalar grafikleri buradan import eder (dynamic+iskelet);
                   # yeni grafik → bileşeni yaz + lazy.tsx'e dynamic export ekle
  theme/           # ThemeColorSync — <meta theme-color>'ı uygulama temasıyla eşler
  forms/           # New*Dialog, EditClientDialog, NoteForm (tür+duygu), AvatarPicker, InvoiceStatusSelect
  ui/              # GlassCard, Modal, Field(Input/Select/Textarea), StatCard, SubmitButton,
                   # StatusBadge, StatusPillSelect, Avatar, EmptyState, DeleteButton, ConfirmDialog,
                   # AnimatedNumber
                   # (Button/Chip SİLİNDİ — hiçbir yerden import edilmiyordu; form gönderimi
                   #  için SubmitButton, pill rozetler için doğrudan Tailwind kullanılıyor)
  marketing/       # PanelPreview — landing'deki panel önizlemesi (ekran görüntüsü DEĞİL, kodla çizilir)
  invoice/         # PrintButton
scripts/seed.ts    # Demo veri üretimi
```

---

## 6. Veri Modeli (`lib/schema.ts`)

Tüm para alanları `numeric(12,2)` (string döner → `Number()`). Her FK'de `onDelete` açık.

- **users** — auth için rezerve (şu an kullanılmıyor).
- **clients** — danışan: name, email, phone, `status`(active/paused/completed), startDate,
  **birthDate** (opsiyonel — doğum günü hatırlatması), **consentGiven** (KVKK onam), sessionFee, colorTag,
  **avatarUrl** (istemcide ~192px'e küçültülmüş data-URI foto), tags[], notes.
- **sessions** — seans: clientId→cascade, date(timestamp), durationMin, `status`
  (scheduled/completed/cancelled/no_show), fee.
- **clientNotes** — Seans Defteri: clientId→cascade, title, body, **kind**(session/observation/
  homework/important), **mood**(great/good/neutral/low/difficult — duygu izleği), **pinned**.
- **transactions** — gelir/gider: `type`(income/expense), **`scope`(business/personal)**,
  amount, category(serbest metin), description, date, **`recurring`** (sabit kalem — 'sabit
  giderleri kopyala' bunu önceki aydan kopyalar), clientId→set null.
- **invoices** — Serbest Meslek Makbuzu: number(unique), clientId→set null, issueDate, dueDate,
  subtotal(=brüt ücret), kdvRate, kdvAmount, **stopajRate**, **stopajAmount** (gelir vergisi tevkifatı),
  total(=brüt − stopaj + KDV = tahsil edilen), `status`(draft/sent/paid/overdue), note.
  Hesap: `lib/finance.ts` → `calcMakbuz`. (UI'da "Makbuzlar" olarak geçer.)
- **payments** — tahsilat: clientId→cascade, invoiceId→set null, amount, date,
  `method`(cash/card/transfer), note.
- **waitlist** — bekleme listesi: name, phone, email, source, `priority`(normal/high), note.
  Tek tıkla danışana çevrilir (`convertWaitlist` → clients'a taşır, kaydı siler).
- **sessionPackages** — ön ödemeli seans paketi: clientId→cascade, totalSessions, pricePaid,
  purchaseDate, note. Kullanım = satın alma tarihinden sonra **tamamlanan** seans sayısı
  (`getClientDetail.activePackage` = en güncel paket + used/remaining). `recordIncome` ile
  ücret işletme geliri olarak da yazılabilir.
- **clientScores** — ilerleme ölçümü: clientId→cascade, label(ölçek adı), value, scaleMax(ops.),
  date, note. Danışan detayında en güncel ölçeğin zaman serisi `ScoreTrend` ile grafiklenir.
- **clientDocuments** — belge referansı: clientId→cascade, name, type, **url**, note. Dosya saklanmaz;
  KVKK gereği yalnızca kullanıcının kendi deposundaki (Drive/iCloud) bağlantısı tutulur.
- **clientGoals** — tedavi hedefleri: clientId→cascade, title, `status`(active/achieved/paused),
  note, achievedAt. Danışan detayında `GoalsCard` (ekle/tamamla/duraklat + ilerleme çubuğu).
- **settings** — anahtar-değer: `reminder_template` (hatırlatma), `business` (işletme/makbuz
  kimliği JSON) ve `tax` (vergi oranları JSON — kdvRate/stopajRate/incomeTaxRate).
  `getBusinessInfo()` / `getTaxSettings()` varsayılanların üstüne uygular; Ayarlar sayfasından düzenlenir.
  Vergi hesapları (`taxSummary`) ve makbuz varsayılanları bu oranları okur. Ayrıca `income_goal`
  (aylık gelir hedefi — dashboard ilerleme bandı) ve `last_backup_at` anahtarları da burada.
- **Otomatik vade**: `listInvoices`/`getDashboard` çağrılırken vadesi geçen 'sent' makbuzlar
  idempotent şekilde 'overdue' yapılır (`autoMarkOverdue`).
- **Çakışma kontrolü**: `createSession`/`updateSessionTime` üst üste binen seansı engeller
  (`findConflict` — iptal/gelmedi hariç); ajandada geçici pil ile gösterilir.

### `scope` kuralı (ÖNEMLİ)
`business` = kliniğin finansı (dashboard, finances, taxes burayı sayar).
`personal` = panel sahibinin özel günlük harcamaları (yalnızca **Kişisel** sekmesi). Dashboard ve
vergi sorguları **`scope='business'` ile filtreler** — kişisel harcama işi etkilemez.

---

## 7. Tasarım Sistemi — "Atölye" (sanat galerisi estetiği)

- **Kimlik**: Sanata önem veren kullanıcı için galeri/atölye estetiği. **Light varsayılan**:
  sıcak fildişi kâğıt (`#f6f2e9`) + suluboya yıkamaları (çam/altın/kil/pus) + grain dokusu.
  Dark: aynı paletin "gece galerisi" hali, zemin `#04070d`.
- **Palet (tailwind.config.ts'te remap — sınıf adları aynı, değerler Derinay paleti)**:
  `slate`→mürekkep (sıcak nötr), `indigo`→çam/petrol (birincil), `emerald`→adaçayı (gelir),
  `rose`→terracotta (gider), `amber`→okra altını (vergi/vurgu), `sky`→pus mavisi,
  `violet`→erik, `teal`/`cyan`→okaliptüs/su. **Default Tailwind `blue/purple/orange/pink`
  KULLANMA** — remap edilmediler, paletle çatışır.
- **Tipografi (ekosistem yığını — `~/dev-starter`, Mimio/Açılış Zili ile aynı)**:
  TEK aile **Schibsted Grotesk** (değişken 400–900, `latin`+`latin-ext`, `style: normal+italic`).
  Gövde ile başlık aynı aileyi kullanır; ayrım **ağırlık + optik sıkılıktan** gelir —
  `font-display` yalnızca tracking'i daraltır (`-0.032em`, 3xl+ için `-0.04em`), ağırlık
  SET ETMEZ (çağrı yerindeki `font-semibold/bold` kazanır). Tutar/tablo rakamı = IBM Plex Mono
  + `tabular-nums`. Bölüm başlıkları galeri etiketi stili:
  `text-xs font-bold uppercase tracking-[0.12em]`.
  **Dekoratif italik YOK** — italik yalnızca gerçek alıntıda (Günün Sözü, giriş ekranı sözü)
  ve not/açıklama satırında kullanılır.
  TUZAK: `next/font` `variable` adı CSS token adıyla aynı olursa dairesel referans oluşur —
  bu yüzden next/font tarafında `--font-sans-face` / `--font-mono-face` soneki kullanılır.
- **Chart renkleri**: `lib/palette.ts` (`CHART`, `CHART_SERIES`) — chart bileşenine hex yazma.
- Renkler `globals.css` CSS değişkenleri (`--pine/--sage/--gold/--clay/--mist`, `--paper/--line`)
  + Tailwind ile; **hardcoded hex yok**.
- **Yüzey sınıfları** (globals.css): `.glass` (kart), `.surface` (modal), `.chip` (pill),
  `.field`/`.field-label` (form). Hepsi dark+light varyantlı.
- **Title Case KURALI (metin yazarken ilk bakılacak yer)**:
  **Title Case olan** — sayfa/bölüm/kart başlıkları, modal başlıkları, düğme ve
  bağlantı metinleri, form alanı etiketleri (`<Field label>`), sekme adları, menü
  satırları, durum/kategori/filtre rozetleri (`lib/constants.ts` sözlükleri),
  tablo başlıkları, eylem adı veren `title` ipuçları.
  **Cümle düzeninde kalan** — gövde ve açıklama metni, `subtitle`, modal
  `description`, `placeholder`, `hint`, boş durum cümleleri ("Bu ay gider yok"),
  onay sorusu başlıkları ("Seans silinsin mi?"), hata sayfası cümleleri
  ("Bir şeyler ters gitti"), mono mikro etiketler ("son 1 ay", "3 gün önce").
  **Türkçe tuzağı**: `capitalize` sınıfı ve `.toUpperCase()`/`title()` KULLANMA —
  `i → I` üretir, `İ` değil. Metni elle yaz. Küçük bağlaçlar (ve, ile, için, de,
  da) başta değilse küçük kalır; kısaltmalar olduğu gibi durur (KDV, CSV, VKN, EFT).
- **Opaklık ölçeği (KRİTİK)**: Tailwind'in varsayılan `opacity` ölçeği yalnızca
  `0,5,10,20,25,30,40,50,60,70,75,80,90,95,100` içerir. Ölçekte OLMAYAN bir değer için
  `bg-emerald-500/12` **hiç CSS üretmez** — sınıf sessizce yok sayılır, rozet zeminsiz kalır.
  Bu projenin görsel dili ara değerlere dayandığı için `tailwind.config.ts` →
  `theme.extend.opacity` içinde `2,3,4,6,7,8,12,15,18,35,45,55,65,85` tanımlıdır.
  **Yeni bir ara değer kullanmadan önce oraya ekle** (ya da `/[0.12]` arbitrary yaz).
- **Bileşen envanteri** (önce bunları kullan, yenisini yazma):
  - Kart başlık: `<PageHeader eyebrow title subtitle action />` — `eyebrow` = galeri bölüm
    etiketi (**Klinik / Finans / Yaşam**, sidebar gruplarıyla aynı); `title` ReactNode alır
    (dashboard'da italik isim). Başlık altı el çizimi fırça SVG'si — düz çizgiye çevirme.
  - KPI: `<StatCard label value icon={<Icon/>} accent change hint />` — `icon` **ReactNode**, lucide bileşeni DEĞİL (bkz §10)
  - Durum etiketi: `<StatusBadge label tone />` (tone: emerald/amber/slate/sky/red/indigo/violet) — `STATUS_TONE[...]` ile eşle
  - Avatar: `<Avatar name color size />`
  - Modal: `<Modal open onClose title description>` + form — **portal ile document.body'ye render edilir**
    (backdrop-filter'lı .glass atalar fixed'i hapseder; modalı asla portalsız render etme).
    Mobilde otomatik **bottom-sheet** (alttan açılır, tutamaç + safe-area payı) — sm+ ortalanmış kart.
  - Form alanları: `<Field label><Input/Select/Textarea/></Field>`
  - Silme: `<DeleteButton action={fn.bind(null,id)} redirectTo? confirmText? />` —
    `confirmText` ReactNode alır; kişi adı geçiyorsa `<span className="sensitive">` ile sar
  - Form gönderimi: `<SubmitButton pending={...}>Kaydet</SubmitButton>` (spinner + `aria-busy`
    dahil) — elle indigo submit düğmesi YAZMA
  - Satır içi durum değiştirme: `<StatusPillSelect …>` (SessionStatusSelect / InvoiceStatusSelect
    bunun üzerine kurulu; prop senkronu + chevron + hata geri alma tek yerde)
  - Onay: `<ConfirmDialog open onClose onConfirm title description confirmLabel tone? icon? />`
    — yıkıcı VE geri alınamaz her işlem (silme, danışana çevirme, geri yükleme) onay ister
  - Boş durum: `<EmptyState icon title description action />`
  - Grafik: `AreaTrendChart / CategoryDonut / MonthlyBar / TaxRadial`
- **Animasyon**: `lib/variants.ts` (fadeUp, staggerContainer, modalPanel…) + `EASE`.
  Rotalar arası geçiş `PageTransition` ile otomatik.
- **Marka**: mürekkep damgası — `bg-slate-900` kare + orkide işareti (`BloomMark`) + altın nokta
  (Shell, Header ve fatura print'te aynı kimlik).
- **Navigasyon**: `DashboardShell` içinde `NAV_GROUPS` (Klinik / Finans / Yaşam) — düz `NAV` dizisi değil.
  Mobilde ayrıca **alt sekme çubuğu** (`TAB_ITEMS`: Genel/Ajanda/Danışan/Finans/Menü) — yeni ana
  sayfa eklersen ilgili sekmenin `match` dizisine yolu ekle. İçerik `pb-28` ile bara pay bırakır;
  alta sabitlenen pil/toast'lar mobilde `bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-5` kullanır.
- **Mobil kalite tabanı**: `.field` mobilde 16px (iOS zoom fix), `touch-action: manipulation`,
  `prefers-reduced-motion` CSS'te + Framer'da `MotionConfig reducedMotion="user"` (Shell & landing),
  `viewportFit: 'cover'` + `env(safe-area-inset-*)` payları (topbar/tabbar/drawer).
- **İmleç**: özel cursor YOK — normal mouse. Tekrar ekleme.

---

## 8. Yeni Özellik Ekleme Reçetesi

Tipik akış (örnek: yeni bir varlık/sekme):

1. **Şema** → `lib/schema.ts`'e tablo ekle (FK'lerde `onDelete`, para `numeric`,
   tip çıkarımı `$inferSelect/$inferInsert`). Statü/enum değerlerini `lib/constants.ts`'e
   `as const` + Türkçe etiket sözlüğü + `STATUS_TONE` olarak ekle.
2. **Migrate** → `npm run db:push`.
3. **Okuma** → `lib/queries.ts`'e `list*/get*` fonksiyonu (server-only, `Number()` ile sayıya çevir,
   gerekiyorsa `scope='business'` filtrele).
4. **Yazma** → `app/actions/<x>.ts`'e `'use server'` create/update/delete; doğrulama yap,
   `{ ok, error }` dön, ilgili yolları `revalidatePath`.
5. **Form** → `components/forms/`'a `'use client'` dialog (Modal + Field + `useTransition` +
   `router.refresh()`). Var olan `New*Dialog`'u kopyalayarak başla.
6. **Sayfa** → `app/(dashboard)/dashboard/<x>/page.tsx` Server Component; query'yi `await` et,
   `PageHeader` + glass kartlar + uygun bileşenlerle render et.
7. **Navigasyon** → `components/dashboard/DashboardShell.tsx`'teki `NAV` dizisine ekle (lucide ikon).
8. **Seed** → `scripts/seed.ts`'e örnek veri ekle (demo dolu görünsün).
9. **Doğrula** → `npm run typecheck`; dev'i durdurup `npm run build`; canlı kontrol.

**Para/tarih**: hep `formatTRY` / `formatDate*` (lib/format.ts). KDV/vergi: `lib/finance.ts`.
**Kişiselleştirme**: isim/işletme bilgisi `lib/constants.ts` → `USER` / `BUSINESS`.

---

## 9. Kararlar

- **Auth: next-auth v5 credentials** — tek parola (`APP_PASSWORD`), JWT session, adapter yok.
  `lib/auth.ts` middleware'de (edge) çalışır → **oraya asla `lib/db` import etme**.
  Korunan yollar `middleware.ts` matcher'ında; `/login`, `/`, `/api/health` açık.
- Mutasyon = Server Action; okuma = Server Component + queries. API route yalnızca iki istisna:
  `app/api/auth` (NextAuth zorunlu) ve `app/api/export` (dosya indirme — CSV/JSON yedek).
- **Tazeleme**: her action `lib/revalidate.ts` yardımcılarını kullanır — `revalidateFinance()`
  (KPI/grafik/vergi sayfaları), `revalidateSessions(clientId?)` (takvim/devam/paket),
  `revalidateClients()` (liste + detaylar + ⌘K listesi, layout-level). Yeni sayfa → ilgili gruba ekle.
- **Gizlilik modu**: `html.privacy` + `.sensitive` (globals.css) — yalnızca kimlik alanları bulanır.
  İsim/iletişim render eden yeni bileşene `sensitive` sınıfı ekle (Avatar otomatik).
- Kişisel harcamalar `scope` ile ayrılır, ayrı tablo değil.
- **Veri güvenliği**: (1) Tam yedek `/api/export?type=json` → `last_backup_at` settings'e yazılır;
  14+ gün geçince dashboard hatırlatır. (2) **Geri yükleme** `app/actions/restore.ts` —
  tüm delete+insert'ler tek `db.batch()` (Neon tek transaction, ya hep ya hiç); UI'da
  "GERİ YÜKLE" yazarak onay. Yeni tablo eklenince export + restore + seed temizliğine ekle.
  (3) Seed dolu DB'de `--force` olmadan ÇALIŞMAZ. (4) Danışan silme isim yazarak onaylanır
  (`DeleteClientButton`). serverActions bodySizeLimit 16mb (yedek yükleme için).
- Kategoriler serbest metin (datalist önerili) — kullanıcı kendi kalemini yazabilir.
- Fatura PDF'i tarayıcı yazdırma ile (`/invoices/[id]/print` + `@media print`), ekstra PDF kütüphanesi yok.

---

## 10. Tuzaklar (mistakes.md + bu projeye özgü)

1. **postcss.config.js olmadan Tailwind derlenmez** — silme. Stiller kaybolursa ilk buraya bak.
2. **Türkçe karakter** → `next/font` subset'i `['latin','latin-ext']` olmalı (layout.tsx). `<html lang="tr">`.
3. **Server→Client'a fonksiyon/komponent geçme**: lucide ikonunu client bileşene **render edilmiş element**
   olarak geçir (`icon={<X/>}`), bileşen referansı (`icon={X}`) HATA verir. (StatCard bu yüzden ReactNode alır.)
4. **`npm run build` dev açıkken çalıştırma** — ikisi `.next`'i paylaşır, cache bozulur
   (`Cannot find module './xxx.js'`). Çözüm: dev'i durdur → `rm -rf .next` → build/dev.
5. `??` ile `||` parantezsiz karışmaz: `a ?? (b || c)`.
6. next-themes: `<html suppressHydrationWarning>` + tema bağımlı bileşende `mounted` guard.
7. Serverless DB: `@neondatabase/serverless`, `pg` değil. `numeric` string döner — `Number()`.
8. Server Component'e `'use client'`/Framer Motion/Recharts koyma; ayır.
9. drizzle-kit `.env.local`'i okumaz → `drizzle.config.ts` başında `dotenv` ile yüklenir.
10. Hardcoded renk/magic number yok; token + named constant kullan.
11. **tailwind.config `content` listesinde `./lib/**` OLMALI** — `CLIENT_COLOR_BG`, `MOOD_BG` gibi
    sınıf haritaları lib'de; listeden çıkarsa o sınıflar üretilmez (görünmez avatar bug'ı).
12. PDF = tarayıcı print: makbuz `/invoices/[id]/print`, yıllık rapor `/reports/[year]/print`
    (`?auto=1` otomatik diyalog). Yeni rapor eklerken bu deseni kopyala.
13. **Ölçek dışı opaklık sessizce ölür** — `bg-*/12`, `border-*/15` gibi değerler
    `tailwind.config.ts` → `theme.extend.opacity` içinde tanımlı DEĞİLSE hiç CSS üretilmez.
    "Rozet zeminsiz görünüyor" hatasında ilk buraya bak. (Bkz. §7 Opaklık ölçeği.)
14. **`aria-label` / `title` / `placeholder` gizlilik filtresinden MUAF** — `html.privacy`
    yalnızca render edilmiş metni bulanıklaştırır. Danışan adını veya tutarı bu özniteliklere
    yazma; ekranda bulanan değer orada düz metin sızar.
15. **`desc()` metin sıralamasıdır** — `desc(priority)` ile 'normal' > 'high' çıkar ve
    öncelikli kayıtlar listenin SONUNA düşer. Sıralama anlamı taşıyorsa açık
    `sql\`case when … then 0 else 1 end\`` yaz.
16. **`db.batch()` içinde insert sırası FK sırasıdır** — `clientNotes.goalId → clientGoals.id`
    olduğu için hedefler notlardan ÖNCE eklenmeli; tek FK ihlali tüm geri yüklemeyi düşürür.
17. **Modal efekt bağımlılığına `onClose` koyma** — her render'da yeni closure gelir, efekt
    yeniden kurulur ve her tuş vuruşunda odak ilk öğeye kaçar. Ref'te tut, bağımlılık `[open]`.
18. **Gizlilik modu iki katmanlı**: `app/layout.tsx`'teki engelleyici script `html.privacy`
    sınıfını ilk boyamadan önce koyar (bulanıklık saf CSS, hidrasyonu beklemez); React state
    SSR ile aynı değerle (`false`) başlar ve mount sonrası senkronlanır. State'i DOM'dan
    başlatma — hidrasyon uyuşmazlığı üretir.

---

## 11. Deploy (Vercel + GitHub)

- Repo: **github.com/ahmetakyapi/derinay** (private). `main`'e push → otomatik deploy (bağlıysa).
- `vercel.json`: `framework: nextjs`, `regions: ["fra1"]` (Neon eu-central-1'e yakın).
- Vercel env: `DATABASE_URL`, `AUTH_SECRET`, `APP_PASSWORD`, `NEXT_PUBLIC_APP_NAME=Derinay`,
  `NEXT_PUBLIC_APP_URL`. **AUTH_SECRET/APP_PASSWORD eklenmeden deploy edilirse giriş çalışmaz.**
- Şema/seed manueldir (deploy'da çalışmaz): gerektiğinde `db:push` / `db:seed`.
- Commit dili **İngilizce** (kullanıcı tercihi), sonunda `Co-Authored-By` satırı.

---

## 12. Ekosistem Referansları

- Tema: `~/dev-starter/knowledge/themes/ahmetakyapi.md`
- Hatalar: `~/dev-starter/knowledge/mistakes.md`
- Desenler: `~/dev-starter/knowledge/patterns.md`
