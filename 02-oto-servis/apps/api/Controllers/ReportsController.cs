using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtoServisApi.Data;

namespace OtoServisApi.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly OtoServisContext db;

        public ReportsController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        // Dashboard özeti
        [HttpGet("summary")]
        public async Task<IActionResult> Ozet()
        {
            var bugun = DateTime.Now.Date;
            var ayBasi = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

            var durumSayilari = await db.JobCards
                .GroupBy(j => j.Status)
                .Select(g => new { durum = g.Key, adet = g.Count() })
                .ToListAsync();

            var sayilar = new Dictionary<string, int>
            {
                { "acildi", 0 }, { "incelemede", 0 }, { "onay_bekliyor", 0 },
                { "tamirde", 0 }, { "tamamlandi", 0 }, { "teslim_edildi", 0 }, { "iptal", 0 }
            };
            foreach (var s in durumSayilari)
            {
                sayilar[s.durum] = s.adet;
            }

            int bugunAcilan = await db.JobCards.CountAsync(j => j.OpenedAt >= bugun && j.OpenedAt < bugun.AddDays(1));
            decimal ayCiro = await db.Invoices.Where(f => f.IssueDate >= ayBasi)
                                              .SumAsync(f => (decimal?)f.GrandTotal) ?? 0;
            decimal odenmemis = await db.Invoices.Where(f => !f.IsPaid)
                                                 .SumAsync(f => (decimal?)f.GrandTotal) ?? 0;
            int kritikStok = await db.Parts.CountAsync(p => p.StockQuantity <= p.MinStock);

            // En çok kullanılan parçalar
            var enCokParca = await db.JobParts
                .Include(p => p.Part)
                .GroupBy(p => p.Part.Name)
                .Select(g => new
                {
                    name = g.Key,
                    total_quantity = g.Sum(x => x.Quantity),
                    revenue = g.Sum(x => x.LineTotal)
                })
                .OrderByDescending(x => x.revenue)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                status_counts = sayilar,
                today_opened = bugunAcilan,
                month_revenue = ayCiro,
                unpaid_total = odenmemis,
                low_stock_count = kritikStok,
                top_parts = enCokParca
            });
        }

        // Teknisyen performansı
        [HttpGet("technicians")]
        public async Task<IActionResult> Teknisyenler()
        {
            var teknisyenler = await db.Users.Where(u => u.Role == "teknisyen").ToListAsync();
            var sonuc = new List<object>();

            foreach (var t in teknisyenler)
            {
                int acik = await db.JobCards.CountAsync(j => j.TechnicianId == t.Id
                    && j.Status != "tamamlandi" && j.Status != "teslim_edildi" && j.Status != "iptal");
                int biten = await db.JobCards.CountAsync(j => j.TechnicianId == t.Id
                    && (j.Status == "tamamlandi" || j.Status == "teslim_edildi"));
                decimal ciro = await db.JobCards.Where(j => j.TechnicianId == t.Id)
                                                .SumAsync(j => (decimal?)j.GrandTotal) ?? 0;

                sonuc.Add(new
                {
                    id = t.Id, full_name = t.FullName,
                    open_jobs = acik, completed_jobs = biten, total_revenue = ciro
                });
            }

            return Ok(sonuc);
        }

        // Teknisyen listesi (iş emri atama için)
        [HttpGet("technician-list")]
        public async Task<IActionResult> TeknisyenListesi()
        {
            var liste = await db.Users.Where(u => u.Role == "teknisyen" && u.IsActive)
                .Select(u => new { id = u.Id, full_name = u.FullName })
                .ToListAsync();
            return Ok(liste);
        }
    }
}
