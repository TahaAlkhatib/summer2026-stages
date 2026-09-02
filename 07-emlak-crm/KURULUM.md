# Emlak & Kiralama CRM — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm
adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **PHP** | 8.3+ | Windows: https://windows.php.net/download veya Laragon / XAMPP | API |
| **Composer** | 2.x | https://getcomposer.org/download/ | API |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ | Veritabanı |
| **Node.js** | 20+ | https://nodejs.org | Web paneli |
| **Flutter SDK** | 3.24.5 | https://docs.flutter.dev/get-started/install | Mobil uygulama |
| **Android Studio** | güncel | https://developer.android.com/studio | Android emülatörü |

Kontrol:

```bash
php --version           # 8.3 veya üzeri
composer --version
psql --version
node --version
flutter doctor
```

> **PHP eklentileri:** `pdo_pgsql`, `intl`, `zip`, `mbstring`, `fileinfo` açık
> olmalı. Windows'ta `php.ini` içinde ilgili `extension=` satırlarının başındaki
> `;` işaretini silmeniz yeterli. Kontrol:
> ```bash
> php -m
> ```

---

## 2. Veritabanı (PostgreSQL)

Kullanıcı ve veritabanını oluşturun:

```bash
psql -U postgres
```

```sql
CREATE USER realestate_user WITH PASSWORD 'realestate123';
CREATE DATABASE realestate_crm OWNER realestate_user ENCODING 'UTF8' TEMPLATE template0;
\q
```

> **Encoding UTF-8 olmalı.** `C` locale ile oluşturulan bir veritabanında
> `ILIKE` ile "Şahin", "Öztürk" gibi Türkçe aramalar sessizce boş sonuç döner.

Tabloları elle oluşturmanıza gerek yok; migration'lar bunu yapar (Adım 3).

---

## 3. API (Laravel) — `apps/api`

```bash
cd apps/api
composer install
cp .env.example .env        # zaten varsa atlayın
php artisan key:generate
php artisan migrate         # tabloları oluşturur
php artisan db:seed         # demo verisini yükler
php artisan serve --port=8107
```

Sunucu: **http://localhost:8107**

Test:

```bash
curl -X POST http://localhost:8107/api/auth/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"admin@emlak.com\",\"password\":\"123456\"}"
```

Bir `token` dönüyorsa API çalışıyor demektir.

> **Panel yavaş açılıyorsa:** Laravel'in geliştirme sunucusu varsayılan olarak
> aynı anda tek istek işler; panel açılışta 3 istek attığı için beklersiniz.
> Çözüm:
> ```bash
> # macOS / Linux
> PHP_CLI_SERVER_WORKERS=5 php artisan serve --port=8107
> # Windows (PowerShell)
> $env:PHP_CLI_SERVER_WORKERS=5; php artisan serve --port=8107
> ```

> `php artisan db:seed` **mevcut tüm kayıtları siler** ve demo verisini baştan
> yükler. Demo bozulursa tekrar çalıştırmanız yeterli.

### Yüklenen evraklar nereye gidiyor?

`storage/app/private/documents/` klasörüne. Bu klasör git'e gönderilmez.
Dosyalar sadece token ile `/api/documents/{id}/download` üzerinden indirilir.

---

## 4. Yönetim Paneli (Vue 3) — `apps/web`

```bash
cd apps/web
npm install
cp .env.example .env        # zaten varsa atlayın
npm run dev
```

Panel: **http://localhost:5107**

API başka bir adreste çalışıyorsa `.env` içindeki değeri değiştirin:

```
VITE_API_URL=http://localhost:8107/api
```

---

## 5. Danışman Uygulaması (Flutter) — `apps/mobile`

```bash
cd apps/mobile
flutter pub get
flutter run
```

### Sunucu adresi

`lib/api.dart` dosyasının en üstünde:

```dart
const String temelAdres = 'http://10.0.2.2:8107/api';
```

| Nerede çalıştırıyorsunuz | Yazılacak adres |
|--------------------------|-----------------|
| Android emülatörü | `http://10.0.2.2:8107/api` (varsayılan) |
| Gerçek telefon (aynı Wi-Fi) | `http://BILGISAYAR_IP:8107/api` |

