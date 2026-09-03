# Veritabanı — MongoDB (`realestate_crm`)

Bu proje **MongoDB** kullanıyor. Laravel'in Eloquent'i
[`mongodb/laravel-mongodb`](https://github.com/mongodb/laravel-mongodb) paketi
sayesinde MongoDB üzerinde çalışıyor: modeller `MongoDB\Laravel\Eloquent\Model`
sınıfından türüyor, ilişkiler ve sorgular alıştığımız Eloquent yazımıyla aynı.

Bağlantı `config/database.php` içindeki `mongodb` sürücüsüyle kurulur:

```php
'mongodb' => [
    'driver' => 'mongodb',
    'dsn' => env('MONGO_URL', 'mongodb://localhost:27017'),
    'database' => env('MONGO_DATABASE', 'realestate_crm'),
],
```

## Koleksiyonlar

| Koleksiyon | Model | İçerik |
|------------|-------|--------|
| `users` | `User` | Personel: admin, danışman |
| `owners` | `Owner` | Mal sahipleri (IBAN dahil) |
| `properties` | `Property` | Portföy/ilan kayıtları |
| `customers` | `Customer` | Alıcı / kiracı adayları |
| `demands` | `Demand` | Müşteri talepleri (eşleştirme kriterleri) |
| `appointments` | `Appointment` | Görüntüleme randevuları |
| `contracts` | `Contract` | Satış ve kira sözleşmeleri |
| `installments` | `Installment` | Kira taksit takvimi ve tahsilatlar |
| `documents` | `Document` | Evrak arşivi (dosya diskte, kayıt veritabanında) |
| `personal_access_tokens` | `PersonalAccessToken` | Sanctum oturum token'ları |
| `migrations` | — | Laravel'in göç kaydı |

Alanların listesi modellerin `$fillable` dizisindedir.

## Göçler (migration) ne yapıyor?

MongoDB'de tablo ve kolon tanımı yoktur; koleksiyonlar ilk kayıtla birlikte
kendiliğinden oluşur. Bu yüzden tek bir göç dosyası var
(`database/migrations/2026_09_02_100001_create_collections.php`) ve o da sadece
**indeks** kuruyor:

```php
Schema::create('properties', function (Blueprint $koleksiyon) {
    $koleksiyon->unique('code');                    // PRT-2026-00001 tekrar etmesin
    $koleksiyon->index(['listing_type', 'status']);
    $koleksiyon->index('district');
});
```

## İlişkiler

Yabancı anahtar (foreign key) yoktur; bağ alanları (`owner_id`, `agent_id`,
`contract_id` ...) ilgili belgenin kimliğini **metin** olarak tutar. Eloquent
ilişkileri yine aynı şekilde çalışır:

```php
$portfoy = Property::with(['owner', 'agent'])->find($id);
$taksitler = $sozlesme->installments;   // hasMany
```

MongoDB veri bütünlüğünü kendisi denetlemediği için "bu kayıt gerçekten var mı"
kontrolünü Laravel'in doğrulama kuralı yapıyor:

```php
'owner_id' => 'required|exists:owners,id',
```

## Dikkat edilecek 4 fark

Bunlar ilişkisel veritabanından gelirken en çok tökezleten noktalar:

**1. Kolon varsayılanı (DEFAULT) yok.** SQL'de `status` kolonuna
`default('aktif')` yazabiliyorduk. MongoDB'de böyle bir şey yok; varsayılanları
modelin `$attributes` dizisi veriyor:

```php
protected $attributes = [
    'status' => 'aktif',
    'city' => 'İstanbul',
    'dues' => 0,
];
```

**2. Metin ile sayı karşılaştırılmaz.** MongoDB `"7500000"` metnini `7500000`
sayısıyla eşit saymaz. Formdan metin gelebileceği için tutarlar kaydedilmeden
önce çevriliyor (`PropertyController::sayilariCevir`), ve fiyat filtrelerinde
`(float)` kullanılıyor:

```php
$sorgu->where('price', '<=', (float) $istek->max_price);
```

Aynı sebeple para alanlarının dönüştürücüsü `decimal:2` değil `float`;
`decimal:2` değeri metne çevirdiği için toplama ve sıralama bozulurdu.

**3. Tarihler iki farklı biçimde tutuluyor.**

| Alan | Saklama | Neden |
|------|---------|-------|
| `scheduled_at` (randevu) | gerçek MongoDB tarihi | Saat de önemli; `whereDate()` ile gün filtresi yapılıyor |
| `start_date`, `end_date`, `due_date`, `paid_at` | `"2026-09-05"` metni | Saat yok. Bu biçimdeki metinler alfabetik sıralandığında tarih sırasıyla aynı olduğu için `where('due_date', '<', $bugun)` doğru çalışır ve saat dilimi kayması yaşanmaz |

> Randevu kaydedilirken `Carbon::parse()` ile gerçek tarihe çevriliyor. Metin
> olarak kaydedilirse tarih filtreleri sessizce boş sonuç döner.

**4. Boş alan JSON'da görünmez.** SQL'de `NULL` bir kolon cevapta `null` olarak
çıkardı; MongoDB'de hiç yazılmamış alan belgeye de girmez, JSON'a da girmez.
Cevap yapısı bozulmasın diye satış sözleşmesinde olmayan alanlara `$attributes`
içinde boş değer tanımlandı (`end_date`, `payment_day`, `duration_months`).

## SQL'de kolay olan, burada elle yazılan işler

| İlişkisel veritabanında | Bu projedeki çözüm |
|-------------------------|--------------------|
| Harf duyarsız `LIKE` araması | Eloquent'in `like` operatörü; paket bunu harf duyarsız bir düzenli ifadeye çeviriyor |
| `CAST(split_part(room_count,'+',1) AS INTEGER) >= 3` | Kayıtlar çekildikten sonra PHP'de süzülüyor (`Demand::eslesenPortfoyler`) |
| `SUM(amount - paid_amount)` | Kayıtlar çekilip PHP'de döngüyle toplanıyor (`ReportController::summary`) |
| `GROUP BY district` | `ReportController::grupla()` — PHP'de sayma |
| `SELECT DISTINCT district` | `pluck('district')->unique()` |
| `DB::transaction(...)` | Kullanılmadı (aşağıya bakın) |

## Neden transaction yok?

MongoDB'de çoklu belge transaction'ı yalnızca **replica set** kurulumunda
çalışır; tek sunucu (standalone) kurulumunda hata verir. Öğrencinin
bilgisayarındaki varsayılan kurulum tek sunucu olduğu için sözleşme oluşturma
ve fesih akışlarında transaction kullanılmadı: doğrulamaların tamamı yazma
işlemlerinden **önce** yapılıyor, sonra kayıtlar sırayla yazılıyor
(`ContractController`).

## Türkçe arama sınırı

MongoDB'nin harf duyarsız araması `İ` ↔ `i` ve `I` ↔ `ı` eşlemesini yapmaz.
`Beşiktaş` ve `beşiktaş` bulunur, `BEŞİKTAŞ` bulunmaz. Arama kutusuna
büyük harfle yazan kullanıcı sonuç göremez; gerçek bir projede aranan alanın
küçük harfli bir kopyası ayrı bir alanda tutulur.

## Demo verisi

```bash
cd apps/api
php artisan migrate      # indeksler
php artisan db:seed      # demo veri
```

Seeder **önce bütün koleksiyonları boşaltır** (`Model::truncate()`), sonra
4 personel, 8 mal sahibi, 24 portföy, 12 müşteri, 8 talep, 15 randevu ve
6 sözleşme (taksit takvimleriyle) ekler.

Sıfırdan başlamak için:

```bash
php artisan migrate:fresh --seed
```
