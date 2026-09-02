# Kargo & Son Kilometre Dağıtım — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm
adımları içerir. Projede **dört uygulama** var:

| Uygulama | Klasör | Kim kullanır |
|----------|--------|--------------|
| API | `apps/api` | — (sunucu) |
| Şube masaüstü | `apps/desktop` | Operasyon personeli |
| Tacir portalı | `apps/web-merchant` | Gönderici firmalar |
| Kurye uygulaması | `apps/mobile` | Kuryeler |

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20+ | https://nodejs.org | Hepsi |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ | Veritabanı |
| **Android Studio** | güncel | https://developer.android.com/studio | Kurye uygulaması emülatörü |
| **Expo Go** (isteğe bağlı) | güncel | Play Store | Gerçek telefonda deneme |

Kontrol:

```bash
node --version      # v20 veya üzeri
psql --version
```

---

## 2. Veritabanı (PostgreSQL)

Kullanıcı ve veritabanını oluşturun:

```bash
psql -U postgres
```

```sql
CREATE USER courier_user WITH PASSWORD 'courier123';
CREATE DATABASE courier_db OWNER courier_user ENCODING 'UTF8' TEMPLATE template0;
\q
```

> **Encoding UTF-8 olmalı.** `C` locale ile açılan bir veritabanında `ILIKE`
> ile "Şahin", "Öztürk" gibi Türkçe aramalar sessizce boş sonuç döner.

Tabloları oluşturun:

```bash
psql -U courier_user -d courier_db -f db/schema.sql
```

> Betik dosyanın başında tabloları **siler** (`DROP TABLE IF EXISTS`), yani
> veritabanını sıfırlamak için tekrar çalıştırabilirsiniz.

---

## 3. API — `apps/api`

```bash
cd apps/api
npm install
cp .env.example .env      # zaten varsa atlayın
npm run seed              # demo verisini yükler
npm start
```

Sunucu: **http://localhost:3108**

Test:

```bash
curl -X POST http://localhost:3108/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"operasyon\",\"password\":\"123456\"}"
```

Bir `token` dönüyorsa API çalışıyor demektir.

> `npm run seed` **mevcut tüm kayıtları siler** ve demo verisini baştan
> yükler (4 şube, 5 tacir, 8 kullanıcı, 22 gönderi).

---

## 4. Şube Masaüstü Uygulaması (Electron) — `apps/desktop`

```bash
cd apps/desktop
npm install
npm run dev
```

`npm run dev` iki şeyi birlikte başlatır: Vite geliştirme sunucusu (:5118) ve
Electron penceresi.

> **İlk kurulumda Electron ~300 MB'lık kendi tarayıcı motorunu indirir.**
> İnternet hızınıza göre birkaç dakika sürebilir; `npm install` sırasında
> "Downloading Electron binary" yazısını görürsünüz.

