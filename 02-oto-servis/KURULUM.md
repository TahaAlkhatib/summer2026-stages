# Oto Servis & Bakım Yönetimi — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **.NET SDK** | 9.0 | https://dotnet.microsoft.com/download/dotnet/9.0 | API |
| **Docker Desktop** | güncel | https://www.docker.com/products/docker-desktop/ | SQL Server veritabanı |
| **Node.js** | 20+ | https://nodejs.org | Yönetim paneli |
| **Flutter** | **3.24.5** | https://docs.flutter.dev/get-started/install | Tablet uygulaması |
| **Android Studio** | güncel | https://developer.android.com/studio | Tablet emülatörü |

Kontrol:

```bash
dotnet --version    # 9.0.x
docker --version
node --version      # v20 veya üzeri
flutter --version   # 3.24.5
```

> ⚠️ **macOS 13 (Ventura) kullanıyorsanız Flutter sürümü önemlidir.**
> Flutter 3.29 ve sonrası macOS 14+ gerektirir. macOS 13'te Flutter'ı şu şekilde sabitleyin:
> ```bash
> git clone https://github.com/flutter/flutter.git ~/flutter
> cd ~/flutter && git checkout 3.24.5
> export PATH="$HOME/flutter/bin:$PATH"
> ```
> **`flutter upgrade` çalıştırmayın**, Flutter kullanılamaz hâle gelir.

---

## 2. Veritabanını Başlatma (SQL Server)

SQL Server, Docker üzerinde çalışır. Proje kök klasöründe:

```bash
docker compose up -d
```

Kontrol:

```bash
docker ps        # otoservis-sql konteyneri "Up" görünmeli
```

Bağlantı bilgileri (`apps/api/appsettings.json` içinde tanımlı):

| Alan | Değer |
|------|-------|
| Sunucu | `localhost,1433` |
| Veritabanı | `garage_db` |
| Kullanıcı | `sa` |
| Şifre | `OtoServis2026!` |

> Veritabanı ve tablolar **elle oluşturulmaz.** API ilk açılışta EF Core ile
> `garage_db` veritabanını ve tabloları kendisi oluşturur, ardından Türkçe demo
> verisini yükler.

Veritabanını sıfırdan kurmak isterseniz:

```bash
docker compose down -v    # veri kalıcı biriminin de silinmesi için -v
docker compose up -d
```

---

## 3. API (Sunucu) — `apps/api`

Diğer tüm uygulamalar bu sunucuya bağlanır, bu yüzden **önce bu çalıştırılmalıdır.**

```bash
cd apps/api
dotnet restore
dotnet run
```

Başarılı olursa: `Now listening on: http://localhost:5102`

Test: tarayıcıda http://localhost:5102/api/health → `{"durum":"calisiyor"}`

> İlk çalıştırma, SQL Server konteynerinin tam olarak hazır olmasını bekler.
> Bağlantı hatası alırsanız 30 saniye bekleyip tekrar deneyin.

---

## 4. Yönetim Paneli — `apps/dashboard`

**API çalışır durumdayken**, yeni bir terminal açın:

```bash
cd apps/dashboard
npm install
cp .env.example .env.local
npm run dev
```

Tarayıcıda: **http://localhost:3102**

---

## 5. Tablet Uygulaması — `apps/tablet`

Teknisyenlerin arıza tespiti ve fotoğraf çektiği Flutter uygulaması.

### 5.1. Emülatörü başlatın

Android Studio → **Device Manager** → bir tablet/telefon cihazı çalıştırın.

Terminalden:

```bash
emulator -list-avds
emulator -avd Pixel_4_API_33
```

### 5.2. Uygulamayı çalıştırın

**API çalışır durumdayken:**

```bash
cd apps/tablet
flutter pub get
flutter run
```

> **Sunucuya bağlanamıyorsa:** `lib/api.dart` dosyasındaki `temelAdres` değerini
> kontrol edin. Android emülatöründe bilgisayarın `localhost` adresi **`10.0.2.2`**
> olarak görünür, bu yüzden adres `http://10.0.2.2:5102/api` şeklindedir.
> **Gerçek bir tablette** burayı bilgisayarınızın yerel IP adresiyle değiştirin
> (örnek: `http://192.168.1.25:5102/api`) ve tabletin aynı Wi-Fi ağında olduğundan
> emin olun.

APK üretmek için:

```bash
flutter build apk --release
# çıktı: build/app/outputs/flutter-apk/app-release.apk
```

---

## 6. Demo Hesapları

| Kullanıcı Adı | Şifre | Rol | Nerede kullanılır |
|---------------|-------|-----|-------------------|
| `admin` | `123456` | Yönetici | Panel (parça ekleme/stok girişi yetkisi) |
| `danisman1` | `123456` | Servis Danışmanı | Panel (iş emri açma, fatura) |
| `teknisyen1` | `123456` | Teknisyen | Tablet uygulaması |
| `teknisyen2` | `123456` | Teknisyen | Tablet uygulaması |

---

## 7. Çalıştırma Sırası (özet)

| # | Terminal | Komut | Adres |
|---|----------|-------|-------|
| 1 | — | `docker compose up -d` | SQL Server :1433 |
| 2 | 1. terminal | `cd apps/api && dotnet run` | http://localhost:5102 |
| 3 | 2. terminal | `cd apps/dashboard && npm run dev` | http://localhost:3102 |
| 4 | 3. terminal | `cd apps/tablet && flutter run` | emülatör |

**API kapalıyken panel ve tablet veri gösteremez.**

---

## 8. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `A network-related or instance-specific error` | SQL Server hazır değil. `docker ps` ile kontrol edin, 30 sn bekleyip tekrar deneyin. |
| `Login failed for user 'sa'` | Konteyner eski bir şifreyle oluşturulmuş. `docker compose down -v && docker compose up -d` |
| `NU1202: ... is not compatible with net9.0` | Paket sürümü .NET 10 istiyor. `dotnet add package X --version 9.0.19` ile sabitleyin. |
| Panelde veri gelmiyor | API kapalı. Tarayıcıda F12 → Console'a bakın. |
| Tabletten "Sunucuya bağlanılamadı" | `lib/api.dart` içindeki adres yanlış. 5.2 adımındaki nota bakın. |
| `VM initialization failed: Current Mac OS X version 13.0 is lower than 14.0` | Flutter sürümü çok yeni. 1. adımdaki nota göre 3.24.5'e geçin. |
| Fotoğraf yüklenmiyor | Emülatörde kamera yerine **Galeri** seçeneğini kullanın. |
| `Port 5102 already in use` | Önceki API hâlâ çalışıyor. `lsof -ti:5102 \| xargs kill` |
