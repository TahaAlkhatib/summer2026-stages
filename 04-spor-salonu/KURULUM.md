# Spor Salonu & Turnike Otomasyonu — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20+ | https://nodejs.org | API, Web paneli, Mobil |
| **Docker Desktop** | güncel | https://www.docker.com/products/docker-desktop/ | MySQL veritabanı |
| **Android Studio** | güncel | https://developer.android.com/studio | Mobil emülatör |
| **.NET SDK** | 8+ | https://dotnet.microsoft.com/download | Kasa uygulaması (**sadece Windows**) |

Kontrol:

```bash
node --version      # v20 veya üzeri
docker --version
dotnet --list-sdks  # Windows'ta
```

> **MySQL neden Docker'da?** macOS 13 (Ventura) için Homebrew artık hazır paket
> yayınlamıyor; `brew install mysql` kaynaktan derleme yapıyor ve saatler sürüyor.
> Docker ile saniyeler içinde hazır oluyor. Windows veya Linux'ta MySQL'i yerel
> kurmak isterseniz `apps/api/.env` içindeki bağlantı bilgilerini güncellemeniz yeterli.

---

## 2. Veritabanını Başlatma (MySQL)

Proje kök klasöründe:

```bash
docker compose up -d
```

Kontrol:

```bash
docker ps       # sporsalonu-mysql konteyneri "Up" görünmeli
```

Bağlantı bilgileri (`apps/api/.env` içinde tanımlı):

| Alan | Değer |
|------|-------|
| Sunucu | `localhost:3306` |
| Veritabanı | `gym_db` |
| Kullanıcı | `gym_user` |
| Şifre | `gym123` |

### Tabloları oluşturun

Konteyner ilk açılışta hazır olana kadar ~20 saniye bekleyin, sonra:

```bash
docker exec -i sporsalonu-mysql mysql -ugym_user -pgym123 gym_db < db/schema.sql
```

> Veritabanı `utf8mb4` / `utf8mb4_turkish_ci` ile oluşturulur; Türkçe karakterli
> aramalar bu sayede doğru çalışır.

---

## 3. API (Sunucu) — `apps/api`

**Diğer tüm uygulamalar bu sunucuya bağlanır, önce bu çalıştırılmalıdır.**

```bash
cd apps/api
npm install
cp .env.example .env
npm run seed      # Türkçe demo verisini yükler
npm run dev
```

Başarılı olursa: `Spor Salonu API çalışıyor: http://localhost:3104`

Test: http://localhost:3104/api/health → `{"durum":"calisiyor"}`

> `npm run seed` veritabanındaki **tüm veriyi siler** ve demo verisini baştan yükler.

---

## 4. Yönetim Paneli — `apps/web-admin`

**API çalışır durumdayken**, yeni bir terminal:

```bash
cd apps/web-admin
npm install
cp .env.example .env
npm run dev
```

Tarayıcıda: **http://localhost:5104**

Turnike simülasyonu için soldaki menüden **Turnike** sayfasına gidin ve
bir üye QR kodu yazıp Enter'a basın (örn. `UYE-2026-00001`).

---

## 5. Üye Mobil Uygulaması — `apps/mobile`

Üyelerin QR kodunu gösterdiği, üyelik ve giriş geçmişini takip ettiği uygulama.

```bash
emulator -avd Pixel_4_API_33      # emülatörü başlat
cd apps/mobile
npm install
npx expo start --android
```

> **8081 portu meşgul** hatası alırsanız: `npx expo start --android --port 8082`

> **Sunucuya bağlanamıyorsa:** `src/api.js` içindeki `baseURL` değerine bakın.
> Android emülatöründe bilgisayarın `localhost` adresi **`10.0.2.2`** olur.
> Gerçek telefonda bilgisayarınızın yerel IP adresini yazın
> (örn. `http://192.168.1.25:3104/api`).

---

## 6. Kasa Uygulaması — `apps/desktop-winforms` (sadece Windows)

WinForms uygulaması yalnızca Windows'ta derlenir ve çalışır.

