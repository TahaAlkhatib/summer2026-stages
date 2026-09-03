# Veritabanı — MySQL 8 (`gym_db`)

Bu proje **MySQL 8** kullanıyor. Şema elle yazılmış tek bir SQL dosyasında durur;
ORM yok, sorgular `mysql2` ile doğrudan yazılıyor.

| Dosya | İçerik |
|-------|--------|
| `db/schema.sql` | Tabloların tamamı (12 tablo) |
| `apps/api/scripts/seed.js` | Türkçe demo verisi |

## Kurulum

```bash
# 1) Şemayı yükle
mysql -h 127.0.0.1 -u gym_user -p gym_db < db/schema.sql

# 2) Demo verisini yükle
cd apps/api && npm run seed
```

> `schema.sql` en başta `DROP TABLE IF EXISTS ...` yapar; yeniden çalıştırmak
> veritabanını sıfırlar.

Tabloların karakter kümesi `CHARSET=utf8mb4` olarak tanımlıdır. Sıralama
(collation) sunucu ayarından gelir; `docker-compose.yml` MySQL'i
`--collation-server=utf8mb4_turkish_ci` ile başlatıyor. Yerel bir MySQL
kurulumunda aynı ayarı yapın, aksi hâlde "Şahin", "Öztürk" gibi Türkçe
aramalarda sıralama ve harf eşlemesi beklendiği gibi olmaz.

## Tablolar

| Tablo | Açıklama |
|-------|----------|
| `users` | Personel: admin (yönetici), kasiyer, antrenör |
| `members` | Üyeler — her üyenin QR kodu ve RFID kartı var |
| `packages` | Üyelik paketleri (süreli / seans bazlı) |
| `memberships` | Üyenin satın aldığı paket, başlangıç-bitiş, kalan seans |
| `payments` | Üyelik tahsilatları (nakit / kart / havale) |
| `gates` | Turnikeler (seri port ayarı, simülasyon bayrağı) |
| `checkins` | Turnike giriş kayıtları — kabul/ret sebebiyle birlikte |
| `classes` | Grup dersleri (kontenjan, antrenör, saat) |
| `class_bookings` | Ders rezervasyonları |
| `products` | Büfe/market ürünleri ve stok |
| `sales` | Büfe satış fişleri |
| `sale_items` | Satış kalemleri |

## İlişkiler

Yabancı anahtarlar `FOREIGN KEY` ile tanımlı. Bir kaydın alt kayıtlarıyla
birlikte silinmesi gereken yerlerde `ON DELETE CASCADE` yazılmıştır
(`payments` → `memberships`, `class_bookings` → `classes`/`members`).
Diğerlerinde MySQL'in varsayılanı geçerlidir: girişi veya üyeliği olan bir üye
silinemez.

API'de üye silme ucu **yok**; üyelik dondurmak için `members.is_active`
alanı `0` yapılır (turnikede "Üyelik dondurulmuş." sebebiyle reddedilir).

## Turnike mantığı nerede?

Giriş kararı veritabanında değil `apps/api/routes/checkins.js` içinde verilir.
Kontroller sırayla:

1. Kart/QR tanınıyor mu?
2. Üye dondurulmuş mu? (`members.is_active`)
3. Üyelik kaydı var mı? (iptal edilmemiş en güncel üyelik alınır)
4. Üyelik süresi dolmuş mu? (dolmuşsa `memberships.status` da `bitti` yapılır)
5. Üyelik henüz başlamamış mı?
6. Seans hakkı bitmiş mi? (süresiz paketlerde `remaining_sessions` NULL'dur)

Giriş kabul edilirse: aynı gün **ilk** giriş ise seans bir düşülür, aynı gün
ikinci giriş seans düşürmez.

Her deneme — kabul de ret de — `checkins` tablosuna sebebiyle birlikte yazılır;
turnike raporu bu tablodan üretilir.
