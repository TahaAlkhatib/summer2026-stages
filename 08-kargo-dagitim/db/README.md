# Veritabanı — MongoDB (`courier_db`)

Bu proje **MongoDB** kullanıyor. İlişkisel veritabanlarındaki gibi bir
`schema.sql` dosyası yok; koleksiyonlar ilk kayıt eklendiğinde otomatik
oluşur. Alan tanımları `apps/api/models/` klasöründeki **Mongoose
şemalarında** duruyor.

## Koleksiyonlar

| Koleksiyon | Model dosyası | İçerik |
|------------|---------------|--------|
| `branches` | `models/Branch.js` | Şubeler ve hizmet verdikleri ilçeler |
| `merchants` | `models/Merchant.js` | Tacirler, anlaşmalı fiyat, komisyon oranı |
| `users` | `models/User.js` | Personel (admin, operasyon, kurye) ve tacir kullanıcıları |
| `shipments` | `models/Shipment.js` | Gönderiler: barkod, alıcı, ücret, kapıda ödeme, durum, OTP, imza |
| `shipmentevents` | `models/ShipmentEvent.js` | Hareket geçmişi |
| `manifests` | `models/Manifest.js` | Sevk ve dağıtım irsaliyeleri |
| `codcollections` | `models/CodCollection.js` | Kapıda ödeme tahsilatları |

## İlişkisel tasarımdan farklar

**1. `manifest_items` ara tablosu kaldırıldı.** İlişkisel tasarımda bir
irsaliyenin gönderilerini tutmak için ara tablo gerekiyordu. MongoDB'de
gönderi kimlikleri doğrudan irsaliyenin içinde bir dizide tutulabiliyor:

```js
items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }]
```

**2. Yabancı anahtar yok.** Bağ `ObjectId` + `ref` ile kurulur, ilgili
belge `.populate()` ile çekilir:

```js
const gonderi = await Shipment.findOne({ barcode: kod })
  .populate('merchant_id')
  .populate('dest_branch_id')
  .populate('courier_id');
```

**3. Büyük/küçük harf duyarsız arama düzenli ifadeyle yapılır.**

```js
const desen = new RegExp(req.query.q, 'i');
filtre.$or = [{ barcode: desen }, { receiver_name: desen }];
```

**4. Durum sayımları tek tek yapılır.** Raporlarda her durum için ayrı bir
`countDocuments` çağrısı var. Kurye raporunda tahsilat da **ayrı** sorgulanıyor:
gönderilerle tahsilatları tek sorguda birleştirmek her gönderiyi tahsilat sayısı
kadar tekrarlar ve rakamları şişirir.

## Kimlik alanı (`_id` → `id`)

MongoDB her kaydı `_id` alanında 24 karakterlik bir **ObjectId** ile tutar.
Arayüzler `id` alanını beklediği için şemalarda `toJSON` dönüşümü tanımlı
(`models/ortak.js`). Bu yüzden API cevapları eskisi gibi `id` döndürür —
tek fark değerin sayı değil metin olması.

## Demo verisi

```bash
cd apps/api
npm run seed
```

Betik **önce mevcut tüm kayıtları siler**, sonra 4 şube, 5 tacir,
8 kullanıcı ve 22 gönderi ekler (6 teslim edilmiş, 5 dağıtımda,
5 şubede, 1 teslim edilemedi, kalanı yeni kayıt).

## Neden transaction yok?

MongoDB'de çoklu belge transaction'ı yalnızca **replica set** kurulumunda
çalışır; tek sunucu (standalone) kurulumunda hata verir. Öğrencinin
bilgisayarındaki varsayılan kurulum tek sunucu olduğu için irsaliye
oluşturma akışında transaction kullanılmadı: önce tüm kontroller yapılır,
sonra kayıtlar sırayla güncellenir; beklenmeyen bir hata olursa açılan
irsaliye silinir (`routes/manifests.js`).

## Tarih saklama notu

`yardimcilar.js` içindeki `gunBasi()` / `gunSonu()` gün sınırlarını yerel
saate göre hesaplar. `toISOString()` kullanılmadı; çünkü UTC'ye çevirir ve
Türkiye UTC+3 olduğu için gece 00:00–03:00 arasında raporlar bir gün
kayardı.
