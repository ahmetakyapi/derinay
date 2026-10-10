# Derinay — Proje Rehberi (CLAUDE.md)

> Canlı dokümantasyon: yeni işe başlamadan oku; yapı değişince (tablo, sayfa, desen) burayı
> da güncelle. Burada yalnız koddan çıkarılamayan kurallar ve gerekçeleri durur — dosya
> listesi için `ls`, ayrıntı için ilgili dosyanın başlık yorumu.

## Commit yazarı

Commitler her zaman `Ahmet Akyapı <ahmetakyapii@gmail.com>` adına atılır;
yazarı yalnızca "Claude" olan commit atılmaz. Claude, mesajın sonundaki
`Co-Authored-By: Claude …` satırıyla ortak yazar olarak görünür. Oturum
başında, ilk committen önce:

```bash
git config user.name "Ahmet Akyapı"
git config user.email "ahmetakyapii@gmail.com"
```

Bu kural sahibinin tüm repolarında geçerli (9 Ekim 2026).

---

## 1. Proje

**Derinay**: tek kişilik klinik psikoloji muayenehanesinin yönetim paneli — danışan, seans,
makbuz, ödeme, gelir-gider, vergi ve kişisel harcama tek, sakin arayüzde.

- Tek kullanıcı, tek şifre (next-auth v5, bkz. §9). Sahibin adı/unvanı **kodda tutulmaz**:
  Ayarlar → İşletme Kimliği (`settings.business`) → `getOwnerIdentity()`.
- Arayüz tamamen **Türkçe**; para ₺ / `tr-TR`; Türkçe ay/gün adları.
- Marka: orkide işareti `BloomMark` (bkz. §7 Marka); makbuz no `DER-YYYY-NNN`.

## 2. Yığın

| Katman | Seçim | Not |
|---|---|---|
| Framework | Next.js 14 App Router | Server Component varsayılan |
| Stil | Tailwind 3.4, `darkMode: 'class'` | `postcss.config.js` ŞART |
| Hareket | Framer Motion 11 + Lenis (yalnız landing) | GSAP yok |
| Grafik | Recharts | `components/charts/`, sayfalar `charts/lazy`den alır |
| DB | Neon Postgres + Drizzle (`neon-http`) | `@neondatabase/serverless`, `pg` DEĞİL |
| Tema | next-themes | `defaultTheme="light"`, `enableSystem={false}` |
| Font | fontsource paketleri | next/font YASAK (§7 Tipografi) |
| İkon | lucide-react | |
| Deploy | Vercel `fra1` | bkz. §11 |

## 3. Komutlar

```bash
npm run dev | build | typecheck | lint
npm run db:push        # şemayı Neon'a uygula (drizzle-kit push)
npm run db:check       # push sonrası kolonlar gerçekten oluştu mu
npm run db:dump -- yedek.json      # ham JSON yedek (select *) — şema değişikliğinden ÖNCE
npm run db:restore -- yedek.json   # CLI geri yükleme (tek db.batch)
npm run db:seed        # demo veri — TÜM tabloları siler; dolu DB'de `-- --force` ister
npm run db:studio
npm run db:reset-owner # settings'teki kişi adını sil (`-- --all` = tüm kimlik)
```

- **Şema değişikliği akışı**: `db:dump` → şemayı değiştir → `db:push` → `db:check`.
  Dump ham SQL kullanır çünkü şema dosyası DB'nin ilerisindeyken Drizzle olmayan kolonu
  seçip patlar; push sessizce yarım kalabilir, `db:check` yakalar.
- `npm run build`'i dev açıkken çalıştırma (§10).
- Kurulum: `.env.local` (`DATABASE_URL`, `AUTH_SECRET`, `APP_PASSWORD`) → `db:push` → `db:seed` → `dev`.

## 4. Mimari

- **Okuma**: sayfalar Server Component; `lib/queries.ts` (`import 'server-only'`)
  fonksiyonlarını `await` eder. Sorgular düz/serileştirilebilir obje döner (`numeric` → `Number()`).