Sadece tarayıcıda denemek isterseniz (`npm run vite` sonrası
http://localhost:5118) arayüz aynıdır.

API başka bir adreste çalışıyorsa `src/api.js` içindeki adresi değiştirin:

```js
export const API_URL = 'http://localhost:3108/api'
```

### Barkod ve irsaliye basımı

- **Gönderi Kabul** ekranında kaydedilen her gönderi sağdaki listeye eklenir;
  **"N Etiketi Yazdır"** düğmesi tarayıcının yazdırma penceresini açar.
- **İrsaliyeler** ekranında bir irsaliyeyi açıp **Yazdır** diyebilirsiniz.
- Barkodlar **Code 39** biçiminde, hazır kütüphane olmadan SVG olarak
  çizilir (`src/barkod.js`). Barkod okuyucular bu formatı okuyabilir.

---

## 5. Tacir Portalı — `apps/web-merchant`

```bash
cd apps/web-merchant
npm install
npm run dev
```

Portal: **http://localhost:5108**

---

## 6. Kurye Uygulaması — `apps/mobile`

```bash
cd apps/mobile
npm install
npx expo start
```

Sonra:
- **Android emülatöründe açmak için:** terminalde `a` tuşuna basın
- **Gerçek telefonda:** Expo Go ile ekrandaki QR kodu okutun

### Sunucu adresi

`src/api.js` dosyasının en üstünde:

```js
export const TEMEL_ADRES = "http://10.0.2.2:3108/api";
```

| Nerede çalıştırıyorsunuz | Yazılacak adres |
|--------------------------|-----------------|
| Android emülatörü | `http://10.0.2.2:3108/api` (varsayılan) |
| Gerçek telefon (aynı Wi-Fi) | `http://BILGISAYAR_IP:3108/api` |

---

## 7. Demo Hesapları

Şifre hepsinde: **123456**

| Kullanıcı | Rol | Şube / Firma | Nerede kullanılır |
|-----------|-----|--------------|-------------------|
| `admin` | Yönetici | Kadıköy Şube | Masaüstü |
| `operasyon` | Operasyon | Kadıköy Şube | Masaüstü |
| `op2` | Operasyon | Beşiktaş Şube | Masaüstü |
| `kurye1` | Kurye | Kadıköy Şube (34 KRG 001) | Mobil |
| `kurye2` | Kurye | Beşiktaş Şube (34 KRG 002) | Mobil |
| `kurye3` | Kurye | Bakırköy Şube (34 KRG 003) | Mobil |
| `tacir1` | Tacir | Moda Butik Giyim | Tacir portalı |
| `tacir2` | Tacir | TeknoMarket Elektronik | Tacir portalı |

> Her uygulama kendi rolünü kontrol eder: kurye masaüstüne, tacir şube
> uygulamasına giremez; uygun bir Türkçe uyarı verilir.

---

## 8. Sunumda Gösterilecek Akış

1. **Masaüstü — Gönderi Kabul:** tacir seçip alıcı bilgilerini girin.
   Kaydedince barkod üretilir ve **alıcının ilçesine göre dağıtım şubesi
   otomatik belirlenir**. Sağda kargo etiketi (barkodlu) belirir.
   Birkaç gönderi kaydedip **"N Etiketi Yazdır"** deyin.
2. Hizmet verilmeyen bir ilçe yazın (örn. "Ankara Çankaya") — sistem uyarır.
3. **Şube Ayrıştırma:** bekleyen gönderiler dağıtım şubesine göre gruplanmış
   kartlarda görünür. Bir şubeyi seçin, gönderileri işaretleyin,
   **Kuryeye Dağıtım** irsaliyesi kesin.
4. **İrsaliyeler:** oluşan irsaliyeyi açın — barkodlu, imza alanlı sevk fişi.
   **Yazdır** deyin.
5. **Mobil (kurye1):** Rotam ekranında zimmetli gönderiler ve tahsil edilecek
   toplam görünür. Bir gönderiye girin.
6. Yanlış bir teslimat kodu girip deneyin — sistem reddeder.
   **"Kodu göster (demo)"** ile doğru kodu alın.
7. Teslim alan kişinin adını yazın, **parmakla imza atın**, kapıda ödeme
   varsa yöntemi seçip **Tahsil Et ve Teslim Et** deyin.
8. **Masaüstü — Gönderi Arama:** barkoda tıklayın; hareket geçmişi
   (kayıt → şube → dağıtım → teslim) ve tahsilat kaydı görünür.
9. **Tacir portalı (tacir1):** aynı gönderinin durumunu ve
   **Kapıda Ödeme** ekranında komisyon düşülmüş net bakiyeyi gösterin.

---

## 9. Çalıştırma Sırası (özet)

```bash
# 1. Veritabanı
psql -U courier_user -d courier_db -f db/schema.sql

# 2. API  (yeni terminal)
cd apps/api && npm install && npm run seed && npm start

# 3. Şube masaüstü  (yeni terminal)
cd apps/desktop && npm install && npm run dev

# 4. Tacir portalı  (yeni terminal)
cd apps/web-merchant && npm install && npm run dev

# 5. Kurye uygulaması  (yeni terminal)
cd apps/mobile && npm install && npx expo start
```

---

## 10. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `ECONNREFUSED ... 5432` | PostgreSQL çalışmıyor veya `.env` içindeki bağlantı yanlış |
| `relation "shipments" does not exist` | `db/schema.sql` çalıştırılmamış |
| Electron penceresi açılmıyor | İlk kurulumda binary indirmesi bitmemiş olabilir; `npm install` çıktısını bekleyin |
| Electron indirmesi çok uzun sürüyor | `npm run vite` ile arayüzü tarayıcıda açabilirsiniz (http://localhost:5118) |
| Mobilde `Sunucuya bağlanılamadı` | Emülatörde adres `10.0.2.2` olmalı, `localhost` değil |
| Expo `port 8081 kullanımda` | `npx expo start --port 8086` |
| `"X" ilçesine hizmet veren bir şube yok` | `branches.districts` alanına o ilçeyi ekleyin |
| Teslimat kodu hatalı diyor | Kod kuryeye zimmetlenirken üretilir; **Kodu göster (demo)** ile bakın |
| Demo verisi karıştı | `cd apps/api && npm run seed` |
