# Klinik & Poliklinik Yönetim Sistemi — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20+ | https://nodejs.org | API, Web, Resepsiyon |
| **PostgreSQL** | 16+ | https://www.postgresql.org/download/ | Veritabanı |
| **Flutter** | **3.24.5** | https://docs.flutter.dev/get-started/install | Hasta uygulaması |
| **Android Studio** | güncel | https://developer.android.com/studio | Emülatör |

Kontrol:

```bash
node --version      # v20 veya üzeri
psql --version      # 16.x
flutter --version   # 3.24.5
```

> ⚠️ **macOS 13 (Ventura) kullanıyorsanız**: Flutter 3.29+ macOS 14 gerektirir.
> ```bash
> git clone https://github.com/flutter/flutter.git ~/flutter
> cd ~/flutter && git checkout 3.24.5
> export PATH="$HOME/flutter/bin:$PATH"
> ```
> **`flutter upgrade` çalıştırmayın.**

---

## 2. Veritabanını Hazırlama

```bash
psql postgres -c "CREATE ROLE clinic_user WITH LOGIN PASSWORD 'clinic123';"
psql postgres -c "CREATE DATABASE clinic_db OWNER clinic_user;"
```

> Tablolar **elle oluşturulmaz.** API ilk açılışta TypeORM ile şemayı kendisi
> oluşturur ve Türkçe demo verisini yükler.

> ⚠️ Veritabanı **UTF-8** kodlaması ve **C dışında** bir dil ayarı ile kurulmalıdır,
> aksi hâlde "Şahin", "Doğan" gibi Türkçe aramalar sonuç döndürmez.

---

## 3. API (Sunucu) — `apps/api`

**Diğer tüm uygulamalar bu sunucuya bağlanır, önce bu çalıştırılmalıdır.**

```bash
cd apps/api
npm install
cp .env.example .env
npm run build
npm run start:prod
```

Geliştirme sırasında otomatik yeniden başlatma için: `npm run start:dev`

Başarılı olursa: `Klinik API çalışıyor: http://localhost:3103`

---

## 4. Web Portalı — `apps/web`

Doktor ve yönetici arayüzü. **API çalışır durumdayken:**

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

Tarayıcıda: **http://localhost:5103**

---

## 5. Resepsiyon Masaüstü Uygulaması — `apps/reception-desktop`

Electron ile çalışan masaüstü uygulaması (check-in, hızlı randevu, tahsilat).

```bash
cd apps/reception-desktop
npm install
cp .env.example .env
npm start          # önce derler, sonra Electron'u açar
```

Geliştirme modunda (canlı yenileme ile):

```bash
npm run dev        # Vite + Electron birlikte başlar
```

> İlk `npm install` sırasında Electron ikili dosyası (~100 MB) indirilir,
> bu biraz zaman alabilir.

---

## 6. Hasta Mobil Uygulaması — `apps/mobile`

Hastaların randevu, reçete ve ödemelerini gördüğü Flutter uygulaması.

```bash
emulator -avd Pixel_4_API_33     # emülatörü başlat
cd apps/mobile
flutter pub get
flutter run
```

> **Sunucuya bağlanamıyorsa:** `lib/api.dart` içindeki `temelAdres` değerine bakın.
> Android emülatöründe bilgisayarın `localhost` adresi **`10.0.2.2`** olarak görünür.
> Gerçek bir telefonda bilgisayarınızın yerel IP adresini yazın
> (örn. `http://192.168.1.25:3103/api`).

APK üretmek için: `flutter build apk --release`

---

## 7. Demo Hesapları

### Personel (Web portalı ve resepsiyon uygulaması)

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| `admin` | `123456` | Yönetici (malzeme ekleme/stok girişi) |
| `resepsiyon1` | `123456` | Resepsiyon (randevu, check-in, tahsilat) |
| `dr.aydin` | `123456` | Doktor — Dahiliye |
| `dr.demir` | `123456` | Doktor — Kardiyoloji |
| `dr.sahin` | `123456` | Doktor — Fizik Tedavi |

### Hasta (Mobil uygulama)

Hastalar personel değildir; **TC kimlik numarası + telefonun son 4 hanesi** ile giriş yaparlar.

| Hasta | TC Kimlik No | Telefon (son 4) |
|-------|--------------|-----------------|
| Merve Doğan | `10000000342` | `1323` |
| Elif Şahin | `10000000146` | `1121` |
| Burak Aydın | `10000000244` | `1222` |

---

## 8. Çalıştırma Sırası (özet)

| # | Terminal | Komut | Adres |
|---|----------|-------|-------|
| 1 | — | PostgreSQL servisinin çalıştığından emin olun | `localhost:5432` |
| 2 | 1. terminal | `cd apps/api && npm run start:prod` | http://localhost:3103 |
| 3 | 2. terminal | `cd apps/web && npm run dev` | http://localhost:5103 |
| 4 | 3. terminal | `cd apps/reception-desktop && npm start` | masaüstü penceresi |
| 5 | 4. terminal | `cd apps/mobile && flutter run` | emülatör |

**API kapalıyken diğer uygulamalar veri gösteremez.**

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `password authentication failed for user "clinic_user"` | 2. adımdaki rol oluşturma komutunu çalıştırın. |
| `database "clinic_db" does not exist` | 2. adımdaki veritabanı oluşturma komutunu çalıştırın. |
| API açılıyor ama tablo yok | `synchronize: true` ilk açılışta tabloları kurar; logda hata var mı bakın. |
| Demo verisi gelmedi | Veritabanında zaten kullanıcı varsa seed çalışmaz. Sıfırlamak için tabloları silip API'yi yeniden başlatın. |
| Web/resepsiyon boş geliyor | API kapalı. Tarayıcıda F12 → Console'a bakın. |
| Electron penceresi açılmıyor | `npm start` önce `vite build` çalıştırır; `dist/` klasörü oluştu mu kontrol edin. |
| Mobilde "Sunucuya bağlanılamadı" | `lib/api.dart` içindeki adres yanlış. 6. adımdaki nota bakın. |
| Mobilde "TC kimlik numarası veya telefon hatalı" | Telefonun **son 4 hanesini** girin (örn. `1323`). |
| `VM initialization failed ... version 13.0 is lower than 14.0` | Flutter sürümü çok yeni. 1. adımdaki nota göre 3.24.5'e geçin. |
| `Port 3103 already in use` | `lsof -ti:3103 \| xargs kill` |
