# Çamaşırhane ERP — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm adımları içerir.
Adımları sırayla uygulayın.

---

## 1. Gerekli Programlar

Başlamadan önce bilgisayarınızda şunlar kurulu olmalı:

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20 veya üzeri | https://nodejs.org | API, Web Paneli, Mobil |
| **PostgreSQL** | 16 veya üzeri | https://www.postgresql.org/download/ | Veritabanı |
| **Android Studio** | güncel | https://developer.android.com/studio | Mobil uygulama (emülatör) |
| **.NET SDK** | 8 veya üzeri | https://dotnet.microsoft.com/download | Kasa uygulaması (**sadece Windows**) |

Kurulumdan sonra kontrol edin:

```bash
node --version      # v20.x veya üzeri
psql --version      # 16.x veya üzeri
```

---

## 2. Veritabanını Hazırlama

### 2.1. Veritabanı ve kullanıcıyı oluşturun

PostgreSQL kurulduktan sonra terminalde:

```bash
psql postgres -c "CREATE ROLE laundry_user WITH LOGIN PASSWORD 'laundry123';"
psql postgres -c "CREATE DATABASE laundry_erp OWNER laundry_user;"
```

> **Windows'ta** `psql` komutu çalışmazsa, "SQL Shell (psql)" programını Başlat menüsünden açın.

### 2.2. Tabloları oluşturun

Proje klasöründe:

```bash
psql -h localhost -U laundry_user -d laundry_erp -f db/schema.sql
```

Şifre sorulduğunda: `laundry123`

Bu komut 8 tablo oluşturur: `users`, `customers`, `services`, `orders`,
`order_items`, `order_status_history`, `courier_tasks`, `payments`.

> ⚠️ **Önemli:** Veritabanı **UTF-8** kodlaması ve **C dışında** bir dil ayarı (locale)
> ile kurulmalıdır. `C` locale kullanılırsa "Şahin", "Öztürk" gibi Türkçe karakterli
> aramalar sonuç döndürmez. PostgreSQL'i elle başlatıyorsanız:
> `initdb -E UTF-8 --locale=en_US.UTF-8 <veri-dizini>`

---

## 3. API (Sunucu) — `apps/api`

Diğer tüm uygulamalar bu sunucuya bağlanır, bu yüzden **önce bu çalıştırılmalıdır.**

```bash
cd apps/api
npm install
cp .env.example .env
npm run seed      # Türkçe demo verisini yükler
npm run dev       # sunucuyu başlatır
```

Başarılı olursa şunu görürsünüz:

```
Çamaşırhane API çalışıyor: http://localhost:3101
```

**Test etmek için** tarayıcıda açın: http://localhost:3101/api/health
→ `{"durum":"calisiyor"}` yazmalı.

> `npm run seed` komutu veritabanındaki **tüm veriyi siler** ve demo verisini
> baştan yükler. Kendi verinizi girdiyseniz tekrar çalıştırmayın.

---

## 4. Web Yönetim Paneli — `apps/web-admin`

**API çalışır durumdayken**, yeni bir terminal açın:

```bash
cd apps/web-admin
npm install
cp .env.example .env
npm run dev
```

Tarayıcıda açın: **http://localhost:5101**

Giriş bilgileri için aşağıdaki "Demo Hesapları" bölümüne bakın.

---

## 5. Mobil Uygulama — `apps/mobile`

Kurye ve müşteri uygulaması. **Android emülatörü** üzerinde çalışır.

### 5.1. Emülatörü başlatın

Android Studio → **Device Manager** → bir cihaz oluşturup çalıştırın
(örnek: Pixel 4, Android 13).

Terminalden başlatmak isterseniz:

```bash
emulator -list-avds              # mevcut cihazları listeler
emulator -avd Pixel_4_API_33     # cihazı başlatır
```

### 5.2. Uygulamayı çalıştırın

**API çalışır durumdayken**, yeni bir terminal açın:

```bash
cd apps/mobile
npm install
npx expo start --android
```

İlk çalıştırmada Expo Go uygulaması emülatöre otomatik kurulur (1-2 dakika sürebilir).

