using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanSalesApi.Data;
using VanSalesApi.Models;

namespace VanSalesApi.Controllers
{
    // ---- Mobil uygulamadan gelen çevrimdışı kayıtlar ----

    public class GelenFaturaKalemi
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal VatRate { get; set; }
    }

    public class GelenFatura
    {
        // Mobil cihazda üretilen benzersiz kimlik (örn. "van3-1788301234567-42")
        public string OfflineId { get; set; }
        public int CustomerId { get; set; }
        public string PaymentType { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime IssuedAt { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string Notes { get; set; }
        public List<GelenFaturaKalemi> Items { get; set; }
    }

    public class GelenTahsilat
    {
        public string OfflineId { get; set; }
        public string InvoiceOfflineId { get; set; }
        public decimal Amount { get; set; }
        public string Method { get; set; }
        public DateTime CollectedAt { get; set; }
    }

    public class GelenKonum
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double? SpeedKmh { get; set; }
        public DateTime RecordedAt { get; set; }
    }

    public class SenkronIstegi
    {
        public List<GelenFatura> Invoices { get; set; }
        public List<GelenTahsilat> Collections { get; set; }
        public List<GelenKonum> Locations { get; set; }
    }

    public class SenkronSonucu
    {
        public string OfflineId { get; set; }
        public string Status { get; set; }   // kaydedildi / zaten_var / hata
        public string Message { get; set; }
        public string InvoiceNo { get; set; }
    }

    [ApiController]
    [Route("api/sync")]
    [Authorize]
    public class SyncController : ControllerBase
    {
        private readonly VanSalesContext db;

        public SyncController(VanSalesContext veritabani)
        {
            db = veritabani;
        }

        private int AktifKullaniciId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        private int AktifAracId()
        {
            string deger = User.FindFirstValue("van_id");
            return string.IsNullOrEmpty(deger) ? 0 : int.Parse(deger);
        }

        // ---- ÇEKME: mobil uygulama çevrimdışı çalışabilmek için
        // ürün listesini, müşterileri ve araç stoğunu indirir ----
        [HttpGet("pull")]
        public async Task<IActionResult> Cek()
        {
            int aracId = AktifAracId();
            if (aracId == 0)
            {
                return BadRequest(new { message = "Kullanıcıya tanımlı bir araç yok." });
            }

            var urunler = await db.Products.Where(u => u.IsActive)
                .Select(u => new
                {
                    id = u.Id, code = u.Code, name = u.Name, unit = u.Unit,
                    price = u.Price, vat_rate = u.VatRate
                }).ToListAsync();

            var musteriler = await db.Customers.Where(m => m.IsActive)
                .Select(m => new
                {
                    id = m.Id, name = m.Name, contact_name = m.ContactName,
                    phone = m.Phone, address = m.Address, district = m.District,
                    tax_number = m.TaxNumber, credit_limit = m.CreditLimit
                }).ToListAsync();

            var aracStogu = await db.VanStocks
                .Include(s => s.Product)
                .Where(s => s.VanId == aracId)
                .Select(s => new
                {
                    product_id = s.ProductId, code = s.Product.Code,
                    name = s.Product.Name, quantity = s.Quantity
                }).ToListAsync();

            var arac = await db.Vans.FirstOrDefaultAsync(a => a.Id == aracId);

            // Bu araçtan kesilmiş, borcu kalan faturalar (sahada tahsilat için)
            var acikFaturalar = await db.Invoices
                .Include(f => f.Customer)
                .Where(f => f.VanId == aracId && f.PaymentType == "vadeli" && f.PaidAmount < f.GrandTotal)
                .Select(f => new
                {
                    id = f.Id, offline_id = f.OfflineId, invoice_no = f.InvoiceNo,
                    customer_id = f.CustomerId, customer_name = f.Customer.Name,
                    grand_total = f.GrandTotal, paid_amount = f.PaidAmount,
                    remaining = f.GrandTotal - f.PaidAmount, issued_at = f.IssuedAt
                }).ToListAsync();

            return Ok(new
            {
                server_time = DateTime.Now,
                van = arac == null ? null : new { id = arac.Id, plate = arac.Plate },
                products = urunler,
                customers = musteriler,
                van_stock = aracStogu,
                open_invoices = acikFaturalar
            });
        }

        // ---- GÖNDERME: sahada çevrimdışı üretilen kayıtlar sunucuya aktarılır ----
        //
        // Her kaydın OfflineId'si vardır. Aynı kayıt tekrar gönderilirse
        // (ör. internet kesilip yeniden denendi) ikinci kez işlenmez.
        // Bu sayede senkronizasyon idempotent olur.
        [HttpPost("push")]
        public async Task<IActionResult> Gonder(SenkronIstegi istek)
        {
            int aracId = AktifAracId();
            int kullaniciId = AktifKullaniciId();

            if (aracId == 0)
            {
                return BadRequest(new { message = "Kullanıcıya tanımlı bir araç yok." });
            }

            var faturaSonuclari = new List<SenkronSonucu>();
            var tahsilatSonuclari = new List<SenkronSonucu>();
            int konumSayisi = 0;

            // ---- Faturalar ----
            if (istek.Invoices != null)
            {
                foreach (var gelen in istek.Invoices)
                {
                    var sonuc = new SenkronSonucu { OfflineId = gelen.OfflineId };

                    try
                    {
                        if (string.IsNullOrWhiteSpace(gelen.OfflineId))
                        {
                            sonuc.Status = "hata";
                            sonuc.Message = "Çevrimdışı kimlik boş olamaz.";
                            faturaSonuclari.Add(sonuc);
                            continue;
                        }

                        var mevcut = await db.Invoices
                            .FirstOrDefaultAsync(f => f.OfflineId == gelen.OfflineId);
                        if (mevcut != null)
                        {
                            // Daha önce alınmış — tekrar işleme
                            sonuc.Status = "zaten_var";
                            sonuc.InvoiceNo = mevcut.InvoiceNo;
                            sonuc.Message = "Bu fatura daha önce alınmıştı.";
                            faturaSonuclari.Add(sonuc);
                            continue;
                        }

                        if (gelen.Items == null || gelen.Items.Count == 0)
                        {
                            sonuc.Status = "hata";
                            sonuc.Message = "Faturada kalem yok.";
                            faturaSonuclari.Add(sonuc);
                            continue;
                        }

                        var musteri = await db.Customers.FindAsync(gelen.CustomerId);
                        if (musteri == null)
                        {
                            sonuc.Status = "hata";
                            sonuc.Message = "Müşteri bulunamadı.";
                            faturaSonuclari.Add(sonuc);
                            continue;
                        }

                        // Fatura numarası sunucuda üretilir (resmî sıra numarası)
                        int yil = DateTime.Now.Year;
                        int sayac = await db.Invoices.CountAsync(f => f.InvoiceNo.StartsWith("FS-" + yil)) + 1;
                        string faturaNo = "FS-" + yil + "-" + sayac.ToString("D6");

                        decimal araToplam = 0;
                        decimal kdvToplam = 0;

                        var fatura = new Invoice
                        {
                            InvoiceNo = faturaNo,
                            OfflineId = gelen.OfflineId,
                            CustomerId = gelen.CustomerId,
                            VanId = aracId,
                            SalesRepId = kullaniciId,
                            PaymentType = gelen.PaymentType == "vadeli" ? "vadeli" : "nakit",
                            IssuedAt = gelen.IssuedAt,
                            Latitude = gelen.Latitude,
                            Longitude = gelen.Longitude,
                            Notes = gelen.Notes,
                            Items = new List<InvoiceItem>()
                        };

                        foreach (var k in gelen.Items)
                        {
                            decimal satirNet = k.UnitPrice * k.Quantity;
                            decimal satirKdv = satirNet * k.VatRate / 100;
                            araToplam += satirNet;
                            kdvToplam += satirKdv;

                            fatura.Items.Add(new InvoiceItem
                            {
                                ProductId = k.ProductId,
                                ProductName = k.ProductName,
                                Quantity = k.Quantity,
                                UnitPrice = k.UnitPrice,
                                VatRate = k.VatRate,
                                LineTotal = satirNet + satirKdv
                            });

                            // Araç stoğundan düş
                            var stok = await db.VanStocks
                                .FirstOrDefaultAsync(s => s.VanId == aracId && s.ProductId == k.ProductId);
                            if (stok != null)
                            {
                                stok.Quantity -= k.Quantity;
                                stok.UpdatedAt = DateTime.Now;
                            }
                        }

                        fatura.SubTotal = araToplam;
                        fatura.VatTotal = kdvToplam;
                        fatura.GrandTotal = araToplam + kdvToplam;
                        // Nakit satışta tamamı tahsil edilmiş sayılır
                        fatura.PaidAmount = fatura.PaymentType == "nakit"
                            ? fatura.GrandTotal
                            : gelen.PaidAmount;

                        db.Invoices.Add(fatura);
                        await db.SaveChangesAsync();

                        sonuc.Status = "kaydedildi";
                        sonuc.InvoiceNo = faturaNo;
                        faturaSonuclari.Add(sonuc);
                    }
                    catch (Exception hata)
                    {
                        sonuc.Status = "hata";
                        sonuc.Message = hata.Message;
                        faturaSonuclari.Add(sonuc);
                    }
                }
            }

            // ---- Tahsilatlar ----
            if (istek.Collections != null)
            {
                foreach (var gelen in istek.Collections)
                {
                    var sonuc = new SenkronSonucu { OfflineId = gelen.OfflineId };

                    try
                    {
                        var mevcut = await db.Collections
                            .FirstOrDefaultAsync(t => t.OfflineId == gelen.OfflineId);
                        if (mevcut != null)
                        {
                            sonuc.Status = "zaten_var";
                            sonuc.Message = "Bu tahsilat daha önce alınmıştı.";
                            tahsilatSonuclari.Add(sonuc);
                            continue;
                        }

                        var fatura = await db.Invoices
                            .FirstOrDefaultAsync(f => f.OfflineId == gelen.InvoiceOfflineId);
                        if (fatura == null)
                        {
                            sonuc.Status = "hata";
                            sonuc.Message = "Tahsilatın bağlı olduğu fatura bulunamadı.";
                            tahsilatSonuclari.Add(sonuc);
                            continue;
                        }

                        decimal kalan = fatura.GrandTotal - fatura.PaidAmount;
                        if (gelen.Amount > kalan)
                        {
                            sonuc.Status = "hata";
                            sonuc.Message = "Tahsilat tutarı kalan borçtan fazla. Kalan: " + kalan.ToString("N2");
                            tahsilatSonuclari.Add(sonuc);
                            continue;
                        }

                        db.Collections.Add(new Collection
                        {
                            InvoiceId = fatura.Id,
                            OfflineId = gelen.OfflineId,
                            Amount = gelen.Amount,
                            Method = gelen.Method ?? "nakit",
                            CollectedById = kullaniciId,
                            CollectedAt = gelen.CollectedAt
                        });

                        fatura.PaidAmount += gelen.Amount;
                        await db.SaveChangesAsync();

                        sonuc.Status = "kaydedildi";
                        tahsilatSonuclari.Add(sonuc);
                    }
                    catch (Exception hata)
                    {
                        sonuc.Status = "hata";
                        sonuc.Message = hata.Message;
                        tahsilatSonuclari.Add(sonuc);
                    }
                }
            }

            // ---- GPS konumları ----
            if (istek.Locations != null && istek.Locations.Count > 0)
            {
                foreach (var k in istek.Locations)
                {
                    db.VanLocations.Add(new VanLocation
                    {
                        VanId = aracId,
                        Latitude = k.Latitude,
                        Longitude = k.Longitude,
                        SpeedKmh = k.SpeedKmh,
                        RecordedAt = k.RecordedAt
                    });
                    konumSayisi++;
                }
                await db.SaveChangesAsync();
            }

            return Ok(new
            {
                server_time = DateTime.Now,
                invoices = faturaSonuclari,
                collections = tahsilatSonuclari,
                locations_saved = konumSayisi
            });
        }
    }
}
