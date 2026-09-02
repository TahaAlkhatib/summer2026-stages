# Araç Üstü Satış & Depo Yönetimi — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **.NET SDK** | 9.0 | https://dotnet.microsoft.com/download | API ve Depo uygulaması |
| **Docker Desktop** | güncel | https://www.docker.com/products/docker-desktop/ | SQL Server veritabanı |
| **Flutter SDK** | 3.24.5 | https://docs.flutter.dev/get-started/install | Saha mobil uygulaması |
| **Android Studio** | güncel | https://developer.android.com/studio | Android emülatörü |

Kontrol:

```bash
dotnet --list-sdks     # 9.0.x görünmeli
docker --version
flutter doctor
```

> **SQL Server neden Docker'da?** SQL Server macOS'a doğrudan kurulamıyor,
> Windows'ta da kurulumu uzun sürüyor. Docker ile tek komutta hazır oluyor.
> Bilgisayarınızda kurulu bir SQL Server varsa `apps/api/appsettings.json`
> içindeki bağlantı adresini değiştirmeniz yeterli.

> **Flutter sürümü önemli.** Proje Flutter **3.24.5** ile geliştirildi.
> `pubspec.yaml` içindeki `dependency_overrides` bloğu (`geolocator_android: 4.5.5`)
> bu sürüm için gereklidir. Daha yeni bir Flutter kullanıyorsanız o bloğu
> silip `flutter pub get` çalıştırın.

---

## 2. Veritabanını Başlatma (SQL Server)

Proje kök klasöründe (`05-arac-satis-depo`):

```bash
docker compose up -d
```

Kontrol:

```bash
docker ps       # vansales-sql konteyneri "Up" görünmeli
```

Bağlantı bilgileri (`apps/api/appsettings.json` içinde tanımlı):

| Alan | Değer |
|------|-------|
| Sunucu | `localhost,1434` |
| Veritabanı | `vansales_db` |
| Kullanıcı | `sa` |
| Şifre | `VanSales2026!` |

> Tabloları elle oluşturmanıza gerek yok. API ilk açılışta
> `EnsureCreated()` ile tabloları kurar ve `SeedData` ile örnek veriyi yükler.

---

## 3. API (Sunucu) — `apps/api`

```bash
cd apps/api
dotnet restore
dotnet run
```

Sunucu şu adreste açılır: **http://localhost:5105**

Emülatörden veya başka bir cihazdan bağlanacaksanız:

```bash
dotnet run --urls http://0.0.0.0:5105
```

Test:

```bash
curl -X POST http://localhost:5105/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"depo1","password":"123456"}'
```

Bir `token` dönüyorsa API çalışıyor demektir.

---

## 4. Saha Mobil Uygulaması — `apps/mobile`

```bash
cd apps/mobile
flutter pub get
flutter run
```

### Sunucu adresi

`lib/api.dart` dosyasının en üstünde:

```dart
const String temelAdres = 'http://10.0.2.2:5105/api';
```

| Nerede çalıştırıyorsunuz | Yazılacak adres |
|--------------------------|-----------------|
| Android emülatörü | `http://10.0.2.2:5105/api` (varsayılan) |
| Gerçek telefon (aynı Wi-Fi) | `http://BILGISAYAR_IP:5105/api` |

Bilgisayarınızın IP adresi: macOS/Linux `ifconfig`, Windows `ipconfig`.
Gerçek telefonda API'yi mutlaka `--urls http://0.0.0.0:5105` ile başlatın.

### İzinler

Uygulama ilk açılışta **konum izni** ister. İzin verilmezse satış yine yapılır,
sadece faturaya GPS konumu eklenmez.

---

## 5. Depo Yönetimi Uygulaması — `apps/desktop-winforms` (sadece Windows)

WinForms sadece Windows'ta derlenir ve çalışır.

```bash
cd apps/desktop-winforms
dotnet build
dotnet run --project DepoYonetim
```

Visual Studio ile: `DepoYonetim.sln` dosyasını açıp **F5**.

Formlar tasarımcıda düzenlenebilir (`.Designer.cs` dosyaları vardır):
Solution Explorer'da forma çift tıklayarak tasarımcıyı açabilirsiniz.

API başka bir bilgisayardaysa `ApiClient.cs` içindeki adresi değiştirin:

```csharp
public static string BaseUrl = "http://localhost:5105/api";
```

---

## 6. Demo Hesapları

Şifre hepsinde: **123456**

### Depo uygulaması (Windows)

| Kullanıcı | Rol | Yetki |
|-----------|-----|-------|
| `admin` | Yönetici | Her şey + yeni ürün ekleme |
| `depo1` | Depo Sorumlusu | Stok, yükleme, raporlar |

### Mobil uygulama (saha)

| Kullanıcı | Araç | Açıklama |
|-----------|------|----------|
| `saha1` | 34 VS 001 | Araçta stok var, satış yapabilir |
| `saha2` | 34 VS 002 | İkinci araç |

> Saha kullanıcıları depo uygulamasına giriş yapamaz, uygulama uyarı verir.

---

## 7. Çevrimdışı Çalışmayı Test Etme

Projenin en önemli özelliği budur, sunumda mutlaka gösterin:

1. Mobil uygulamada `saha1` ile giriş yapın (ürün listesi cihaza iner).
2. Emülatörde interneti kapatın:
   ```bash
   adb shell svc wifi disable
   adb shell svc data disable
   ```
   Üst şerit **"Çevrimdışı"** olur.
3. Müşteri seçip ürün ekleyin ve **Faturayı Kes** deyin.
   Fatura cihaza kaydedilir, şeritte *"1 kayıt gönderilmeyi bekliyor"* yazar.
4. **Faturalar** sekmesinde fatura turuncu bulut ikonuyla görünür,
   fatura numarası henüz yoktur.
5. İnterneti geri açın:
   ```bash
   adb shell svc wifi enable
   adb shell svc data enable
   ```
6. **Senkronize Et**'e basın. Fatura yeşil olur ve sunucudan gelen
   numarayı (`FS-2026-00000X`) alır.
7. **Senkronize Et**'e tekrar basın — fatura ikinci kez kaydedilmez.
   Sunucu `offline_id` alanı sayesinde mükerrer kaydı engeller.

---

## 8. Çalıştırma Sırası (özet)

```bash
# 1. Veritabanı
docker compose up -d

# 2. API  (yeni terminal)
cd apps/api && dotnet run --urls http://0.0.0.0:5105

# 3. Mobil  (yeni terminal)
cd apps/mobile && flutter run

# 4. Depo uygulaması  (sadece Windows, yeni terminal)
cd apps/desktop-winforms && dotnet run --project DepoYonetim
```

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `Sunucuya bağlanılamadı` (mobil) | API'yi `--urls http://0.0.0.0:5105` ile başlatın; emülatörde adres `10.0.2.2` olmalı |
| API açılırken veritabanı hatası | `docker ps` ile konteyneri kontrol edin, ilk açılışta ~30 sn bekleyin |
| `compileSdkVersion is not specified` (Flutter) | `pubspec.yaml` içindeki `dependency_overrides` bloğunun durduğundan emin olun, sonra `flutter clean && flutter pub get` |
| Konum alınamıyor | Emülatörde Extended Controls > Location'dan bir konum gönderin; izin verilmediyse satış yine çalışır |
| WinForms derlenmiyor (macOS/Linux) | Normaldir. WinForms sadece Windows'ta çalışır |
| Veritabanını sıfırlamak | `docker compose down -v && docker compose up -d`, sonra API'yi yeniden başlatın |
