using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtoServisApi.Data;
using OtoServisApi.Models;

namespace OtoServisApi.Controllers
{
    public class YeniIsEmri
    {
        public int VehicleId { get; set; }
        public string ComplaintText { get; set; }
        public int Mileage { get; set; }
        public int? TechnicianId { get; set; }
    }

    public class DurumIstegi
    {
        public string Status { get; set; }
    }

    public class YeniInceleme
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Severity { get; set; }
    }

    public class ParcaCekme
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
    }

    public class YeniIscilik
    {
        public string Description { get; set; }
        public decimal Hours { get; set; }
        public decimal HourlyRate { get; set; }
    }

    [ApiController]
    [Route("api/jobcards")]
    [Authorize]
    public class JobCardsController : ControllerBase
    {
        private readonly OtoServisContext db;

        // Geçerli iş emri durumları
        private static readonly string[] Durumlar =
            { "acildi", "incelemede", "onay_bekliyor", "tamirde", "tamamlandi", "teslim_edildi", "iptal" };

        public JobCardsController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        private int AktifKullaniciId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }

        // İş emri listesi — durum, plaka/müşteri arama ve tarih filtresi
        [HttpGet]
        public async Task<IActionResult> Listele(string status, string q, DateTime? date)
        {
            var sorgu = db.JobCards.Include(j => j.Vehicle).Include(j => j.Customer).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                sorgu = sorgu.Where(j => j.Status == status);
            }
            if (!string.IsNullOrWhiteSpace(q))
            {
                sorgu = sorgu.Where(j => j.JobNo.Contains(q)
                                      || j.Vehicle.Plate.Contains(q)
                                      || j.Customer.FullName.Contains(q));
            }
            if (date.HasValue)
            {
                var gun = date.Value.Date;
                sorgu = sorgu.Where(j => j.OpenedAt >= gun && j.OpenedAt < gun.AddDays(1));
            }

            var liste = await sorgu.OrderByDescending(j => j.OpenedAt).ToListAsync();

            return Ok(liste.Select(j => new
            {
                id = j.Id,
                job_no = j.JobNo,
                status = j.Status,
                plate = j.Vehicle.Plate,
                brand = j.Vehicle.Brand,
                model = j.Vehicle.Model,
                customer_name = j.Customer.FullName,
                customer_phone = j.Customer.Phone,
                complaint_text = j.ComplaintText,
                labor_total = j.LaborTotal,
                parts_total = j.PartsTotal,
                grand_total = j.GrandTotal,
                opened_at = j.OpenedAt,
                completed_at = j.CompletedAt
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Getir(int id)
        {
            var isEmri = await db.JobCards
                .Include(j => j.Vehicle)
                .Include(j => j.Customer)
                .Include(j => j.InspectionItems)
                .Include(j => j.JobParts).ThenInclude(p => p.Part)
                .Include(j => j.LaborItems)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }

            var teknisyen = isEmri.TechnicianId.HasValue
                ? await db.Users.FindAsync(isEmri.TechnicianId.Value) : null;
            var acan = await db.Users.FindAsync(isEmri.OpenedById);
            var fatura = await db.Invoices.FirstOrDefaultAsync(f => f.JobCardId == id);

            return Ok(new
            {
                id = isEmri.Id,
                job_no = isEmri.JobNo,
                status = isEmri.Status,
                complaint_text = isEmri.ComplaintText,
                notes = isEmri.Notes,
                mileage = isEmri.Mileage,
                opened_at = isEmri.OpenedAt,
                completed_at = isEmri.CompletedAt,
                opened_by_name = acan != null ? acan.FullName : null,
                technician_id = isEmri.TechnicianId,
                technician_name = teknisyen != null ? teknisyen.FullName : null,
                labor_total = isEmri.LaborTotal,
                parts_total = isEmri.PartsTotal,
                grand_total = isEmri.GrandTotal,
                vehicle = new
                {
                    id = isEmri.Vehicle.Id, plate = isEmri.Vehicle.Plate,
                    brand = isEmri.Vehicle.Brand, model = isEmri.Vehicle.Model,
                    year = isEmri.Vehicle.Year, color = isEmri.Vehicle.Color,
                    chassis_no = isEmri.Vehicle.ChassisNo
                },
                customer = new
                {
                    id = isEmri.Customer.Id, full_name = isEmri.Customer.FullName,
                    phone = isEmri.Customer.Phone, email = isEmri.Customer.Email
                },
                inspection_items = isEmri.InspectionItems.Select(i => new
                {
                    id = i.Id, title = i.Title, description = i.Description,
                    severity = i.Severity, photo_path = i.PhotoPath, created_at = i.CreatedAt
                }),
                job_parts = isEmri.JobParts.Select(p => new
                {
                    id = p.Id, part_id = p.PartId, code = p.Part.Code, name = p.Part.Name,
                    quantity = p.Quantity, unit_price = p.UnitPrice, line_total = p.LineTotal
                }),
                labor_items = isEmri.LaborItems.Select(l => new
                {
                    id = l.Id, description = l.Description, hours = l.Hours,
                    hourly_rate = l.HourlyRate, line_total = l.LineTotal
                }),
                invoice = fatura == null ? null : new
                {
                    id = fatura.Id, invoice_no = fatura.InvoiceNo,
                    grand_total = fatura.GrandTotal, is_paid = fatura.IsPaid
                }
            });
        }

        // Yeni iş emri aç
        [HttpPost]
        public async Task<IActionResult> Ac(YeniIsEmri istek)
        {
            var arac = await db.Vehicles.FindAsync(istek.VehicleId);
            if (arac == null)
            {
                return BadRequest(new { message = "Araç bulunamadı." });
            }
            if (string.IsNullOrWhiteSpace(istek.ComplaintText))
            {
                return BadRequest(new { message = "Müşteri şikayeti yazılmalıdır." });
            }

            // İş emri numarası üret
            int yil = DateTime.Now.Year;
            int sayac = await db.JobCards.CountAsync(j => j.JobNo.StartsWith("IS-" + yil)) + 1;

            var isEmri = new JobCard
            {
                JobNo = "IS-" + yil + "-" + sayac.ToString("D5"),
                VehicleId = arac.Id,
                CustomerId = arac.CustomerId,
                Status = "acildi",
                ComplaintText = istek.ComplaintText,
                Mileage = istek.Mileage > 0 ? istek.Mileage : arac.Mileage,
                TechnicianId = istek.TechnicianId,
                OpenedById = AktifKullaniciId()
            };

            db.JobCards.Add(isEmri);

            // Aracın kilometresini güncelle
            if (istek.Mileage > arac.Mileage)
            {
                arac.Mileage = istek.Mileage;
            }

            await db.SaveChangesAsync();
            return Ok(new { id = isEmri.Id, job_no = isEmri.JobNo, status = isEmri.Status });
        }

        // Durum güncelle
        [HttpPut("{id}/status")]
        public async Task<IActionResult> DurumGuncelle(int id, DurumIstegi istek)
        {
            if (!Durumlar.Contains(istek.Status))
            {
                return BadRequest(new { message = "Geçersiz iş emri durumu." });
            }

            var isEmri = await db.JobCards.FindAsync(id);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            if (isEmri.Status == "teslim_edildi")
            {
                return BadRequest(new { message = "Teslim edilmiş iş emri güncellenemez." });
            }

            isEmri.Status = istek.Status;
            if (istek.Status == "tamamlandi" || istek.Status == "teslim_edildi")
            {
                if (isEmri.CompletedAt == null)
                {
                    isEmri.CompletedAt = DateTime.Now;
                }
            }

            await db.SaveChangesAsync();
            return Ok(new { id = isEmri.Id, job_no = isEmri.JobNo, status = isEmri.Status });
        }

        // Teknisyen ata
        [HttpPut("{id}/technician/{technicianId}")]
        public async Task<IActionResult> TeknisyenAta(int id, int technicianId)
        {
            var isEmri = await db.JobCards.FindAsync(id);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            var teknisyen = await db.Users.FindAsync(technicianId);
            if (teknisyen == null || teknisyen.Role != "teknisyen")
            {
                return BadRequest(new { message = "Geçerli bir teknisyen seçilmelidir." });
            }

            isEmri.TechnicianId = technicianId;
            await db.SaveChangesAsync();
            return Ok(new { id = isEmri.Id, technician_name = teknisyen.FullName });
        }

        // ---- Arıza tespit (tablet) ----

        [HttpPost("{id}/inspection")]
        public async Task<IActionResult> IncelemeEkle(int id, YeniInceleme istek)
        {
            var isEmri = await db.JobCards.FindAsync(id);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            if (string.IsNullOrWhiteSpace(istek.Title))
            {
                return BadRequest(new { message = "Tespit başlığı zorunludur." });
            }

            var kalem = new InspectionItem
            {
                JobCardId = id,
                Title = istek.Title,
                Description = istek.Description,
                Severity = string.IsNullOrWhiteSpace(istek.Severity) ? "orta" : istek.Severity,
                CreatedById = AktifKullaniciId()
            };
            db.InspectionItems.Add(kalem);

            // İlk tespit girildiğinde iş emri incelemeye geçsin
            if (isEmri.Status == "acildi")
            {
                isEmri.Status = "incelemede";
            }

            await db.SaveChangesAsync();
            return Ok(new { id = kalem.Id, title = kalem.Title, severity = kalem.Severity });
        }

        // Arıza fotoğrafı yükle
        [HttpPost("inspection/{inspectionId}/photo")]
        public async Task<IActionResult> FotoYukle(int inspectionId, IFormFile dosya)
        {
            var kalem = await db.InspectionItems.FindAsync(inspectionId);
            if (kalem == null)
            {
                return NotFound(new { message = "Tespit kaydı bulunamadı." });
            }
            if (dosya == null || dosya.Length == 0)
            {
                return BadRequest(new { message = "Fotoğraf seçilmedi." });
            }
            if (dosya.Length > 8 * 1024 * 1024)
            {
                return BadRequest(new { message = "Fotoğraf en fazla 8 MB olabilir." });
            }

            string klasor = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(klasor);

            string uzanti = Path.GetExtension(dosya.FileName);
            string dosyaAdi = "tespit_" + inspectionId + "_" + DateTime.Now.Ticks + uzanti;
            string tamYol = Path.Combine(klasor, dosyaAdi);

            using (var akis = new FileStream(tamYol, FileMode.Create))
            {
                await dosya.CopyToAsync(akis);
            }

            kalem.PhotoPath = "/uploads/" + dosyaAdi;
            await db.SaveChangesAsync();

            return Ok(new { photo_path = kalem.PhotoPath });
        }

        // ---- Parça çekme ----

        [HttpPost("{id}/parts")]
        public async Task<IActionResult> ParcaCek(int id, ParcaCekme istek)
        {
            var isEmri = await db.JobCards.FindAsync(id);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            if (isEmri.Status == "teslim_edildi")
            {
                return BadRequest(new { message = "Teslim edilmiş iş emrine parça eklenemez." });
            }

            var parca = await db.Parts.FindAsync(istek.PartId);
            if (parca == null)
            {
                return BadRequest(new { message = "Parça bulunamadı." });
            }
            if (istek.Quantity <= 0)
            {
                return BadRequest(new { message = "Miktar sıfırdan büyük olmalıdır." });
            }
            if (parca.StockQuantity < istek.Quantity)
            {
                return BadRequest(new { message = "Stok yetersiz. Depoda " + parca.StockQuantity + " adet var." });
            }

            var kalem = new JobPart
            {
                JobCardId = id,
                PartId = parca.Id,
                Quantity = istek.Quantity,
                UnitPrice = parca.Price,
                LineTotal = parca.Price * istek.Quantity,
                WithdrawnById = AktifKullaniciId()
            };
            db.JobParts.Add(kalem);

            // Depodan düş
            parca.StockQuantity -= istek.Quantity;

            await db.SaveChangesAsync();
            await ToplamlariHesapla(id);

            return Ok(new { id = kalem.Id, name = parca.Name, line_total = kalem.LineTotal,
                            remaining_stock = parca.StockQuantity });
        }

        // Parça iadesi (yanlış çekilen parça depoya geri döner)
        [HttpDelete("parts/{jobPartId}")]
        public async Task<IActionResult> ParcaIade(int jobPartId)
        {
            var kalem = await db.JobParts.Include(p => p.Part)
                                         .FirstOrDefaultAsync(p => p.Id == jobPartId);
            if (kalem == null)
            {
                return NotFound(new { message = "Parça kaydı bulunamadı." });
            }

            int isEmriId = kalem.JobCardId;
            kalem.Part.StockQuantity += kalem.Quantity;
            db.JobParts.Remove(kalem);
            await db.SaveChangesAsync();
            await ToplamlariHesapla(isEmriId);

            return Ok(new { message = "Parça depoya iade edildi." });
        }

        // ---- İşçilik ----

        [HttpPost("{id}/labor")]
        public async Task<IActionResult> IscilikEkle(int id, YeniIscilik istek)
        {
            var isEmri = await db.JobCards.FindAsync(id);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            if (string.IsNullOrWhiteSpace(istek.Description))
            {
                return BadRequest(new { message = "İşçilik açıklaması zorunludur." });
            }
            if (istek.Hours <= 0 || istek.HourlyRate <= 0)
            {
                return BadRequest(new { message = "Saat ve saat ücreti sıfırdan büyük olmalıdır." });
            }

            var kalem = new LaborItem
            {
                JobCardId = id,
                Description = istek.Description,
                Hours = istek.Hours,
                HourlyRate = istek.HourlyRate,
                LineTotal = istek.Hours * istek.HourlyRate
            };
            db.LaborItems.Add(kalem);
            await db.SaveChangesAsync();
            await ToplamlariHesapla(id);

            return Ok(new { id = kalem.Id, line_total = kalem.LineTotal });
        }

        [HttpDelete("labor/{laborId}")]
        public async Task<IActionResult> IscilikSil(int laborId)
        {
            var kalem = await db.LaborItems.FindAsync(laborId);
            if (kalem == null)
            {
                return NotFound(new { message = "İşçilik kaydı bulunamadı." });
            }
            int isEmriId = kalem.JobCardId;
            db.LaborItems.Remove(kalem);
            await db.SaveChangesAsync();
            await ToplamlariHesapla(isEmriId);

            return Ok(new { message = "İşçilik kalemi silindi." });
        }

        // İş emrinin parça/işçilik toplamlarını yeniden hesaplar
        private async Task ToplamlariHesapla(int isEmriId)
        {
            var isEmri = await db.JobCards.FindAsync(isEmriId);
            if (isEmri == null)
            {
                return;
            }

            isEmri.PartsTotal = await db.JobParts.Where(p => p.JobCardId == isEmriId)
                                                 .SumAsync(p => (decimal?)p.LineTotal) ?? 0;
            isEmri.LaborTotal = await db.LaborItems.Where(l => l.JobCardId == isEmriId)
                                                   .SumAsync(l => (decimal?)l.LineTotal) ?? 0;
            isEmri.GrandTotal = isEmri.PartsTotal + isEmri.LaborTotal;

            await db.SaveChangesAsync();
        }
    }
}
