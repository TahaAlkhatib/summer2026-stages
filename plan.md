# Summer 2026 Stajyer Projeleri — Ana Plan (Master Plan)

> Bu dosya portföyün tek doğruluk kaynağıdır. Her oturumda önce bu dosya okunur,
> iş bitince güncellenir. Kaynak kapsam: `software_projects_scope.pdf`.

**Son güncelleme:** 2026-09-01
**Durum:** Faz 0 — kurulum ve iskelet (henüz kod yazılmadı)

---

## 1. Genel Bakış

8 stajyer öğrenci, 8 ayrı proje, toplam ~24 uygulama. Her proje bu deponun kendi
alt klasöründe geliştirilir. Tüm kullanıcı arayüzleri ve dokümantasyon **Türkçe**.

| # | Klasör | Proje | Öğrenci | Durum |
|---|--------|-------|---------|-------|
| 1 | `01-camasirhane-erp/` | Çamaşırhane & Kuru Temizleme ERP | _(atanacak)_ | ⬜ Başlamadı |
| 2 | `02-oto-servis/` | Oto Servis & Bakım Yönetimi | _(atanacak)_ | ⬜ Başlamadı |
| 3 | `03-klinik-pms/` | Klinik & Poliklinik Yönetimi | _(atanacak)_ | ⬜ Başlamadı |
| 4 | `04-spor-salonu/` | Spor Salonu & Turnike Otomasyonu | _(atanacak)_ | ⬜ Başlamadı |
| 5 | `05-arac-satis-depo/` | Araç Üstü Satış & Depo Yönetimi | _(atanacak)_ | ⬜ Başlamadı |
| 6 | `06-apart-otel/` | Apart & Otel Rezervasyon Yönetimi | _(atanacak)_ | ⬜ Başlamadı |
| 7 | `07-emlak-crm/` | Emlak & Kiralama CRM | _(atanacak)_ | ⬜ Başlamadı |
| 8 | `08-kargo-dagitim/` | Kargo & Son Kilometre Dağıtım | _(atanacak)_ | ⬜ Başlamadı |

Durum kodları: ⬜ Başlamadı · 🟡 Devam ediyor · 🔵 Windows bekliyor · ✅ Tamamlandı

---

## 2. Teknoloji Dağılımı

Her projenin kendi içinde tutarlı, projeler arasında ise çeşitli olmasına dikkat edildi.

| # | Proje | Backend + Veritabanı | Masaüstü | Web | Mobil |
|---|-------|----------------------|----------|-----|-------|
| 1 | Çamaşırhane ERP | Express + PostgreSQL | **WinForms** (.NET 8) | React + Vite | **React Native** (Expo) |
| 2 | Oto Servis | **ASP.NET Core 8** + **SQL Server** (EF Core) | — | **Next.js** | **Flutter** (tablet) |
| 3 | Klinik PMS | **NestJS** + PostgreSQL (TypeORM) | **Electron** + React | React + Vite | **Flutter** |
| 4 | Spor Salonu | Express + **MySQL** | **WinForms** (.NET 8) | React + Vite | **React Native** (Expo) |
| 5 | Araç Satış & Depo | **ASP.NET Core 8** + **SQL Server** | **WinForms** (.NET 8) | — | **Flutter** + SQLite (offline) |
| 6 | Apart & Otel | Express + **MongoDB** (Mongoose) | — | **Next.js + Tailwind** | **React Native** (Expo) |
| 7 | Emlak CRM | **Laravel 11** + PostgreSQL | — | **Vue 3** + Vite | **Flutter** |
| 8 | Kargo & Dağıtım | Express + PostgreSQL | **Electron** + React | React + Vite | **React Native** (Expo) |

**Denge:** 4 Flutter / 4 React Native · 3 WinForms / 2 Electron · 4 Node.js / 2 .NET / 1 NestJS / 1 Laravel · React, Next.js ve Vue temsil ediliyor.

### PDF kapsamından bilinçli sapmalar