Gerçek telefonda API'yi `php artisan serve --host=0.0.0.0 --port=8107` ile
başlatın; bilgisayarınızın IP adresini `ipconfig` (Windows) veya `ifconfig`
(macOS/Linux) ile öğrenebilirsiniz.

---

## 6. Demo Hesapları

Şifre hepsinde: **123456**

| E-posta | Rol | Nerede kullanılır |
|---------|-----|-------------------|
| `admin@emlak.com` | Yönetici | Web paneli (evrak silme yetkisi var) |
| `elif@emlak.com` | Danışman | Web paneli + mobil |
| `burak@emlak.com` | Danışman | Web paneli + mobil |
| `zeynep@emlak.com` | Danışman | Web paneli + mobil |

---

## 7. Sunumda Gösterilecek Akış

1. **Portföy** ekranında yeni bir ilan ekleyin (mal sahibi ve danışman seçerek).
2. **Müşteriler**'e bir müşteri ekleyin.
3. **Talepler**'de o müşteri için kriterli bir talep açın
   (örn. Kadıköy, kiralık, en fazla 35.000 ₺, 2+1 ve üzeri).
4. Talebin satırındaki **Eşleşenleri Gör** düğmesine basın —
   sistem kriterlere uyan portföyleri otomatik listeler.
5. **Randevular**'da eşleşen portföy için randevu oluşturun.
   Aynı danışmana bir saat içinde ikinci randevu vermeyi deneyin, sistem uyarır.
6. **Mobil uygulamada** danışman ile giriş yapın, randevuyu açın,
   ilgi seviyesi + not girip **Görüşmeyi Tamamla** deyin.
7. Web panelinde randevunun "Gerçekleşti" olduğunu ve notun göründüğünü gösterin.
8. **Sözleşmeler**'de kira sözleşmesi oluşturun (süre 12 ay).
   Kaydedince **12 aylık taksit takvimi otomatik oluşur**.
9. Sözleşme detayında bir taksiti **Tahsil Et** ile kısmen ödeyin —
   sistem "Kısmi tahsilat kaydedildi, kalan ... ₺" der.
10. Aynı ekrandan **evrak yükleyin** (PDF/JPG) ve **İndir** ile geri alın.
11. **Kira Tahsilatları** ekranında geciken ve yaklaşan ödemeleri gösterin.
12. **Raporlar**'da danışman performansı ve 6 aylık tahsilat grafiğini gösterin.

---

## 8. Çalıştırma Sırası (özet)

```bash
# 1. Veritabanı — PostgreSQL servisi çalışıyor olmalı

# 2. API  (yeni terminal)
cd apps/api && composer install && php artisan migrate && php artisan db:seed
php artisan serve --port=8107

# 3. Web paneli  (yeni terminal)
cd apps/web && npm install && npm run dev

# 4. Mobil  (yeni terminal)
cd apps/mobile && flutter pub get && flutter run
```

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `could not find driver` | `pdo_pgsql` eklentisi kapalı. `php.ini` içinde `extension=pdo_pgsql` satırını açın |
| `SQLSTATE[08006] connection refused` | PostgreSQL çalışmıyor veya `.env` içindeki port yanlış |
| `Please provide a valid cache path` | `php artisan cache:clear` ve `storage/framework` klasörlerinin var olduğundan emin olun |
| Panelde `Sunucuya bağlanılamadı` | API çalışıyor mu? `.env` içindeki `VITE_API_URL` doğru mu? |
| Panel yavaş açılıyor | `PHP_CLI_SERVER_WORKERS=5` ile başlatın (yukarıya bakın) |
| Mobilde `Sunucuya bağlanılamadı` | Emülatörde adres `10.0.2.2` olmalı, `localhost` değil |
| Evrak yüklenmiyor | Sadece PDF, JPG, PNG, DOC/DOCX ve en fazla 10 MB kabul edilir |
| Demo verisi karıştı | `cd apps/api && php artisan db:seed` |
| Veritabanını tamamen sıfırlamak | `php artisan migrate:fresh --seed` |