> **8081 portu meşgul** hatası alırsanız başka bir port verin:
> `npx expo start --android --port 8082`

> **Uygulama sunucuya bağlanamıyorsa:** `src/api.js` dosyasındaki adresi kontrol edin.
> Android emülatöründe bilgisayarın `localhost` adresi **`10.0.2.2`** olarak görünür,
> bu yüzden adres `http://10.0.2.2:3101/api` şeklindedir. **Gerçek bir telefonda**
> test ediyorsanız burayı bilgisayarınızın yerel IP adresiyle değiştirin
> (örnek: `http://192.168.1.25:3101/api`) ve telefonun aynı Wi-Fi ağında olduğundan emin olun.

---

## 6. Kasa Uygulaması — `apps/desktop-winforms` (sadece Windows)

WinForms uygulaması **yalnızca Windows'ta** derlenir ve çalışır. macOS veya Linux'ta açılmaz.

```powershell
cd apps/desktop-winforms
dotnet build CamasirhaneKasa.sln
dotnet run --project CamasirhaneKasa
```

Veya `CamasirhaneKasa.sln` dosyasını **Visual Studio** ile açıp F5'e basın.

> API'nin çalışır durumda olması gerekir. Kasa uygulaması `http://localhost:3101/api`
> adresine bağlanır; farklı bir bilgisayardaki sunucuya bağlanmak için
> `ApiClient.cs` dosyasındaki `BaseUrl` değerini değiştirin.

---

## 7. Demo Hesapları

| Kullanıcı Adı | Şifre | Rol | Nerede kullanılır |
|---------------|-------|-----|-------------------|
| `admin` | `123456` | Yönetici | Web paneli (tüm yetkiler) |
| `kasiyer1` | `123456` | Kasiyer | Web paneli, Kasa uygulaması |
| `kurye1` | `123456` | Kurye | Mobil uygulama |

Müşteri sipariş takibi için **giriş gerekmez** — mobil uygulamadaki
"Sipariş Takibi" ekranından sipariş numarası (örn. `SP-2026-00001`)
veya etiket barkodu (örn. `SP-2026-00001-01`) ile sorgulanır.

---

## 8. Çalıştırma Sırası (özet)

Her açılışta sırayla:

| # | Terminal | Komut | Adres |
|---|----------|-------|-------|
| 1 | — | PostgreSQL servisinin çalıştığından emin olun | `localhost:5432` |
| 2 | 1. terminal | `cd apps/api && npm run dev` | http://localhost:3101 |
| 3 | 2. terminal | `cd apps/web-admin && npm run dev` | http://localhost:5101 |
| 4 | 3. terminal | `cd apps/mobile && npx expo start --android` | emülatör |
| 5 | Windows | `dotnet run --project CamasirhaneKasa` | masaüstü |

**API kapalıyken diğer uygulamalar veri gösteremez.**

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `ECONNREFUSED` / "Sunucuya bağlanılamadı" | API çalışmıyor. 3. adımı tekrar yapın. |
| `password authentication failed` | `.env` dosyasındaki `DB_PASSWORD` ile veritabanı şifresi uyuşmuyor. |
| `relation "users" does not exist` | Tablolar oluşturulmamış. 2.2 adımını çalıştırın. |
| Giriş yapılamıyor, "şifre hatalı" | Demo verisi yüklenmemiş. `npm run seed` çalıştırın. |
| Web paneli boş / veri gelmiyor | Tarayıcıda F12 → Console sekmesine bakın; genelde API kapalıdır. |
| Mobilde "Network Error" | `src/api.js` içindeki adres yanlış. 5.2 adımındaki nota bakın. |
| `Port 8081 is running ...` | `npx expo start --android --port 8082` kullanın. |
| Türkçe arama sonuç vermiyor | Veritabanı `C` locale ile kurulmuş. 2.2'deki uyarıya bakın. |
| Windows'ta `dotnet` bulunamıyor | .NET SDK kurulu değil. 1. adımdaki bağlantıdan indirin. |