- **Yazma**: yalnız Server Action (`app/actions/*.ts`, `'use server'`). Doğrula, `{ ok, error? }`
  dön, `lib/revalidate.ts` yardımcılarıyla tazele (§9). Formlar `'use client'`,
  `useTransition` + `router.refresh()`.
- **API route yalnız üç**: `api/auth` (NextAuth), `api/export` (CSV/JSON indirme), `api/health`.
  Yeni mutasyon = yeni action, route değil.
- **DB** (`lib/db.ts`): lazy Proxy — `neon()` ilk sorguda kurulur, `DATABASE_URL`
  olmadan build patlamaz. Dashboard layout'u `force-dynamic`.

## 5. Nerede Ne Var

- `app/page.tsx` — landing; yalnız **bileşim** (bölümler `components/landing/`, Header/Footer
  `components/layout/`). Sıra: açılış → kahraman → hız bandı → vitrin → `#panel` → `#gun`
  → `#defter` → `#finans` → `#guven` → kapanış → altlık. Yeni bölüm → Header `NAV_LINKS`'e çapa.
- `app/(dashboard)/dashboard/*` — panel sayfaları (her birinin `loading.tsx`'i var).
  Sayfa listesi = `DashboardShell` → `NAV_GROUPS`.
- `app/{invoices,clients,reports}/[…]/print` — kabuk DIŞI yazdırma sayfaları (makbuz,
  danışan dosyası, yıllık rapor; `?auto=1` diyaloğu açar). PDF = tarayıcı print, kütüphane yok.
- `app/actions/` — mutasyonlar (seans action'ları `notes.ts` içinde).
- `app/error.tsx`, `global-error.tsx`, `not-found.tsx` — Next varsayılan ekranı ASLA görünmez.
- `lib/` — `schema`, `queries`, `finance` (vergi/makbuz hesabı), `constants` (enum + Türkçe
  etiket sözlükleri + `STATUS_TONE` + `TAX` + `BUSINESS` varsayılanları), `format`,
  `palette` (grafik renkleri), `variants` (Framer), `revalidate`, `quotes`, `auth`, `db`.
- `components/ui/` — ortak primitifler (§7 Envanter). `components/motion/` — hareket
  sistemi. `components/marketing/` — landing'deki panel kesitleri.
- `scripts/` — seed, dump, restore, check-schema, reset-owner (`db-env.ts`: `DATABASE_URL`
  yoksa yığın izi yerine ne yapılacağını yazar).

## 6. Veri Modeli ve İş Kuralları (`lib/schema.ts`)

Para alanları `numeric(12,2)` (string döner → `Number()`). Her FK'de `onDelete` açık.

- **clients** — status (active/paused/completed), birthDate (doğum günü hatırlatması),
  consentGiven (KVKK onam), sessionFee, colorTag, avatarUrl (istemcide ~192px'e
  küçültülmüş data-URI), tags[], notes.
- **sessions** — clientId→cascade, date, durationMin, status (scheduled/completed/cancelled/no_show), fee, note.
- **clientNotes** (Seans Defteri) — kind (session/observation/homework/important),
  mood (great/good/neutral/low/difficult), pinned, goalId→clientGoals (set null).
- **transactions** — type (income/expense), **scope** (business/personal), amount, category
  (serbest metin, datalist önerili), recurring ("sabit giderleri kopyala" önceki aydan alır),
  clientId→set null, `kdvRate`/`kdvAmount` = İNDİRİLECEK KDV (yalnız işletme gideri;
  `amount` KDV DAHİL, `kdvAmount` `extractKdv` ile içinden ayrılır).
- **invoices** — Serbest Meslek Makbuzu (UI'da "Makbuzlar"): subtotal (brüt), kdv*, stopaj*,
  total = brüt − stopaj + KDV, status (draft/sent/paid/overdue). Hesap TEK yol: `calcMakbuz`.
- **payments** — tahsilat defteri: clientId→cascade, invoiceId→set null, method (cash/card/transfer).
- **sessionPackages** — ön ödemeli paket. Kullanım = satın almadan sonra **tamamlanan** seans
  sayısı (`getClientDetail().activePackage`). `recordIncome` ile işletme geliri de yazılabilir.
- **clientGoals** (active/achieved/paused, achievedAt), **clientScores** (ölçek zaman serisi →
  `ScoreTrend`), **clientDocuments** (yalnız Drive/iCloud **bağlantısı** — KVKK gereği dosya saklanmaz).
- **waitlist** — `convertWaitlist` danışana taşır ve kaydı siler.
- **settings** (anahtar-değer): `business`, `tax` (kdvRate/stopajRate/incomeTaxRate),
  `reminder_template`, `debt_reminder_template`, `income_goal`, `last_backup_at`.
  `getBusinessInfo()`/`getTaxSettings()` varsayılanların üstüne uygular.
  `saveReminderTemplate(value, kind)` — `kind` verilmezse seans şablonu yazılır; borç metni için `'debt'` ŞART.
- **users** — kullanılmıyor (auth DB'siz).

**Kurallar (hepsi tek kaynak — ikinci hesap yazma):**
- **`scope`**: `business` = kliniğin finansı; `personal` yalnız Kişisel sekmesi. Dashboard,
  finans, vergi ve analiz sorguları `scope='business'` filtreler.
- **KDV beyanı** = hesaplanan − indirilecek, `lib/finance.ts` → `taxSeries()`; aylık seri
  yılbaşından DEVREDEN KDV zinciriyle kurulur. Dashboard, Vergiler, Analiz ÜÇÜ de bunu okur.
- **Stopaj mahsubu**: makbuzda kesilen stopaj gelir vergisi tahmininden düşülür, negatife inmez.
- **Bekleyen tahsilat = AÇIK MAKBUZ** (`sent` + `overdue`), ödeme kayıtlarından değil
  (`getOutstandingBalances`) — aksi halde "Ödendi" + ödeme kaydı borcu iki kez kapatıyordu.
- **Otomatik vade**: `listInvoices`/`getDashboard` vadesi geçen `sent` makbuzu idempotent
  `overdue` yapar (`autoMarkOverdue`).
- **Çakışma**: `createSession`/`updateSessionTime` üst üste binen seansı reddeder (`findConflict`,
  iptal/gelmedi hariç).
- **Bir süredir gelmeyen danışan** (`getDashboardReminders().silentClients`): aktif, ileri
  planlı seansı yok, son tamamlanan seansı 21+ gün önce. Hiç seansı olmayan yeni kayıt hariç.

## 7. Tasarım Sistemi — "Atölye"

Sanat galerisi / kâğıt estetiği. **Light varsayılan**: sıcak kâğıt `--bg #f4eee2` +
suluboya yıkamaları + grain. Dark "gece galerisi": `--bg #04070d`.

### Renk
- `tailwind.config.ts` paleti **remap** eder (sınıf adı aynı, değer Derinay'ın):
  `slate`→mürekkep, `indigo`→çam (birincil), `emerald`→adaçayı (gelir), `rose`→terracotta
  (gider), `amber`→okra (vergi/vurgu), `sky`→pus, `violet`→erik, `teal`/`cyan`→okaliptüs/su.
  **`blue/purple/orange/pink` KULLANMA** — remap edilmedi, paletle çatışır.
- Token'lar `globals.css`: `--pine/--sage/--gold/--clay/--mist`, `--paper/--line/--ink/--bg/--sand`.
  Grafik renkleri `lib/palette.ts` (`CHART`, `CHART_SERIES`). **Hardcoded hex yok.**
- **Opaklık ölçeği**: Tailwind 3.4 varsayılanı 5'in katlarıdır (`/15`, `/35` çalışır). Katı
  OLMAYAN değer (`/12`, `/8`) **hiç CSS üretmez**, sınıf sessizce ölür. Config'te yalnız
  `8` ve `12` tanımlı. 5'in katını config'e ekleme (ölü ayar); başka ara değer için ekle
  ya da `/[0.12]` yaz. "Rozet zeminsiz" hatasında ilk bak.
- **Soluk metin kontrastı (ölçüldü)**: tek başına `text-slate-400` kâğıtta 2.87:1 (AA altı);
  `dark:text-slate-500` koyuda 3.78:1. Doğru ikili **`text-slate-500 dark:text-slate-400`**
  (4.77 / 6.29). Landing gövdesi `text-slate-600 dark:text-slate-400`.
- Yüzey sınıfları: `.glass` (kart), `.glass-static` (backdrop-filter'sız, hareket eden kart),
  `.surface` (modal), `.chip`, `.field`/`.field-label`, `.band-sand`. Hepsi iki temalı.
  `.dark` tek başına da token'ları koyuya çevirir (`html.dark, .dark`) — landing'in "gece
  adaları" (vitrin, güven, altlık) açık temada da koyu alt ağaçtır; içinde `text-[var(--ink)]`.

### Tipografi
- **Tek aile Schibsted Grotesk** (gövde + başlık); ayrım ağırlık + sıkılıktan. `.font-display`
  yalnız tracking daraltır (`-0.032em`, `h1.font-display` `-0.04em`), ağırlık SET ETMEZ.
- Rakam: IBM Plex Mono (`font-mono` + `tabular-nums`) — yalnız gerçek sayısal içerik
  (tutar, tarih, saat, sayaç, makbuz no), ≥12px, ek tracking yok.
- **Vurgu yüzü Fraunces italik** (`font-serif`, SOFT 100) yalnız landing manşetindeki
  "Dinlendir"de. Başka dekoratif italik YOK; italik yalnız gerçek alıntı ve not satırında.
- **Yükleme fontsource, next/font DEĞİL** (9 Ekim 2026): Vercel'de next/font sunucu HTML'i ile
  CSS'e farklı sınıf hash'i yazdı, `--font-sans-face` tanımsız kaldı, canlı site Times'a
  düştü (yerelde tekrar etmedi). `layout.tsx`'te CSS import; aile adları `globals.css`'te sabit.
  Canlı kontrol: `getComputedStyle(document.body).fontFamily` Schibsted göstermeli.
- **₺**: Schibsted'in U+20BA glifi £ gibi çizilir. `DerinayLira` @font-face (yalnız U+20BA,
  `public/fonts/lira.woff2`) `--font-sans` ve `--font-display` listelerinin **en başında**;
  oradan kaldırma. Aile `body { font-family: var(--font-sans) }`'tan gelir — `<body>`/`<html>`'e
  aileyi sabitleyen sınıf verme, yoksa ₺ yine £ olur.
- **Okunur küçük etiket (Ekim 2026, sahibinin isteği)**: kart/bölüm başlığı
  `text-[15px] font-semibold` normal harf. KPI/meta/çip/tablo başlığı sans, normal harf,
  ≥12px (tipik `text-[13px] font-medium text-slate-600 dark:text-slate-400`). Küçük metinde
  `uppercase` ve `tracking-[0.1em+]` YOK; 12px altı metin yok (avatar baş harfi hariç).
- **Eyebrow/künye YOK (Ekim 2026: "hem okunmuyor hem kötü görünüyor")**: başlık üstü mono
  `(0N) Ad`, `No. 01`, `PageHeader` üstü grup adı, kart içi `01 / 03` sayacı — landing'de de
  panelde de geri ekleme. Gerçek bilgi (tarih, sayım, selamlama) başlığın ALTINDA `subtitle`.
  İşlevsel etiketler (form, KPI, tablo başlığı, çip, menü) kapsam dışı.
- **Satır kırılımı**: başlıklara `text-wrap: balance`, paragraflara `pretty` (globals.css);
  tek kelime alt satıra düşmez. Manşet `leading` ≥ 1.0 (Türkçe şapka/kuyruk değmesin).

### Metin
- **Title Case**: sayfa/bölüm/kart/modal başlıkları, **alt başlıklar** (`PageHeader subtitle`,
  landing başlık altı tek satır, kahraman alt başlığı — Ekim 2026), düğme/bağlantı, form
  etiketi, sekme, menü, rozet/filtre (`lib/constants.ts` sözlükleri), tablo başlığı, eylem `title`'ı.
- **Cümle düzeni**: çok cümleli gövde, kart açıklaması, modal `description`, `placeholder`,
  `hint`, boş durum cümlesi, onay sorusu ("Seans silinsin mi?"), hata cümlesi, mono mikro
  etiket ("3 gün önce").
- **Türkçe tuzağı**: `capitalize`, `.toUpperCase()`, `title()` KULLANMA (`i → I`, `İ` değil);
  metni elle yaz. Bağlaçlar (ve, ile, için, de/da) başta değilse küçük; kısaltma olduğu gibi (KDV, CSV, VKN).
- **Günlük Türkçe** (landing + giriş): herkesin kullandığı kelime, düz net cümle; edebi kurgu
  cümle yok. KULLANMA → yerine: "pratik" (muayenehane) · "atölye", "emanet", "künye/plaket"
  · "parola" → "şifre" · "duygu izleği" → "ruh hali takibi" · "sessizleşen danışan" →
  "bir süredir gelmeyen danışan".

### Bileşen Envanteri (yenisini yazmadan önce bunlar)
- `PageHeader title subtitle action` — `title` ReactNode; solda dikey `BrushPull`. `eyebrow` yok.
- `components/brand/Brush.tsx`: `BrushPull` (dikey, sayfa başlığı), `BrushSweep` (yatay,
  manşet vurgusu) — ikisi DOLGU geometrisi, ince `stroke` değil.
- `StatCard label value icon accent change hint` — `icon` **render edilmiş element** (§10).
- `StatusBadge label tone` (emerald/amber/slate/sky/red/indigo/violet; `STATUS_TONE[...]`).
- `Avatar name color size src` — `sensitive` otomatik.
- `Modal open onClose title description` — **portal ile `document.body`'ye** (backdrop-filter'lı
  ata `fixed`'i hapseder). Mobilde bottom-sheet, sm+ ortalı kart.
- `Field label hint` + `Input/Select/Textarea`; gönderim `SubmitButton pending` (spinner +
  `aria-busy`) — elle submit düğmesi yazma.
- `StatusPillSelect` — satır içi durum (Session/InvoiceStatusSelect bunun üstünde).
- `ConfirmDialog` — yıkıcı VE geri alınamaz her işlem onay ister (silme, danışana çevirme, geri yükleme).
- `DeleteButton action={fn.bind(null,id)} redirectTo confirmText` — kişi adı geçiyorsa `<span className="sensitive">`.
- `EmptyState icon title description action` — server bileşeni, `icon` lucide bileşeni alır.
- Grafikler `charts/lazy.tsx` üzerinden (dynamic + iskelet): AreaTrendChart, CategoryDonut,
  MonthlyBar, CumulativeArea, TaxRadial, TaxBars, ScoreTrend. Yeni grafik → bileşen + lazy export.
- `components/marketing/*Preview` — rakam/etiket uygulamanın kendi kaynağından türer
  (`calcMakbuz`, `MOOD_*`, `NOTE_KIND_LABEL`); elle sayı yazma (§10 sahte ekran görüntüsü).

### Marka ve Yerleşim
- **Marka**: mürekkep damgası — `bg-slate-900` kare + orkide `BloomMark` + altın nokta
  (Shell, Header, print sayfaları aynı).
- **Navigasyon**: `DashboardShell` → `NAV_GROUPS` (Klinik / Finans / Yaşam). Mobil alt sekme
  `TAB_ITEMS` (Genel/Ajanda/Danışan/Finans/Menü) — yeni sayfa ilgili sekmenin `match`'ine.
  İçerik `pb-28`; alta sabit pil/toast `bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-5`.
- **Mobil taban**: `.field` mobilde 16px (iOS zoom), `touch-action: manipulation`,
  `viewportFit: 'cover'` + `env(safe-area-inset-*)` payları.
- **Özel imleç YOK** — tekrar ekleme.
- **Kahraman**: solda her ekranda TAM İKİ SATIR manşet ("İşini Düzenle," / "Kafanı Dinlendir");
  satırlar `whitespace-nowrap`, `[text-wrap:wrap]`, punto vw ile ölçeklenir. Üç ses:
  `font-extrabold` komut + `font-normal` soluk "Kafanı" + serif italik çam vurgu. Sağda kemerli
  "galeri penceresi" + bölüm adlı cam çipler (uydurma rakam YOK).
- **Vurgu sözcüğü tek yerde** (`text-indigo-700 dark:text-indigo-300`, fırçayla) — her başlıkta tik olur.
- **Landing bölüm düzeni tekrar etmez**: her bölüm yapısını ve hareketini içeriğinden alır
  (vitrin genişleyen gece adası, `#panel` numaralı sergi dizini, `#gun` yatay kayan sahne —
  telefonda dikey, `#defter`/`#finans` aynalı ikili kesit, `#guven` `<dl>` taahhüt satırları).
  Var olan düzeni üçüncü kez kullanma. Açık tema ritmi: kâğıt / gece / kum (`#gun`, `#finans` `.band-sand`).
- **Giriş kişinin seçimi**: landing çağrıları `/login`'e ("Giriş Yap"); PWA `start_url` `/`.
- **Gizlilik modu**: `html.privacy` + `.sensitive` — yalnız kimlik alanları bulanır. İsim/iletişim
  basan yeni bileşene `sensitive` ekle (bkz. §10 öznitelik ve iki katman tuzakları).

### Hareket Sistemi
Eğriler: `EASE_OUT_EXPO [0.16,1,0.3,1]` giriş, `EASE_IN_OUT [0.76,0,0.24,1]` perde/sahne
(`lib/variants.ts`; CSS `--ease-out-expo` / `--ease-in-out`).

- **Rota geçişi** (`RouteTransition`, kök layout): BÖLGE değişince (landing ↔ /login ↔ /dashboard)
  iki katlı çam perde + varılan yerin adı; panel içinde perde yok, tepede `.nav-ink` çizgisi.
  Belge düzeyinde yakalama evresinde tıklama dinlenir; bölge değişiyorsa `preventDefault()` +
  perde kapanınca `router.push`. 7 sn emniyet zamanlayıcısı.
- **Panel girişi saf CSS**: `.page-enter` çocukları `page-rise` ile kademeli; `PageHeader`
  `.title-mask`/`.brush-draw`/`.subtitle-rise`; KPI `.stat-rise`; kabuk `.shell-in`/`.nav-in`.
  Hepsi `backwards` dolgu — bitince transform kalmaz (kalsa `fixed` çocuklar hapsolur).
- **Kenar çubuğu**: aktif zemin `layoutId="nav-active"` (her `NavList` kendi `LayoutGroup`'unda —
  masaüstü + çekmece aynı anda bağlı olabilir); mobil sekme `tab-active`.
- **Açılış "Galeri Penceresi"** (`Preloader`, yalnız landing, oturumda bir kez, ~2 sn). **SAYAÇ YOK**
  (000→100 sayacı Ekim 2026'da kaldırıldı — her site kendi açılışını taşır, geri getirme).
  Kurulum saf CSS (`.intro-*`, ilk boyamada başlar); çıkış kemer deliği `clip-path` ile.
  Layout'taki engelleyici script `sessionStorage['derinay:intro']` varsa `html.intro-seen`
  koyar; JS çalışmazsa `intro-failsafe` 4.6 sn'de kaldırır. Kahraman `useIntroDone()` ile oynar.
  Ayrıntı `Preloader.tsx` başlığında.
- **Lenis yalnız landing** (`SmoothScroll`); panelin iç kaydırma alanları yerel kalır.
- **Tema geçişi**: `useThemeTransition` — View Transitions ile tıklanan noktadan daire; sınıf
  geri çağrı İÇİNDE elle değişir (next-themes efekti geç kalır). Düğme `ThemeToggleButton` (landing + panel ortak).
- **Hareket azaltma**: CSS animasyon/gecikme sıfırlanır, perde ve Lenis atlanır, Framer
  `MotionConfig reducedMotion="user"` (landing + Shell); kaydırmaya bağlı `style` değerleri ayrıca (§10).

## 8. Yeni Özellik Reçetesi

1. **Şema** → `lib/schema.ts` (FK'de `onDelete`, para `numeric`, `$inferSelect/$inferInsert`);
   enum'lar `lib/constants.ts`'e `as const` + Türkçe etiket + `STATUS_TONE`.
2. `db:dump` → `db:push` → `db:check` (§3).
3. **Okuma** → `lib/queries.ts` (`Number()`, gerekiyorsa `scope='business'`).
4. **Yazma** → `app/actions/<x>.ts` (doğrula, `{ ok, error }`, `revalidate*`).
5. **Form** → `components/forms/` — var olan bir `New*Dialog`'u kopyala.
6. **Sayfa** → `app/(dashboard)/dashboard/<x>/page.tsx` + `loading.tsx`; `PageHeader` + `.glass` kartlar.
7. **Navigasyon** → `NAV_GROUPS` + mobil `TAB_ITEMS` `match`.
8. **Yedek** → yeni tablo export (`api/export`) + restore (`app/actions/restore.ts` ve
   `scripts/restore.ts`, FK sırası §10) + seed temizliği + `scripts/dump.ts`.
9. **Seed** → demo dolu görünsün. 10. `typecheck` + `lint`; dev'i durdurup `build`.

Para/tarih hep `lib/format.ts` (`formatTRY`, `formatDate*`); KDV/vergi hep `lib/finance.ts`.

## 9. Kararlar

- **Auth**: next-auth v5 credentials, tek şifre (`APP_PASSWORD`), JWT (30 gün), adapter yok.
  `lib/auth.ts` middleware'de (edge) çalışır → **oraya `lib/db` import etme**. Korunan yollar
  `middleware.ts` matcher'ı (`/dashboard`, print sayfaları, `/api/export`); `/`, `/login`, `/api/health` açık.
- **Tazeleme** `lib/revalidate.ts`: `revalidateFinance()`, `revalidateSessions(clientId?)`,
  `revalidateClients()` (⌘K listesi dahil, layout düzeyi), `revalidateSettings()`. Yeni sayfa → ilgili gruba.
- Kişisel harcama ayrı tablo değil, `scope`.
- **Veri güvenliği**: tam yedek `/api/export?type=json` `last_backup_at` yazar, 14+ gün sonra
  dashboard hatırlatır. Geri yükleme tüm delete+insert'leri tek `db.batch()`'te yollar (Neon tek
  transaction); UI'da "GERİ YÜKLE" yazarak onay. Danışan silme isim yazarak onaylanır
  (`DeleteClientButton`). `serverActions.bodySizeLimit` 16mb (yedek yükleme).
- `next/image` kullanılmıyor (avatarlar data-URI, düz `<img>`); `images` config yok.

## 10. Tuzaklar

**Derleme / ortam**
- `postcss.config.js` silinirse Tailwind derlenmez.
- `build` dev açıkken `.next`'i bozar (`Cannot find module './xxx.js'`): dev'i durdur → `rm -rf .next`.
- `tailwind.config` `content`'inde `./lib/**` OLMALI — `CLIENT_COLOR_BG`, `MOOD_BG`, `STATUS_TONE`
  sınıfları orada; çıkarsa görünmez avatar.
- drizzle-kit `.env.local`'i okumaz → `drizzle.config.ts` başında `dotenv`.

**Server / Client**
- Server'dan client bileşene lucide ikonu **element** olarak geçir (`icon={<X/>}`); bileşen referansı hata verir.
- Server Component'e Framer/Recharts koyma; client parçaya ayır.
- next-themes: `<html suppressHydrationWarning>` + tema bağımlı bileşende `useMounted` guard.
- SSR'da görünmesi gereken kabuğa Framer `initial` koyma — `opacity:0` HTML'e yazılır, JS
  gecikirse menü boş kalır. Kabuk girişleri CSS (`.shell-in`, `.nav-in`).

**Veri**
- `desc()` metin sıralar: `desc(priority)` 'normal'ı 'high'ın önüne koyar. Anlamlı sıra için
  `sql\`case when … then 0 else 1 end\``.
- `db.batch()` insert sırası = FK sırası: `clientGoals` `clientNotes`'tan ÖNCE (goalId); tek ihlal tüm geri yüklemeyi düşürür.

**Gizlilik**
- `aria-label`/`title`/`placeholder` bulanıklaşmaz — danışan adı veya tutar oraya yazılmaz.
- Gizlilik iki katman: `app/layout.tsx` engelleyici script `html.privacy`'yi ilk boyamadan
  önce koyar (saf CSS); React state SSR ile aynı (`false`) başlar, mount sonrası senkronlanır.
  State'i DOM'dan başlatma — hidrasyon uyuşmazlığı.

**Tipografi**
- `tabular-nums`'u `.font-display`/başlığa yazma: Schibsted'in `tnum`'u virgül ve noktayı
  1300 birimlik rakam yuvasına çevirir ("Defter Önce , Fatura"). Hizalı rakam = `font-mono`.
  (Doğrulama: `fontTools` ile GSUB `tnum` lookup'ı — tahmin etme.)
- next/font'a geri dönme, `DerinayLira`'yı font listelerinden çıkarma (§7 Tipografi).

**Hareket / yerleşim**
- `window.addEventListener('scroll', …)` ve `scrollY`'yi state'e yazmak YASAK → Framer
  `useScroll()` + `useMotionValueEvent()` (Header deseni) ya da IntersectionObserver.
- `overflow-hidden` ata `position: sticky`'yi öldürür → yatay taşma için `overflow-x-clip` (landing `<main>`).
- Framer `animate` bitince satır içi `transform: none` bırakır, `hover:-translate-y-1` ölür →
  hover'da kalkan kartın girişi CSS keyframe (StatCard).
- Framer `style` transform'u Tailwind translate'ini ezer → ötelemeyi de style'a yaz (`y: '-50%'`).
- Kaydırmaya bağlı `style` değerleri `MotionConfig reducedMotion`'dan etkilenmez →
  `useReducedMotion()` ile elle kapat (Hero, Showcase, Scenes, Footer).
- Yeni tam ekran bölge → `RouteTransition` `zoneOf()`'a ekle, yoksa perde oynamaz. Panel içi
  tıklamada `preventDefault` ETMEZ, yalnız çizgiyi başlatır.
- Modal efekt bağımlılığına `onClose` koyma (her render yeni closure → odak ilk öğeye kaçar);
  ref'te tut, bağımlılık `[open]`.

**Sahte ekran görüntüsü borcu** — `components/marketing/*Preview` ürünü `<div>`'lerle çizer;
taste-skill gerçek yakalanmış görüntü ister (Mimio: `scripts/capture-app-shots.mjs`). Derinay'da
yapılmadı çünkü `db:seed` TÜM tabloları siliyor, önce ayrı demo DB gerekir. Bu kesitlere yeni
sahte veri EKLEME.

## 11. Deploy

- Repo `github.com/ahmetakyapi/derinay` (private); `main`'e push → Vercel (`vercel.json`:
  `framework: nextjs`, `regions: ["fra1"]` — Neon eu-central-1'e yakın).
- Vercel env: `DATABASE_URL`, `AUTH_SECRET`, `APP_PASSWORD`, `NEXT_PUBLIC_APP_URL`
  (metadataBase). **AUTH_SECRET/APP_PASSWORD yoksa giriş çalışmaz.**
- Şema ve seed deploy'da çalışmaz; elle `db:push` (+ `db:check`).
- Commit dili **İngilizce**, sonunda `Co-Authored-By` satırı.

## 12. Ekosistem

Tema `~/dev-starter/knowledge/themes/ahmetakyapi.md` · hatalar `…/mistakes.md` · desenler `…/patterns.md`.
