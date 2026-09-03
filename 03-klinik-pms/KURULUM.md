# Klinik & Poliklinik Yönetim Sistemi — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20+ | https://nodejs.org | API, Web, Resepsiyon |
| **MongoDB** | 4.4+ | https://www.mongodb.com/try/download/community | Veritabanı |
| **Flutter** | **3.24.5** | https://docs.flutter.dev/get-started/install | Hasta uygulaması |
| **Android Studio** | güncel | https://developer.android.com/studio | Emülatör |

Kontrol:

```bash
node --version      # v20 veya üzeri
mongod --version    # 4.4 veya üzeri
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

MongoDB'de **elle veritabanı veya tablo oluşturmak gerekmez.** Servisin
çalışıyor olması yeterli:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows: MongoDB servisi kurulumdan sonra otomatik başlar
# Linux
sudo systemctl start mongod
```

Bağlantıyı kontrol etmek için:

```bash
mongo --eval "db.version()"      # MongoDB 4.x
mongosh --eval "db.version()"    # MongoDB 5+
```

> API ilk açılışta `clinic_db` veritabanını ve koleksiyonları kendisi
> oluşturur, ardından Türkçe demo verisini yükler.

> Bağlantı adresi `apps/api/.env` içindeki `MONGO_URL` değişkenindedir
> (varsayılan: `mongodb://localhost:27017/clinic_db`).

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
| 1 | — | MongoDB servisinin çalıştığından emin olun | `localhost:27017` |
| 2 | 1. terminal | `cd apps/api && npm run start:prod` | http://localhost:3103 |
| 3 | 2. terminal | `cd apps/web && npm run dev` | http://localhost:5103 |
| 4 | 3. terminal | `cd apps/reception-desktop && npm start` | masaüstü penceresi |
| 5 | 4. terminal | `cd apps/mobile && flutter run` | emülatör |

**API kapalıyken diğer uygulamalar veri gösteremez.**

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB servisi kapalı. 2. adımdaki komutu çalıştırın. |
| API açılıyor ama koleksiyon yok | Koleksiyonlar ilk kayıtta oluşur; demo verisi yüklendi mi diye logda `Demo verisi yüklendi.` satırını arayın. |
| Demo verisi gelmedi | `users` koleksiyonunda kayıt varsa seed çalışmaz. Sıfırlamak için `mongo clinic_db --eval "db.dropDatabase()"` (MongoDB 5+ için `mongosh`) çalıştırıp API'yi yeniden başlatın. |
| Web/resepsiyon boş geliyor | API kapalı. Tarayıcıda F12 → Console'a bakın. |
| Electron penceresi açılmıyor | `npm start` önce `vite build` çalıştırır; `dist/` klasörü oluştu mu kontrol edin. |
| Mobilde "Sunucuya bağlanılamadı" | `lib/api.dart` içindeki adres yanlış. 6. adımdaki nota bakın. |
| Mobilde "TC kimlik numarası veya telefon hatalı" | Telefonun **son 4 hanesini** girin (örn. `1323`). |
| `VM initialization failed ... version 13.0 is lower than 14.0` | Flutter sürümü çok yeni. 1. adımdaki nota göre 3.24.5'e geçin. |
| `Port 3103 already in use` | `lsof -ti:3103 \| xargs kill` |
