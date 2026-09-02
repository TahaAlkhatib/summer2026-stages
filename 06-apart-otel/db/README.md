# Veritabanı — MongoDB (`pms_rentals`)

Bu proje **MongoDB** kullanıyor. İlişkisel veritabanlarındaki gibi `schema.sql`
dosyası yok; koleksiyonlar (tablo karşılığı) ilk kayıt eklendiğinde otomatik
oluşur. Alanların tanımı `apps/api/models/` klasöründeki **Mongoose şemalarında**
duruyor.

## Koleksiyonlar

| Koleksiyon | Model dosyası | İçerik |
|------------|---------------|--------|
| `users` | `models/User.js` | Personel: admin, resepsiyon, temizlik, teknik |
| `properties` | `models/Property.js` | Tesisler (apart binası / otel) |
| `rooms` | `models/Room.js` | Oda ve daireler, gecelik fiyat, oda durumu |
| `guests` | `models/Guest.js` | Misafir kartları |
| `reservations` | `models/Reservation.js` | Rezervasyonlar, giriş/çıkış tarihleri, durum |
| `charges` | `models/Charge.js` | Konaklama bedeli ve ekstra masraflar |
| `payments` | `models/Payment.js` | Tahsilatlar |
| `tasks` | `models/Task.js` | Temizlik / bakım görevleri |

## İlişkiler

MongoDB'de yabancı anahtar yoktur; Mongoose'da `ObjectId` + `ref` ile bağ kurulur
ve `.populate()` çağrısıyla ilgili belge çekilir. Örnek:

```js
const rezervasyon = await Reservation.findById(id)
  .populate('guest')
  .populate({ path: 'room', populate: { path: 'property' } });
```

## Demo verisi

```bash
cd apps/api
npm run seed
```

Betik **önce mevcut tüm kayıtları siler**, sonra 5 kullanıcı, 2 tesis, 20 oda,
12 misafir, 15 rezervasyon ve 4 görev ekler. Rezervasyon tarihleri "bugüne göre"
hesaplandığı için demo hangi gün çalıştırılırsa çalıştırılsın güncel görünür.

## Tarih saklama notu

Rezervasyonlarda saat değil **gün** önemlidir. `tarih.js` içindeki `gunBasi()`
fonksiyonu tarihleri yerel saatle 00:00'a çeker. `toISOString()` kullanılmadı;
çünkü UTC'ye çevirir ve Türkiye UTC+3 olduğu için gece 00:00–03:00 arasında
bir önceki günü verirdi.
