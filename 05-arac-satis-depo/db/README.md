# Veritabanı

Şema **EF Core** tarafından yönetilir; elle çalıştırılacak `schema.sql` yoktur.

- Varlık sınıfları: `apps/api/Models/Entities.cs`
- Bağlam: `apps/api/Data/VanSalesContext.cs`
- Demo verisi: `apps/api/Data/SeedData.cs`

API ilk açılışta `EnsureCreated()` ile `vansales_db` veritabanını oluşturur ve
Türkçe demo verisini yükler. SQL Server, `docker-compose.yml` ile **1434** portunda
çalışır (Proje 2 ile aynı anda çalışabilsin diye).

## Tablolar

| Tablo | Açıklama |
|-------|----------|
| `Users` | Personel: admin, depo, mandub (satış temsilcisi) |
| `Vans` | Satış araçları, sürücü ataması |
| `Products` | Merkez depo ürünleri ve stoğu |
| `VanStocks` | Araç üstü envanter (araç + ürün benzersiz) |
| `LoadOrders` / `LoadOrderItems` | Depodan araca yükleme fişleri |
| `Customers` | Müşteriler, vade limiti, konum |
| `Invoices` / `InvoiceItems` | Sahada kesilen faturalar |
| `Collections` | Vadeli fatura tahsilatları |
| `VanLocations` | Araç GPS konum kayıtları |

## Çevrimdışı senkronizasyon anahtarı

`Invoices.OfflineId` ve `Collections.OfflineId` alanları **benzersiz** indekslidir.
Mobil uygulama her kaydı cihazda ürettiği bu kimlikle gönderir; aynı kayıt tekrar
gönderilirse sunucu ikinci kez işlemez ve `zaten_var` döner. Böylece internet
kesintilerinde tekrar denemeler mükerrer fatura oluşturmaz.