| Sapma | Sebep |
|-------|-------|
| **Redis kaldırıldı** (Proje 8) | Öğrenci seviyesinin çok üstünde. Aynı canlı takip işlevi düz PostgreSQL sorguları + periyodik yoklama (polling) ile yapılıyor. |
| **WPF kullanılmıyor**, sadece WinForms | Müşteri kararı: WPF eski/ağır. 3 masaüstü uygulaması da WinForms. |
| **SQL Server Docker'da** | macOS için yerel SQL Server kurulumu yok. Diğer tüm veritabanları yerel (Homebrew). |

---

## 3. Ortak Kurallar (tüm projeler için geçerli)

### Kod ve dil
- **Arayüz + README + tüm kullanıcı metinleri: Türkçe.**
- **Kod tanımlayıcıları (değişken, fonksiyon, tablo, API yolu): İngilizce.** Arada kısa Türkçe yorumlar.
- **Seviye: iyi bir 3./4. sınıf öğrencisi.** Mantık doğrudan controller içinde, servis/repository katmanı yok,
  basit `if` doğrulamaları, projeler arasında bir miktar tekrar, tasarım deseni yok, test yok, CI yok.
  Çalışır ve doğrudur — ama "senior" görünmez.

### Veri
- Türkçe demo verisi: gerçekçi isimler, İstanbul/Ankara ilçeleri, `+90 5xx` telefonlar, ₺ tutarlar,
  Türkçe ürün/hizmet adları, sahte TC formatlı kimlik numaraları.
- Her projede `db/seed` betiği ve `db/schema` (veya migration) dosyaları.

