# Veritabanı — MongoDB (`laundry_erp`)

Bu proje **MongoDB** kullanıyor. İlişkisel veritabanlarındaki gibi bir
`schema.sql` dosyası yok; koleksiyonlar (tablo karşılığı) ilk kayıt
eklendiğinde otomatik oluşur. Alanların tanımı `apps/api/models/`
klasöründeki **Mongoose şemalarında** duruyor.

## Koleksiyonlar

| Koleksiyon | Model dosyası | İçerik |
|------------|---------------|--------|
| `users` | `models/User.js` | Personel: admin, kasiyer, kurye |
| `customers` | `models/Customer.js` | Müşteriler |
| `services` | `models/Service.js` | Hizmet listesi ve fiyatlar |
| `orders` | `models/Order.js` | Siparişler, durum, tutarlar |
| `orderitems` | `models/OrderItem.js` | Sipariş kalemleri — her kalemin barkodu var |
| `orderstatushistories` | `models/OrderStatusHistory.js` | Sipariş aşama geçmişi |
| `couriertasks` | `models/CourierTask.js` | Kurye alma / teslim görevleri |
| `payments` | `models/Payment.js` | Tahsilatlar |

> Mongoose koleksiyon adlarını model adının küçük harfli çoğulu olarak
> üretir: `OrderItem` → `orderitems`.

## İlişkiler

MongoDB'de yabancı anahtar (foreign key) yoktur. Mongoose'da bağ
`ObjectId` + `ref` ile kurulur, ilgili belge `.populate()` ile çekilir:

```js
const siparis = await Order.findById(id).populate("created_by");
const kalemler = await OrderItem.find({ order_id: siparis._id });
```

## Kimlik alanı (`_id` → `id`)

MongoDB her kaydı `_id` alanında 24 karakterlik bir **ObjectId** ile tutar.
Arayüzler ve masaüstü uygulaması `id` alanını beklediği için şemalarda
`toJSON` dönüşümü tanımlı (`models/ortak.js`):

```js
transform: function (belge, nesne) {
  nesne.id = nesne._id.toString();
  delete nesne._id;
  return nesne;
}
```

Bu yüzden API cevapları eskisi gibi `id` alanı döndürür — tek fark
değerin sayı değil metin olması.

## Demo verisi

```bash
cd apps/api
npm run seed
```

Betik **önce mevcut tüm kayıtları siler**, sonra 3 kullanıcı, 8 hizmet,
10 müşteri ve 8 sipariş (her durumdan örnek) ekler.

## Tarih saklama notu

Gün sonu raporunda saat değil **gün** önemlidir. `apps/api/tarih.js`
içindeki `gunBasi()` / `gunSonu()` yardımcıları gün sınırlarını yerel
saate göre hesaplar. `toISOString()` kullanılmadı; çünkü UTC'ye çevirir
ve Türkiye UTC+3 olduğu için gece 00:00–03:00 arasında bir önceki günün
raporunu getirirdi.

## Neden transaction yok?

MongoDB'de çoklu belge transaction'ı yalnızca **replica set** kurulumunda
çalışır; tek sunucu (standalone) kurulumunda hata verir. Öğrencinin
bilgisayarındaki varsayılan kurulum tek sunucu olduğu için sipariş
oluşturma akışında transaction kullanılmadı: kalemler **önce doğrulanır**,
sonra kaydedilir; beklenmeyen bir hata olursa yarım kalan kayıtlar
`deleteMany` ile temizlenir (`routes/orders.js`).
