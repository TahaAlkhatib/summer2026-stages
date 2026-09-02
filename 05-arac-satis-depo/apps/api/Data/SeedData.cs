using VanSalesApi.Models;

namespace VanSalesApi.Data
{
    // Türkçe demo verisi. Veritabanı boşsa uygulama açılışında yüklenir.
    public static class SeedData
    {
        public static void Yukle(VanSalesContext db)
        {
            if (db.Users.Any())
            {
                return;
            }

            string sifre = BCrypt.Net.BCrypt.HashPassword("123456");

            var personel = new List<User>
            {
                new User { FullName = "Ahmet Yılmaz",  Username = "admin",    PasswordHash = sifre, Role = "admin",  Phone = "+90 532 111 22 33" },
                new User { FullName = "Zeynep Kaya",   Username = "depo1",    PasswordHash = sifre, Role = "depo",   Phone = "+90 533 222 33 44" },
                new User { FullName = "Mustafa Demir", Username = "saha1",  PasswordHash = sifre, Role = "saha", Phone = "+90 534 333 44 55" },
                new User { FullName = "Hakan Öztürk",  Username = "saha2",  PasswordHash = sifre, Role = "saha", Phone = "+90 535 444 55 66" },
            };
            db.Users.AddRange(personel);
            db.SaveChanges();

            var araclar = new List<Van>
            {
                new Van { Plate = "34 VS 001", Brand = "Ford",       Model = "Transit",  DriverId = personel[2].Id },
                new Van { Plate = "34 VS 002", Brand = "Mercedes",   Model = "Sprinter", DriverId = personel[3].Id },
                new Van { Plate = "34 VS 003", Brand = "Volkswagen", Model = "Crafter" },
            };
            db.Vans.AddRange(araclar);
            db.SaveChanges();

            var urunler = new List<Product>
            {
                new Product { Code = "GD-001", Name = "Ayçiçek Yağı 5 L",       Unit = "adet", Price = 385.00M, VatRate = 20, WarehouseStock = 480, MinStock = 60 },
                new Product { Code = "GD-002", Name = "Un 25 kg",               Unit = "çuval", Price = 620.00M, VatRate = 20, WarehouseStock = 220, MinStock = 40 },
                new Product { Code = "GD-003", Name = "Toz Şeker 25 kg",        Unit = "çuval", Price = 810.00M, VatRate = 20, WarehouseStock = 180, MinStock = 40 },
                new Product { Code = "GD-004", Name = "Pirinç 5 kg",            Unit = "adet", Price = 295.00M, VatRate = 20, WarehouseStock = 340, MinStock = 50 },
                new Product { Code = "GD-005", Name = "Makarna 500 g (Koli)",   Unit = "koli", Price = 240.00M, VatRate = 20, WarehouseStock = 26,  MinStock = 30 },
                new Product { Code = "IC-001", Name = "Su 0.5 L (Koli)",        Unit = "koli", Price = 165.00M, VatRate = 20, WarehouseStock = 520, MinStock = 80 },
                new Product { Code = "IC-002", Name = "Gazlı İçecek (Koli)",    Unit = "koli", Price = 420.00M, VatRate = 20, WarehouseStock = 190, MinStock = 40 },
                new Product { Code = "TM-001", Name = "Deterjan 5 kg",          Unit = "adet", Price = 340.00M, VatRate = 20, WarehouseStock = 150, MinStock = 30 },
                new Product { Code = "TM-002", Name = "Bulaşık Deterjanı 4 L",  Unit = "adet", Price = 210.00M, VatRate = 20, WarehouseStock = 18,  MinStock = 25 },
                new Product { Code = "TM-003", Name = "Kağıt Havlu (Koli)",     Unit = "koli", Price = 385.00M, VatRate = 20, WarehouseStock = 95,  MinStock = 20 },
            };
            db.Products.AddRange(urunler);
            db.SaveChanges();

            var musteriler = new List<Customer>
            {
                new Customer { Name = "Şahin Market",        ContactName = "Elif Şahin",   Phone = "+90 535 401 11 21", Address = "Bağdat Cad. No:112",   District = "Kadıköy",  TaxNumber = "1234567801", CreditLimit = 50000, Latitude = 40.9812, Longitude = 29.0576 },
                new Customer { Name = "Aydın Bakkaliyesi",   ContactName = "Burak Aydın",  Phone = "+90 536 402 12 22", Address = "Barbaros Bulvarı No:38", District = "Beşiktaş", TaxNumber = "1234567802", CreditLimit = 30000, Latitude = 41.0438, Longitude = 29.0075 },
                new Customer { Name = "Doğan Gıda",          ContactName = "Merve Doğan",  Phone = "+90 537 403 13 23", Address = "Çamlıca Mah. 12. Sok",  District = "Üsküdar",  TaxNumber = "1234567803", CreditLimit = 75000, Latitude = 41.0270, Longitude = 29.0663 },
                new Customer { Name = "Çelik Şarküteri",     ContactName = "Emre Çelik",   Phone = "+90 538 404 14 24", Address = "Halaskargazi Cad. No:200", District = "Şişli", TaxNumber = "1234567804", CreditLimit = 25000, Latitude = 41.0555, Longitude = 28.9875 },
                new Customer { Name = "Koç Toptan Gıda",     ContactName = "Ayşe Koç",     Phone = "+90 539 405 15 25", Address = "İncirli Cad. No:45",    District = "Bakırköy", TaxNumber = "1234567805", CreditLimit = 120000, Latitude = 40.9780, Longitude = 28.8720 },
                new Customer { Name = "Arslan Market",       ContactName = "Kerem Arslan", Phone = "+90 505 406 16 26", Address = "Nispetiye Cad. No:18",  District = "Beşiktaş", TaxNumber = "1234567806", CreditLimit = 40000, Latitude = 41.0790, Longitude = 29.0230 },
                new Customer { Name = "Polat Büfe",          ContactName = "Onur Polat",   Phone = "+90 507 408 18 28", Address = "Atatürk Bulvarı No:15", District = "Ataşehir", TaxNumber = "1234567807", CreditLimit = 15000, Latitude = 40.9923, Longitude = 29.1244 },
                new Customer { Name = "Yıldız Süpermarket",  ContactName = "Selin Yıldız", Phone = "+90 506 407 17 27", Address = "Moda Cad. No:88",       District = "Kadıköy",  TaxNumber = "1234567808", CreditLimit = 60000, Latitude = 40.9870, Longitude = 29.0260 },
            };
            db.Customers.AddRange(musteriler);
            db.SaveChanges();

            // Araçlara yükleme yap
            var yuklemeler = new (int aracIndex, int[] urunIndexleri, int[] miktarlar)[]
            {
                (0, new[] { 0, 1, 3, 5, 7 }, new[] { 40, 20, 30, 50, 15 }),
                (1, new[] { 0, 2, 4, 6, 9 }, new[] { 35, 25, 10, 20, 12 }),
            };

            int yuklemeSayaci = 1;
            foreach (var (aracIndex, urunIndexleri, miktarlar) in yuklemeler)
            {
                var yukleme = new LoadOrder
                {
                    LoadNo = "YK-2026-" + (yuklemeSayaci++).ToString("D5"),
                    VanId = araclar[aracIndex].Id,
                    LoadDate = DateTime.Now.AddDays(-1),
                    CreatedById = personel[1].Id,
                    Notes = "Sabah yüklemesi",
                    Items = new List<LoadOrderItem>()
                };

                for (int i = 0; i < urunIndexleri.Length; i++)
                {
                    var urun = urunler[urunIndexleri[i]];
                    int miktar = miktarlar[i];

                    yukleme.Items.Add(new LoadOrderItem { ProductId = urun.Id, Quantity = miktar });
                    urun.WarehouseStock -= miktar;

                    db.VanStocks.Add(new VanStock
                    {
                        VanId = araclar[aracIndex].Id,
                        ProductId = urun.Id,
                        Quantity = miktar
                    });
                }

                db.LoadOrders.Add(yukleme);
            }
            db.SaveChanges();

            // Sahadan senkronize edilmiş örnek faturalar
            var faturaTanimlari = new (int aracIndex, int musteriIndex, string odemeTipi, int[] urunIdx, int[] adetler, int saatOnce)[]
            {
                (0, 0, "nakit",  new[] { 0, 5 },    new[] { 5, 8 },  6),
                (0, 1, "vadeli", new[] { 1, 3 },    new[] { 4, 6 },  5),
                (0, 7, "nakit",  new[] { 0, 3, 7 }, new[] { 3, 5, 2 }, 3),
                (1, 2, "vadeli", new[] { 2, 6 },    new[] { 6, 5 },  4),
                (1, 4, "nakit",  new[] { 0, 4 },    new[] { 10, 3 }, 2),
            };

            int faturaSayaci = 1;
            foreach (var (aracIndex, musteriIndex, odemeTipi, urunIdx, adetler, saatOnce) in faturaTanimlari)
            {
                var musteri = musteriler[musteriIndex];
                var kesimZamani = DateTime.Now.AddHours(-saatOnce);

                decimal araToplam = 0;
                decimal kdvToplam = 0;
                var kalemler = new List<InvoiceItem>();

                for (int i = 0; i < urunIdx.Length; i++)
                {
                    var urun = urunler[urunIdx[i]];
                    int adet = adetler[i];
                    decimal net = urun.Price * adet;
                    decimal kdv = net * urun.VatRate / 100;
                    araToplam += net;
                    kdvToplam += kdv;

                    kalemler.Add(new InvoiceItem
                    {
                        ProductId = urun.Id,
                        ProductName = urun.Name,
                        Quantity = adet,
                        UnitPrice = urun.Price,
                        VatRate = urun.VatRate,
                        LineTotal = net + kdv
                    });

                    // Araç stoğundan düş
                    var stok = db.VanStocks.FirstOrDefault(
                        s => s.VanId == araclar[aracIndex].Id && s.ProductId == urun.Id);
                    if (stok != null)
                    {
                        stok.Quantity -= adet;
                    }
                }

                decimal genelToplam = araToplam + kdvToplam;

                db.Invoices.Add(new Invoice
                {
                    InvoiceNo = "FS-2026-" + (faturaSayaci).ToString("D6"),
                    OfflineId = "van" + araclar[aracIndex].Id + "-seed-" + faturaSayaci,
                    CustomerId = musteri.Id,
                    VanId = araclar[aracIndex].Id,
                    SalesRepId = araclar[aracIndex].DriverId ?? personel[2].Id,
                    PaymentType = odemeTipi,
                    SubTotal = araToplam,
                    VatTotal = kdvToplam,
                    GrandTotal = genelToplam,
                    // Vadeli faturalarda kısmi ödeme
                    PaidAmount = odemeTipi == "nakit" ? genelToplam : genelToplam * 0.3M,
                    IssuedAt = kesimZamani,
                    SyncedAt = kesimZamani.AddMinutes(20),
                    Latitude = musteri.Latitude,
                    Longitude = musteri.Longitude,
                    Items = kalemler
                });

                faturaSayaci++;
            }
            db.SaveChanges();

            // Vadeli faturalara kısmi tahsilat kaydı
            var vadeliFaturalar = db.Invoices.Where(f => f.PaymentType == "vadeli").ToList();
            int tahsilatSayaci = 1;
            foreach (var f in vadeliFaturalar)
            {
                if (f.PaidAmount > 0)
                {
                    db.Collections.Add(new Collection
                    {
                        InvoiceId = f.Id,
                        OfflineId = "tah-seed-" + (tahsilatSayaci++),
                        Amount = f.PaidAmount,
                        Method = "nakit",
                        CollectedById = f.SalesRepId,
                        CollectedAt = f.IssuedAt,
                        SyncedAt = f.SyncedAt
                    });
                }
            }
            db.SaveChanges();

            // Araç GPS rotası (İstanbul içinde örnek noktalar)
            var rota = new (double lat, double lng)[]
            {
                (41.0082, 28.9784), (41.0100, 28.9850), (41.0150, 28.9950),
                (41.0250, 29.0050), (40.9950, 29.0350), (40.9812, 29.0576),
                (40.9870, 29.0260), (41.0270, 29.0663),
            };

            for (int i = 0; i < rota.Length; i++)
            {
                db.VanLocations.Add(new VanLocation
                {
                    VanId = araclar[0].Id,
                    Latitude = rota[i].lat,
                    Longitude = rota[i].lng,
                    SpeedKmh = 20 + (i * 5) % 40,
                    RecordedAt = DateTime.Now.AddHours(-7).AddMinutes(i * 45),
                    SyncedAt = DateTime.Now.AddHours(-1)
                });
            }
            db.SaveChanges();
        }
    }
}
