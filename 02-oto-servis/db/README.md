# Veritabanı

Bu projede şema **EF Core** tarafından yönetilir; elle çalıştırılacak bir `schema.sql`
dosyası yoktur.

- Varlık sınıfları: `apps/api/Models/Entities.cs`
- Bağlam (DbContext): `apps/api/Data/OtoServisContext.cs`
- Demo verisi: `apps/api/Data/SeedData.cs`

API ilk açılışta `db.Database.EnsureCreated()` çağırarak `garage_db` veritabanını
ve tabloları oluşturur, ardından veritabanı boşsa Türkçe demo verisini yükler.

SQL Server, `docker-compose.yml` ile ayağa kaldırılır (macOS'ta yerel SQL Server
kurulumu bulunmadığı için).

## Tablolar

| Tablo | Açıklama |
|-------|----------|
| `Users` | Personel: admin, danisman (servis danışmanı), teknisyen |
| `Customers` | Müşteriler |
| `Vehicles` | Araçlar (plaka benzersiz) |
| `JobCards` | İş emirleri (Job Card) |
| `InspectionItems` | Tablet üzerinden girilen arıza tespitleri + fotoğraf yolu |
| `Parts` | Yedek parça stoğu |
| `JobParts` | İş emrine depodan çekilen parçalar |
| `LaborItems` | İşçilik kalemleri |
| `Invoices` | Faturalar (KDV dahil) |
