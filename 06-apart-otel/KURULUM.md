# Apart & Otel Rezervasyon Yönetimi — Kurulum ve Çalıştırma Rehberi

Bu dosya projeyi **sıfırdan bir bilgisayarda** çalıştırmak için gereken tüm
adımları içerir.

---

## 1. Gerekli Programlar

| Program | Sürüm | Nereden indirilir | Hangi uygulama için |
|---------|-------|-------------------|---------------------|
| **Node.js** | 20+ | https://nodejs.org | API, Web paneli, Mobil |
| **Docker Desktop** | güncel | https://www.docker.com/products/docker-desktop/ | MongoDB |
| **Android Studio** | güncel | https://developer.android.com/studio | Android emülatörü |
| **Expo Go** (isteğe bağlı) | güncel | Play Store | Gerçek telefonda deneme |

Kontrol:

```bash
node --version      # v20 veya üzeri
docker --version
```

> **MongoDB neden Docker'da?** Bilgisayara ayrıca MongoDB kurmaya gerek
> kalmasın diye. Zaten kurulu bir MongoDB'niz varsa Docker'ı atlayıp
> `apps/api/.env` içindeki `MONGO_URL` değerini kendi sunucunuza
> çevirebilirsiniz.

---

## 2. Veritabanını Başlatma (MongoDB)

Proje kök klasöründe (`06-apart-otel`):

```bash
docker compose up -d
```

Kontrol:

```bash
docker ps       # apartotel-mongo konteyneri "Up" görünmeli
```

Bağlantı bilgileri:

| Alan | Değer |
|------|-------|
| Adres | `mongodb://localhost:27018/pms_rentals` |
| Port | **27018** (varsayılan 27017 değil) |
| Veritabanı | `pms_rentals` |

> Port neden 27018? Bilgisayarınızda başka bir MongoDB çalışıyorsa 27017
> portu dolu olur. Çakışmayı önlemek için 27018 seçildi.

Koleksiyonları elle oluşturmanıza gerek yok; MongoDB ilk kayıtta otomatik
oluşturur. Alan tanımları `apps/api/models/` klasöründedir.

---

## 3. API (Sunucu) — `apps/api`

```bash
cd apps/api
npm install
cp .env.example .env       # zaten varsa atlayın
npm run seed               # demo verilerini yükler
npm start
```

Sunucu: **http://localhost:3106**

Test:

```bash
curl -X POST http://localhost:3106/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"resepsiyon","password":"123456"}'
```

Bir `token` dönüyorsa API çalışıyor demektir.

> `npm run seed` **mevcut tüm kayıtları siler** ve demo verisini baştan
> yükler. Demo bozulursa tekrar çalıştırmanız yeterli.

---

## 4. Yönetim Paneli — `apps/web`

```bash
cd apps/web
npm install
cp .env.local.example .env.local    # zaten varsa atlayın
npm run dev
```

Panel: **http://localhost:3116**

API başka bir adreste çalışıyorsa `.env.local` içindeki değeri değiştirin:

```
NEXT_PUBLIC_API_URL=http://localhost:3106/api
```

---

## 5. Görev Uygulaması — `apps/mobile`

```bash
cd apps/mobile
npm install
npx expo start
```

Sonra:
- **Android emülatöründe açmak için:** terminalde `a` tuşuna basın
- **Gerçek telefonda:** Expo Go uygulamasıyla ekrandaki QR kodu okutun

### Sunucu adresi

`src/api.js` dosyasının en üstünde:

```js
export const TEMEL_ADRES = "http://10.0.2.2:3106/api";
```

| Nerede çalıştırıyorsunuz | Yazılacak adres |
|--------------------------|-----------------|
| Android emülatörü | `http://10.0.2.2:3106/api` (varsayılan) |
| Gerçek telefon (aynı Wi-Fi) | `http://BILGISAYAR_IP:3106/api` |

Bilgisayarınızın IP adresi: macOS/Linux `ifconfig`, Windows `ipconfig`.

---

## 6. Demo Hesapları

Şifre hepsinde: **123456**

| Kullanıcı | Rol | Nerede kullanılır |
|-----------|-----|-------------------|
| `admin` | Yönetici | Web paneli |
| `resepsiyon` | Ön büro | Web paneli |
| `temizlik1` | Temizlik ekibi | Mobil uygulama |
| `temizlik2` | Temizlik ekibi | Mobil uygulama |
| `teknik1` | Teknik ekip | Mobil uygulama |

> Temizlik/teknik personeli web panelinde sadece **Görevler** ekranını görür.
> Ön büro ve yönetici mobil uygulamaya giremez.

---

## 7. Sunumda Gösterilecek Akış

Projenin en güzel tarafı çıkış → otomatik görev → oda tekrar satışta
zinciridir. Şu sırayla gösterin:

1. **Web panelinde** `resepsiyon` ile giriş yapın, **Oda Takvimi**'ni açın.
2. Bir rezervasyon çubuğunu **başka bir odaya sürükleyin** — taşındığını görün.
3. Dolu bir odaya sürüklemeyi deneyin — sistem çakışmayı reddeder.
4. **İçeride** olan bir rezervasyona tıklayın (yeşil çubuk).
5. **Çıkış Yap** deyin. Bakiye varsa uyarı çıkar; önce **Tahsilat Al** deyip
   kalanı yazın, sonra tekrar çıkış yapın.
6. **Görevler** ekranına gidin — o oda için "çıkış sonrası otomatik" etiketli
   yeni bir temizlik görevi açılmış olacak.
7. **Odalar** ekranında o odanın "Temizlik bekliyor" durumuna düştüğünü gösterin.
8. **Mobil uygulamada** `temizlik1` ile giriş yapın, görevi açın,
   **İşe Başla** → **Görevi Tamamla** deyin.
9. Uygulama "… nolu oda satışa açıldı" der. Web panelinde **Odalar** ekranını
   yenileyin — oda tekrar **Müsait**.

---

## 8. Çalıştırma Sırası (özet)

```bash
# 1. Veritabanı
docker compose up -d

# 2. API  (yeni terminal)
cd apps/api && npm install && npm run seed && npm start

# 3. Web paneli  (yeni terminal)
cd apps/web && npm install && npm run dev

# 4. Mobil  (yeni terminal)
cd apps/mobile && npm install && npx expo start
```

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `MongoDB bağlantısı kurulamadı` | `docker ps` ile konteyneri kontrol edin; port 27018 olmalı |
| Panelde `Sunucuya bağlanılamadı` | API çalışıyor mu? `.env.local` içindeki adres doğru mu? |
| Mobilde `Sunucuya bağlanılamadı` | Emülatörde adres `10.0.2.2` olmalı, `localhost` değil |
| Takvimde rezervasyon görünmüyor | Tarih aralığı dışında olabilir; **Bugün** düğmesine basın |
| Demo verisi karıştı | `cd apps/api && npm run seed` |
| Expo `port 8081 kullanımda` | `npx expo start --port 8085` |
| Veritabanını tamamen sıfırlamak | `docker compose down -v && docker compose up -d`, sonra `npm run seed` |
