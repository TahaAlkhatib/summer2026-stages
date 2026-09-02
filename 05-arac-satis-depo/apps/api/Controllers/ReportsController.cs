using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanSalesApi.Data;

namespace VanSalesApi.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly VanSalesContext db;

        public ReportsController(VanSalesContext veritabani)
        {
            db = veritabani;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> Ozet()
        {
            var bugun = DateTime.Now.Date;
            var ayBasi = new DateTime(bugun.Year, bugun.Month, 1);

            int bugunFatura = await db.Invoices.CountAsync(f => f.IssuedAt >= bugun && f.IssuedAt < bugun.AddDays(1));
            decimal bugunCiro = await db.Invoices
                .Where(f => f.IssuedAt >= bugun && f.IssuedAt < bugun.AddDays(1))
                .SumAsync(f => (decimal?)f.GrandTotal) ?? 0;
            decimal ayCiro = await db.Invoices.Where(f => f.IssuedAt >= ayBasi)
                .SumAsync(f => (decimal?)f.GrandTotal) ?? 0;
            decimal acikBakiye = await db.Invoices.Where(f => f.PaidAmount < f.GrandTotal)
                .SumAsync(f => (decimal?)(f.GrandTotal - f.PaidAmount)) ?? 0;
            int kritikStok = await db.Products.CountAsync(u => u.WarehouseStock <= u.MinStock);
            int aracSayisi = await db.Vans.CountAsync(a => a.IsActive);

            // Araç bazında bugünkü satış
            var araclar = await db.Vans.Include(a => a.Driver).Where(a => a.IsActive).ToListAsync();
            var aracPerformansi = new List<object>();
            foreach (var a in araclar)
            {
                decimal ciro = await db.Invoices
                    .Where(f => f.VanId == a.Id && f.IssuedAt >= bugun && f.IssuedAt < bugun.AddDays(1))
                    .SumAsync(f => (decimal?)f.GrandTotal) ?? 0;
                int adet = await db.Invoices
                    .CountAsync(f => f.VanId == a.Id && f.IssuedAt >= bugun && f.IssuedAt < bugun.AddDays(1));

                aracPerformansi.Add(new
                {
                    van_id = a.Id, plate = a.Plate,
                    driver_name = a.Driver != null ? a.Driver.FullName : null,
                    today_invoices = adet, today_revenue = ciro
                });
            }

            // En çok satan ürünler
            var enCokSatan = await db.InvoiceItems
                .GroupBy(k => k.ProductName)
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
                today_invoice_count = bugunFatura,
                today_revenue = bugunCiro,
                month_revenue = ayCiro,
                open_balance = acikBakiye,
                low_stock_count = kritikStok,
                van_count = aracSayisi,
                van_performance = aracPerformansi,
                top_products = enCokSatan
            });
        }

        // Bir aracın gün içindeki GPS rotası
        [HttpGet("van-route")]
        public async Task<IActionResult> AracRotasi(int vanId, DateTime? date)
        {
            var gun = (date ?? DateTime.Now).Date;

            var konumlar = await db.VanLocations
                .Where(k => k.VanId == vanId && k.RecordedAt >= gun && k.RecordedAt < gun.AddDays(1))
                .OrderBy(k => k.RecordedAt)
                .Select(k => new
                {
                    latitude = k.Latitude, longitude = k.Longitude,
                    speed_kmh = k.SpeedKmh, recorded_at = k.RecordedAt
                })
                .ToListAsync();

            // O gün kesilen faturaların konumları (rotadaki duraklar)
            var duraklar = await db.Invoices
                .Include(f => f.Customer)
                .Where(f => f.VanId == vanId && f.IssuedAt >= gun && f.IssuedAt < gun.AddDays(1)
                            && f.Latitude != null)
                .OrderBy(f => f.IssuedAt)
                .Select(f => new
                {
                    invoice_no = f.InvoiceNo, customer_name = f.Customer.Name,
                    latitude = f.Latitude, longitude = f.Longitude,
                    grand_total = f.GrandTotal, issued_at = f.IssuedAt
                })
                .ToListAsync();

            return Ok(new
            {
                van_id = vanId,
                date = gun.ToString("yyyy-MM-dd"),
                points = konumlar,
                stops = duraklar
            });
        }

        // Gün sonu raporu
        [HttpGet("daily")]
        public async Task<IActionResult> Gunluk(DateTime? date)
        {
            var gun = (date ?? DateTime.Now).Date;
            var ertesi = gun.AddDays(1);

            var faturalar = await db.Invoices
                .Include(f => f.Customer).Include(f => f.Van)
                .Where(f => f.IssuedAt >= gun && f.IssuedAt < ertesi)
                .OrderBy(f => f.IssuedAt)
                .ToListAsync();

            decimal nakitToplam = faturalar.Where(f => f.PaymentType == "nakit").Sum(f => f.GrandTotal);
            decimal vadeliToplam = faturalar.Where(f => f.PaymentType == "vadeli").Sum(f => f.GrandTotal);

            decimal tahsilat = await db.Collections
                .Where(t => t.CollectedAt >= gun && t.CollectedAt < ertesi)
                .SumAsync(t => (decimal?)t.Amount) ?? 0;

            return Ok(new
            {
                date = gun.ToString("yyyy-MM-dd"),
                invoice_count = faturalar.Count,
                cash_total = nakitToplam,
                credit_total = vadeliToplam,
                grand_total = nakitToplam + vadeliToplam,
                collected = tahsilat,
                invoices = faturalar.Select(f => new
                {
                    invoice_no = f.InvoiceNo, customer_name = f.Customer.Name,
                    van_plate = f.Van.Plate, payment_type = f.PaymentType,
                    grand_total = f.GrandTotal, paid_amount = f.PaidAmount,
                    issued_at = f.IssuedAt
                })
            });
        }
    }
}
