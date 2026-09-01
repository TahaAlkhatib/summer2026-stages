using OtoServisApi.Models;

namespace OtoServisApi.Data
{
    // Türkçe demo verisi. Veritabanı boşsa uygulama açılışında yüklenir.
    public static class SeedData
    {
        public static void Yukle(OtoServisContext db)
        {
            if (db.Users.Any())
            {
                return;
            }

            string sifre = BCrypt.Net.BCrypt.HashPassword("123456");

            db.Users.AddRange(
                new User { FullName = "Ahmet Yılmaz", Username = "admin", PasswordHash = sifre, Role = "admin", Phone = "+90 532 111 22 33" },
                new User { FullName = "Zeynep Kaya", Username = "danisman1", PasswordHash = sifre, Role = "danisman", Phone = "+90 533 222 33 44" },
                new User { FullName = "Mustafa Demir", Username = "teknisyen1", PasswordHash = sifre, Role = "teknisyen", Phone = "+90 534 333 44 55" },
                new User { FullName = "Hakan Öztürk", Username = "teknisyen2", PasswordHash = sifre, Role = "teknisyen", Phone = "+90 535 444 55 66" }
            );
            db.SaveChanges();

            var musteriler = new List<Customer>
            {
                new Customer { FullName = "Elif Şahin", Phone = "+90 535 401 11 21", Email = "elif.sahin@ornek.com", Address = "Bağdat Cad. No:112 / Kadıköy" },
                new Customer { FullName = "Burak Aydın", Phone = "+90 536 402 12 22", Email = "burak.aydin@ornek.com", Address = "Barbaros Bulvarı No:38 / Beşiktaş" },
                new Customer { FullName = "Merve Doğan", Phone = "+90 537 403 13 23", Email = "merve.dogan@ornek.com", Address = "Çamlıca Mah. 12. Sok No:7 / Üsküdar" },
                new Customer { FullName = "Emre Çelik", Phone = "+90 538 404 14 24", Email = "emre.celik@ornek.com", Address = "Halaskargazi Cad. No:200 / Şişli" },
                new Customer { FullName = "Ayşe Koç", Phone = "+90 539 405 15 25", Email = "ayse.koc@ornek.com", Address = "İncirli Cad. No:45 / Bakırköy" },
                new Customer { FullName = "Kerem Arslan", Phone = "+90 505 406 16 26", Email = "kerem.arslan@ornek.com", Address = "Nispetiye Cad. No:18 / Beşiktaş" },
                new Customer { FullName = "Selin Yıldız", Phone = "+90 506 407 17 27", Email = "selin.yildiz@ornek.com", Address = "Moda Cad. No:88 / Kadıköy" },
                new Customer { FullName = "Onur Polat", Phone = "+90 507 408 18 28", Email = "onur.polat@ornek.com", Address = "Atatürk Bulvarı No:15 / Ataşehir" }
            };
            db.Customers.AddRange(musteriler);
            db.SaveChanges();

            var araclar = new List<Vehicle>
            {
                new Vehicle { CustomerId = musteriler[0].Id, Plate = "34 ABC 123", Brand = "Renault", Model = "Clio", Year = 2019, Mileage = 78500, Color = "Beyaz", ChassisNo = "VF1RJA00123456789" },
                new Vehicle { CustomerId = musteriler[1].Id, Plate = "34 XYZ 456", Brand = "Volkswagen", Model = "Passat", Year = 2021, Mileage = 45200, Color = "Siyah", ChassisNo = "WVWZZZ3CZME123456" },
                new Vehicle { CustomerId = musteriler[2].Id, Plate = "06 DEF 789", Brand = "Fiat", Model = "Egea", Year = 2020, Mileage = 92300, Color = "Gri", ChassisNo = "ZFA35600006123456" },
                new Vehicle { CustomerId = musteriler[3].Id, Plate = "35 GHI 321", Brand = "Toyota", Model = "Corolla", Year = 2022, Mileage = 31000, Color = "Lacivert", ChassisNo = "SB1KZ3JE10E123456" },
                new Vehicle { CustomerId = musteriler[4].Id, Plate = "34 JKL 654", Brand = "Ford", Model = "Focus", Year = 2018, Mileage = 128400, Color = "Kırmızı", ChassisNo = "WF05XXGCC5JB12345" },
                new Vehicle { CustomerId = musteriler[5].Id, Plate = "34 MNO 987", Brand = "BMW", Model = "320i", Year = 2023, Mileage = 18700, Color = "Beyaz", ChassisNo = "WBA5A11009D123456" },
                new Vehicle { CustomerId = musteriler[6].Id, Plate = "16 PRS 147", Brand = "Hyundai", Model = "i20", Year = 2020, Mileage = 66900, Color = "Mavi", ChassisNo = "NLHB251CACZ123456" },
                new Vehicle { CustomerId = musteriler[7].Id, Plate = "34 TUV 258", Brand = "Peugeot", Model = "301", Year = 2017, Mileage = 154200, Color = "Gümüş", ChassisNo = "VF3DDHMZ6HJ123456" }
            };
            db.Vehicles.AddRange(araclar);
            db.SaveChanges();

            db.Parts.AddRange(
                new Part { Code = "YF-001", Name = "Motor Yağı Filtresi", Brand = "Bosch", Price = 185.00M, StockQuantity = 42, MinStock = 10 },
                new Part { Code = "HF-002", Name = "Hava Filtresi", Brand = "Mann", Price = 240.00M, StockQuantity = 28, MinStock = 8 },
                new Part { Code = "PB-003", Name = "Ön Fren Balatası (Takım)", Brand = "Ferodo", Price = 1250.00M, StockQuantity = 15, MinStock = 6 },
                new Part { Code = "PD-004", Name = "Ön Fren Diski (Çift)", Brand = "Brembo", Price = 2400.00M, StockQuantity = 9, MinStock = 4 },
                new Part { Code = "MY-005", Name = "Motor Yağı 5W-30 (4L)", Brand = "Castrol", Unit = "litre", Price = 890.00M, StockQuantity = 60, MinStock = 20 },
                new Part { Code = "AK-006", Name = "Akü 60Ah", Brand = "Mutlu", Price = 2150.00M, StockQuantity = 7, MinStock = 3 },
                new Part { Code = "BJ-007", Name = "Buji (Takım)", Brand = "NGK", Price = 620.00M, StockQuantity = 24, MinStock = 8 },
                new Part { Code = "TR-008", Name = "Triger Seti", Brand = "Gates", Price = 3200.00M, StockQuantity = 5, MinStock = 2 },
                new Part { Code = "AM-009", Name = "Ön Amortisör", Brand = "Monroe", Price = 1680.00M, StockQuantity = 11, MinStock = 4 },
                new Part { Code = "PF-010", Name = "Polen Filtresi", Brand = "Mahle", Price = 195.00M, StockQuantity = 33, MinStock = 10 }
            );
            db.SaveChanges();

            // İş emirleri — her durumdan örnek
            string[] durumlar = { "acildi", "incelemede", "onay_bekliyor", "tamirde", "tamamlandi", "teslim_edildi" };
            string[] sikayetler = {
                "Motorda tıkırtı sesi var, özellikle soğukken.",
                "Fren pedalı derine gidiyor, frenleme zayıf.",
                "Periyodik bakım (30.000 km) talebi.",
                "Klima soğutmuyor, sadece fan üflüyor.",
                "Direksiyonda titreme, 90 km/s üzerinde artıyor.",
                "Motor arıza lambası yandı."
            };

            for (int i = 0; i < durumlar.Length; i++)
            {
                var arac = araclar[i];
                var jobCard = new JobCard
                {
                    JobNo = "IS-2026-" + (i + 1).ToString("D5"),
                    VehicleId = arac.Id,
                    CustomerId = arac.CustomerId,
                    Status = durumlar[i],
                    ComplaintText = sikayetler[i],
                    OpenedById = 2,
                    TechnicianId = (i % 2 == 0) ? 3 : 4,
                    Mileage = arac.Mileage,
                    OpenedAt = DateTime.Now.AddDays(-(6 - i)),
                    CompletedAt = (durumlar[i] == "tamamlandi" || durumlar[i] == "teslim_edildi")
                                  ? DateTime.Now.AddDays(-(6 - i)).AddHours(6) : (DateTime?)null
                };
                db.JobCards.Add(jobCard);
                db.SaveChanges();

                // İnceleme kalemi (tablet üzerinden girilmiş gibi)
                if (i >= 1)
                {
                    db.InspectionItems.Add(new InspectionItem
                    {
                        JobCardId = jobCard.Id,
                        Title = "Görsel kontrol yapıldı",
                        Description = "Arıza tespit edildi, ilgili parçalar değişmeli.",
                        Severity = (i % 3 == 0) ? "yuksek" : "orta",
                        CreatedById = jobCard.TechnicianId.Value,
                        CreatedAt = jobCard.OpenedAt.AddHours(1)
                    });
                }

                // Parça ve işçilik (ilerlemiş işlerde)
                decimal parcaToplam = 0;
                decimal iscilikToplam = 0;

                if (i >= 3)
                {
                    var parca = db.Parts.First(p => p.Code == "YF-001");
                    var parca2 = db.Parts.First(p => p.Code == "MY-005");

                    db.JobParts.Add(new JobPart
                    {
                        JobCardId = jobCard.Id, PartId = parca.Id, Quantity = 1,
                        UnitPrice = parca.Price, LineTotal = parca.Price,
                        WithdrawnById = jobCard.TechnicianId.Value
                    });
                    db.JobParts.Add(new JobPart
                    {
                        JobCardId = jobCard.Id, PartId = parca2.Id, Quantity = 4,
                        UnitPrice = parca2.Price, LineTotal = parca2.Price * 4,
                        WithdrawnById = jobCard.TechnicianId.Value
                    });
                    parcaToplam = parca.Price + (parca2.Price * 4);

                    // Stoktan düş
                    parca.StockQuantity -= 1;
                    parca2.StockQuantity -= 4;

                    db.LaborItems.Add(new LaborItem
                    {
                        JobCardId = jobCard.Id, Description = "Yağ ve filtre değişimi",
                        Hours = 1.5M, HourlyRate = 450M, LineTotal = 675M
                    });
                    iscilikToplam = 675M;
                }

                jobCard.PartsTotal = parcaToplam;
                jobCard.LaborTotal = iscilikToplam;
                jobCard.GrandTotal = parcaToplam + iscilikToplam;
                db.SaveChanges();

                // Tamamlanan işlere fatura
                if (durumlar[i] == "tamamlandi" || durumlar[i] == "teslim_edildi")
                {
                    decimal kdv = jobCard.GrandTotal * 0.20M;
                    db.Invoices.Add(new Invoice
                    {
                        InvoiceNo = "FT-2026-" + (i + 1).ToString("D5"),
                        JobCardId = jobCard.Id,
                        LaborTotal = jobCard.LaborTotal,
                        PartsTotal = jobCard.PartsTotal,
                        TaxRate = 20,
                        TaxAmount = kdv,
                        GrandTotal = jobCard.GrandTotal + kdv,
                        IsPaid = durumlar[i] == "teslim_edildi",
                        PaidAt = durumlar[i] == "teslim_edildi" ? DateTime.Now : (DateTime?)null,
                        IssueDate = jobCard.OpenedAt.AddHours(7)
                    });
                    db.SaveChanges();
                }
            }
        }
    }
}
