# Derinay — Proje Rehberi (CLAUDE.md)

> Bu dosya projenin **canlı dokümantasyonudur**. Yeni bir özellik eklerken önce burayı
> oku; mevcut desenleri, dosya konumlarını ve tuzakları takip et. Yapı değiştiğinde
> (yeni tablo, yeni sayfa, yeni desen) bu dosyayı da güncelle.

---

## 1. Proje Nedir

**Derinay**, **Klinik Psikolog Simay Ahi** için tek kişilik bir pratik yönetim panelidir.
Amaç: gelir-gider, danışan, seans, fatura, ödeme, vergi ve kişisel harcamaları tek,
sakin ve görsel bir arayüzde toplamak.

- **Kullanan kişi**: Simay Ahi (tek terapist). **Tek kullanıcılı parola kilidi VAR** (next-auth v5
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
| Grafik | Recharts | `components/charts/` altında, hepsi `'use client'` |
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
  layout.tsx                       # ThemeProvider, Manrope+IBM Plex (subset latin+latin-ext), metadata
  globals.css                      # tema tokenları, .glass/.surface/.chip/.field, print + dark/light
  page.tsx                         # Landing (hero/özellikler/CTA) — 'use client'
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
  finance.ts       # calcKdv, estimateIncomeTax, taxSummary
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
  forms/           # New*Dialog, EditClientDialog, NoteForm (tür+duygu), AvatarPicker, InvoiceStatusSelect
  ui/              # GlassCard, Button, Chip, Modal, Field(Input/Select/Textarea), StatCard,
                   # StatusBadge, Avatar, EmptyState, DeleteButton
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
`personal` = Simay'ın özel günlük harcamaları (yalnızca **Kişisel** sekmesi). Dashboard ve
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
- **Tipografi**: Başlık/büyük rakam = **Fraunces** (`font-display`, italic vurgular);
  gövde = Manrope; tutar/tablo rakamı = IBM Plex Mono + `tabular-nums`. Bölüm başlıkları
  galeri etiketi stili: `text-xs font-bold uppercase tracking-[0.12em]`.
- **Chart renkleri**: `lib/palette.ts` (`CHART`, `CHART_SERIES`) — chart bileşenine hex yazma.
- Renkler `globals.css` CSS değişkenleri (`--pine/--sage/--gold/--clay/--mist`, `--paper/--line`)
  + Tailwind ile; **hardcoded hex yok**.
- **Yüzey sınıfları** (globals.css): `.glass` (kart), `.surface` (modal), `.chip` (pill),
  `.field`/`.field-label` (form). Hepsi dark+light varyantlı.
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
  - Silme: `<DeleteButton action={fn.bind(null,id)} redirectTo? confirmText? />`
  - Boş durum: `<EmptyState icon title description action />`
  - Grafik: `AreaTrendChart / CategoryDonut / MonthlyBar / TaxRadial`
- **Animasyon**: `lib/variants.ts` (fadeUp, staggerContainer, modalPanel…) + `EASE`.
  Rotalar arası geçiş `PageTransition` ile otomatik.
- **Marka**: mürekkep damgası — `bg-slate-900` kare + Fraunces italic "D" + altın nokta
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
12. PDF = tarayıcı print: fatura `/invoices/[id]/print`, yıllık rapor `/reports/[year]/print`
    (`?auto=1` otomatik diyalog). Yeni rapor eklerken bu deseni kopyala.

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