### Kimlik doğrulama
- JWT (Laravel'de Sanctum). Rolleri projeye göre değişir (admin / kasiyer / kurye / teknisyen ...).
- Demo hesapları her README'de yazılı, kasten basit: `admin / 123456`.

### Her uygulamada
- `.env.example`
- `README.md` (Türkçe): kurulum, çalıştırma, demo hesapları, ekran görüntüleri

### Port dağılımı

| Proje | API | Web | Diğer |
|-------|-----|-----|-------|
| 1 | 3101 | 5101 | — |
| 2 | 5102 | 3102 (Next.js) | SQL Server 1433 |
| 3 | 3103 | 5103 | Electron |
| 4 | 3104 | 5104 | — |
| 5 | 5105 | — | SQL Server 1434 |
| 6 | 3106 | 3116 (Next.js) | — |
| 7 | 8107 | 5107 | — |
| 8 | 3108 | 5108 | Electron |

### Veritabanı dağılımı

| Proje | Sunucu | Veritabanı adı |
|-------|--------|----------------|
| 1 | PostgreSQL (yerel) | `laundry_erp` |
| 2 | SQL Server (Docker :1433) | `garage_db` |
| 3 | PostgreSQL (yerel) | `clinic_db` |
| 4 | MySQL (yerel) | `gym_db` |
| 5 | SQL Server (Docker :1434) | `vansales_db` |
| 6 | MongoDB (yerel, mevcut 4.4) | `pms_rentals` |
| 7 | PostgreSQL (yerel) | `realestate_crm` |
| 8 | PostgreSQL (yerel) | `courier_db` |

---

## 4. Geliştirme Ortamı (Faz 0)

Bu Mac: macOS 13.7.8, **Intel (x86_64)**.

| Araç | Mevcut durum | Yapılacak | Kim için |
|------|--------------|-----------|----------|
| Node.js 22 + npm/pnpm | ✅ kurulu | — | 1,3,4,6,8 |
| MongoDB 4.4 | ✅ kurulu | — | 6 |
| Docker 20.10 | ✅ kurulu | SQL Server 2022 imajı çekilecek | 2,5 |
| Android SDK + AVD (`Pixel_4_API_33`) | ✅ kurulu | `adb` PATH'e eklenecek | tüm mobil |
| Xcode | ✅ kurulu | (kullanılmayacak — Android hedefli) | — |
| .NET SDK | ⚠️ 5.0.407 (EOL) | `brew install --cask dotnet-sdk` (.NET 8) | 2,5 + WinForms |
| Flutter / Dart | ❌ yok | `brew install --cask flutter` + `flutter doctor --android-licenses` | 2,3,5,7 |
| PHP + Composer | ❌ yok | `brew install php composer` | 7 |
| PostgreSQL | ❌ yok | `brew install postgresql@16` | 1,3,7,8 |
| MySQL | ❌ yok | `brew install mysql` | 4 |

---

## 5. Windows Devri (WinForms)

macOS'ta WinForms projesi **oluşturulamaz ve derlenemez** (Windows Desktop SDK yok).
ASP.NET Core tarafı Mac'te sorunsuz çalışıyor, oraya gerek yok.

**Windows'ta oluşturulacak 3 uygulama:**

| Proje | Uygulama | Klasör |
|-------|----------|--------|
| 1 | Çamaşırhane kasa & etiket | `01-camasirhane-erp/apps/desktop-winforms/` |
| 4 | Spor salonu kasa & turnike | `04-spor-salonu/apps/desktop-winforms/` |
| 5 | Merkez depo yönetimi | `05-arac-satis-depo/apps/desktop-winforms/` |

**Süreç (tek seferlik):**
1. Depoyu Windows makinesine klonla.
2. `.NET 8 SDK` kurulu olduğundan emin ol.
3. PowerShell'de: `./tools/scaffold-winforms.ps1`
4. `git add . && git commit -m "WinForms iskeletleri" && git push`
5. Mac'te `git pull` — C# kodu buradan yazılır, Windows'ta derlenip çalıştırılır.

**Durum:** ✅ Betik hazır (`tools/scaffold-winforms.ps1`, ayrıntı: `docs/windows-handoff.md`) → ⬜ Windows'a gönderilmedi → ⬜ Geri senkronize edilmedi

---

## 6. Çalışma Sırası

Projeler **sırayla ve tam bitirilerek** geliştirilir. Bir proje bitmeden diğerine geçilmez.

Her proje için bitiş tanımı (Definition of Done):
- [ ] Veritabanı şeması + Türkçe demo verisi
- [ ] Backend API çalışıyor, tüm ana akışlar uçtan uca
- [ ] Web / masaüstü istemci çalışıyor (Türkçe arayüz)
- [ ] Mobil uygulama emülatörde çalıştırıldı ve ekran görüntüsü alındı
- [ ] Türkçe `README.md` + demo hesapları
- [ ] `plan.md` durumu güncellendi

---

## 7. Proje Detayları ve İlerleme

### Proje 1 — Çamaşırhane & Kuru Temizleme ERP  ⬜
`01-camasirhane-erp/` · **Uygulama planı:** `docs/superpowers/plans/2026-09-01-01-camasirhane-erp.md` (18 görev)

**Ana akış:** Sipariş alma → aşama takibi (Teslim Alındı → Yıkamada → Ütüde → Hazır → Teslim Edildi)
→ suya dayanıklı barkod etiket basımı → kurye atama → müşteri takibi → gün sonu kasa raporu.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | Express + PostgreSQL | ⬜ |
| `apps/desktop-winforms` | WinForms (.NET 8) — kasa, etiket | ⬜ Windows bekliyor |
| `apps/web-admin` | React + Vite | ⬜ |
| `apps/mobile` | React Native (Expo) — kurye + müşteri | ⬜ |

---

### Proje 2 — Oto Servis & Bakım Yönetimi  ⬜
`02-oto-servis/`

**Ana akış:** Job Card açma → tablet ile arıza tespiti + fotoğraf → depodan parça çekme
→ işçilik + parça kalemleri → detaylı servis faturası.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | ASP.NET Core 8 + SQL Server (EF Core) | ⬜ |
| `apps/dashboard` | Next.js | ⬜ |
| `apps/tablet` | Flutter | ⬜ |

---

### Proje 3 — Klinik & Poliklinik Yönetimi  ⬜
`03-klinik-pms/`

**Ana akış:** Randevu slotları → muayene kaydı + reçete → sarf malzeme stoğu
→ çok seanslı fatura ve taksitli tahsilat → resepsiyon check-in.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | NestJS + PostgreSQL (TypeORM) | ⬜ |
| `apps/web` | React + Vite (hasta/yönetim portalı) | ⬜ |
| `apps/reception-desktop` | Electron + React | ⬜ |
| `apps/mobile` | Flutter (hasta) | ⬜ |

---

### Proje 4 — Spor Salonu & Turnike Otomasyonu  ⬜
`04-spor-salonu/`

**Ana akış:** Üyelik paketleri → QR/RFID turnike girişi (donanım simülasyonu)
→ kasa/POS satışı → kalan seans takibi → üye mobil QR kodu.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | Express + MySQL | ⬜ |
| `apps/desktop-winforms` | WinForms (.NET 8) — kasa + turnike paneli | ⬜ Windows bekliyor |
| `apps/web-admin` | React + Vite | ⬜ |
| `apps/mobile` | React Native (Expo) | ⬜ |

---

### Proje 5 — Araç Üstü Satış & Depo Yönetimi  ⬜
`05-arac-satis-depo/`

**Ana akış:** Merkez depo stoğu → araca yükleme → sahada **çevrimdışı** nakit/vadeli fatura
+ fiş basımı → internet gelince senkronizasyon → GPS konum takibi.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | ASP.NET Core 8 + SQL Server | ⬜ |
| `apps/desktop-winforms` | WinForms (.NET 8) — merkez depo | ⬜ Windows bekliyor |
| `apps/mobile` | Flutter + SQLite (offline-first) + GPS | ⬜ |

---

### Proje 6 — Apart & Otel Rezervasyon Yönetimi  ⬜
`06-apart-otel/`

**Ana akış:** Sürükle-bırak oda takvimi → konaklama maliyeti takibi
→ çıkışta otomatik temizlik/bakım görevi → ekip mobil görev akışı.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | Express + MongoDB (Mongoose) | ⬜ |
| `apps/web` | Next.js + Tailwind CSS | ⬜ |
| `apps/mobile` | React Native (Expo) — temizlik/bakım ekibi | ⬜ |

---

### Proje 7 — Emlak & Kiralama CRM  ⬜
`07-emlak-crm/`

**Ana akış:** Portföy ve talep kaydı → otomatik eşleştirme → kira sözleşmesi
→ taksit takvimi + hatırlatma → evrak arşivi.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | Laravel 11 + PostgreSQL | ⬜ |
| `apps/web` | Vue 3 + Vite | ⬜ |
| `apps/mobile` | Flutter (danışman) | ⬜ |

---

### Proje 8 — Kargo & Son Kilometre Dağıtım  ⬜
`08-kargo-dagitim/`

**Ana akış:** Gönderi girişi → toplu irsaliye/barkod basımı → şube ayrıştırma
→ sürücü teslimatı (OTP + imza) → COD tahsilatı → tacir portalı takibi.

| Uygulama | Teknoloji | Durum |
|----------|-----------|-------|
| `apps/api` | Express + PostgreSQL | ⬜ |
| `apps/desktop` | Electron + React — giriş & irsaliye basımı | ⬜ |
| `apps/web-merchant` | React + Vite (tacir portalı) | ⬜ |
| `apps/mobile` | React Native (Expo) — sürücü | ⬜ |

---

## 8. Karar Kaydı

| Tarih | Karar |
|-------|-------|
| 2026-09-01 | Derinlik: "demo-complete" — tüm ana akışlar uçtan uca çalışır, bulut dağıtımı ve test paketi yok. |
| 2026-09-01 | .NET SDK 8 bu Mac'e kurulacak; sadece 3 WinForms uygulaması Windows'a devredilecek. |
| 2026-09-01 | Veritabanları yerel kurulum (SQL Server hariç — Docker). |
| 2026-09-01 | Redis kaldırıldı (öğrenci seviyesi için fazla ileri). |
| 2026-09-01 | WPF kullanılmayacak; masaüstü .NET uygulamaları WinForms. |
| 2026-09-01 | Kod seviyesi: "junior-but-clean". Kod İngilizce, arayüz Türkçe. |
| 2026-09-01 | Tek depo, 8 alt klasör. |

---

## 9. Değişiklik Günlüğü

| Tarih | Değişiklik |
|-------|------------|
| 2026-09-01 | Plan oluşturuldu. Tasarım dokümanı ve Windows devir paketi hazırlandı. Faz 0 kurulumu başlamadı. |
| 2026-09-01 | Proje 1 için 18 görevlik uygulama planı yazıldı. |
