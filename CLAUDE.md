# Derinay — Proje Kuralları

Psikologlar için gelir-gider, fatura, vergi ve danışan takip uygulaması.

---

## Proje Özeti

Derinay, bir psikoloğun pratiğini tek panelden yönetmesini sağlar:
- **Gelir/gider takibi** — kategori bazlı, aylık kırılım
- **Danışan yönetimi** — ekle/çıkar, statü (aktif/duraklatıldı/tamamlandı), devam süresi
- **Danışan notları** — seans dışı serbest notlar
- **Seanslar** — tarih, süre, durum (planlandı/tamamlandı/iptal/gelmedi)
- **Faturalar** — KDV otomatik hesap, statü (taslak/gönderildi/ödendi/gecikmiş)
- **Ödemeler** — danışan/fatura bazlı tahsilat
- **Vergi** — toplanan KDV + gelir vergisi tahmini + ödenecek toplam
- **Dashboard** — KPI kartları + grafikler (alan, donut, bar, radial)

## Teknik Stack

- **Framework**: Next.js 14 App Router
- **Stil**: Tailwind CSS 3 (`darkMode: 'class'`)
- **Animasyon**: Framer Motion 11 (EASE `[0.22,1,0.36,1]`)
- **Grafik**: Recharts
- **DB**: Drizzle ORM + Neon Postgres (`@neondatabase/serverless`)
- **Tema**: next-themes — dark (ahmetakyapi glass) + light (terapötik pastel)
- **İkonlar**: lucide-react
- **Deployment**: Vercel

## Proje Kararları

- **Auth**: İlk sürümde YOK (tek terapist varsayımı). İleride next-auth v5 ile
  eklenecek; `users` tablosu ve `.env` satırları hazır bırakıldı.
- **Mutasyonlar**: API route yerine Server Actions (`app/actions/`).
- **Okuma**: Server Component'ler doğrudan `lib/queries.ts` çağırır.
- **Para birimi**: TRY, `tr-TR` formatlama (`lib/format.ts`). Tutarlar DB'de `numeric`.
- **Vergi**: KDV ve gelir vergisi oranları `lib/constants.ts` içinde (`as const`).

## Özel Kurallar

- Server Component'e `'use client'`/Framer Motion/Recharts KOYMA — ayır.
- Grafik bileşenleri `components/charts/` altında, hepsi `'use client'`.
- Renkler CSS değişkeni/token üzerinden — hardcoded hex yok.
- Her FK'de `onDelete` davranışı açık (mistakes.md #7).

## Ekosistem Referansları

- Tema: `~/dev-starter/knowledge/themes/ahmetakyapi.md`
- Hatalar: `~/dev-starter/knowledge/mistakes.md`
- Desenler: `~/dev-starter/knowledge/patterns.md`

---

## Kurulum

```bash
cp .env.example .env.local   # DATABASE_URL doldur (Neon)
npm install
npm run db:push              # Şemayı Neon'a uygula
npm run db:seed              # Örnek verileri yükle
npm run dev
```