```powershell
cd apps\desktop-winforms
dotnet build SporSalonuKasa.sln
dotnet run --project SporSalonuKasa
```

Veya `SporSalonuKasa.sln` dosyasını **Visual Studio** ile açıp F5'e basın.
Formlar Visual Studio tasarımcısından düzenlenebilir.

> API'nin çalışır durumda olması gerekir. Farklı bir bilgisayardaki sunucuya
> bağlanmak için `ApiClient.cs` içindeki `BaseUrl` değerini değiştirin.

---

## 7. Demo Hesapları

### Personel (Web paneli ve kasa uygulaması)

| Kullanıcı Adı | Şifre | Rol |
|---------------|-------|-----|
| `admin` | `123456` | Yönetici (paket/ürün ekleme) |
| `kasiyer1` | `123456` | Kasiyer (üyelik satışı, turnike, büfe) |
| `antrenor1` | `123456` | Antrenör |
| `antrenor2` | `123456` | Antrenör |

### Üye (Mobil uygulama)

Üyeler personel değildir; **telefon numarası + üye kodunun son 4 hanesi** ile giriş yapar.

| Üye | Telefon | Kod (son 4) | Durum |
|-----|---------|-------------|-------|
| Elif Şahin | `+90 535 401 11 21` | `0001` | Aktif aylık üyelik |
| Merve Doğan | `+90 537 403 13 23` | `0003` | 10 seanslık paket |
| Ayşe Koç | `+90 539 405 15 25` | `0005` | Borçlu üyelik |

### Turnike testi için hazır senaryolar

| Kod | Beklenen sonuç |
|-----|----------------|
| `UYE-2026-00001` | ✅ Giriş izni (aylık sınırsız) |
| `1002` (RFID) | ✅ Giriş izni (3 aylık) |
| `UYE-2026-00003` | ✅ Giriş izni, seans düşer |
| `UYE-2026-00004` | ❌ Üyelik süresi dolmuş |
| `UYE-2026-00007` | ❌ Seans hakkı bitmiş |
| `SAHTE-9999` | ❌ Kart tanınmadı |

---

## 8. Çalıştırma Sırası (özet)

| # | Terminal | Komut | Adres |
|---|----------|-------|-------|
| 1 | — | `docker compose up -d` | MySQL :3306 |
| 2 | 1. terminal | `cd apps/api && npm run dev` | http://localhost:3104 |
| 3 | 2. terminal | `cd apps/web-admin && npm run dev` | http://localhost:5104 |
| 4 | 3. terminal | `cd apps/mobile && npx expo start --android` | emülatör |
| 5 | Windows | `dotnet run --project SporSalonuKasa` | masaüstü |

**API kapalıyken diğer uygulamalar veri gösteremez.**

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `ECONNREFUSED 127.0.0.1:3306` | MySQL konteyneri hazır değil. `docker ps` ile kontrol edin, 20 sn bekleyin. |
| `Table 'gym_db.users' doesn't exist` | Şema yüklenmemiş. 2. adımdaki `schema.sql` komutunu çalıştırın. |
| `Access denied for user 'gym_user'` | Konteyner eski şifreyle oluşturulmuş. `docker compose down -v && docker compose up -d` |
| Giriş yapılamıyor | Demo verisi yüklenmemiş. `npm run seed` çalıştırın. |
| Turnikede "Kart tanınmadı" | Kodu tam yazın (örn. `UYE-2026-00001`), büyük harf duyarlı değildir. |
| Panel boş geliyor | API kapalı. Tarayıcıda F12 → Console'a bakın. |
| Mobilde "Sunucuya bağlanılamadı" | `src/api.js` içindeki adres yanlış. 5. adımdaki nota bakın. |
| `Port 8081 is running ...` | `npx expo start --android --port 8082` kullanın. |
| Windows'ta `dotnet` bulunamıyor | .NET SDK kurulu değil. 1. adımdaki bağlantıdan indirin. |
| `Port 3104 already in use` | `lsof -ti:3104 \| xargs kill` |
