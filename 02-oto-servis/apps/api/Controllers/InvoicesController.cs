using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtoServisApi.Data;
using OtoServisApi.Models;

namespace OtoServisApi.Controllers
{
    public class FaturaIstegi
    {
        public int JobCardId { get; set; }
        public decimal TaxRate { get; set; } = 20;
    }

    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly OtoServisContext db;

        public InvoicesController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        [HttpGet]
        public async Task<IActionResult> Listele(string isPaid)
        {
            var sorgu = db.Invoices.Include(f => f.JobCard).ThenInclude(j => j.Vehicle)
                                   .Include(f => f.JobCard).ThenInclude(j => j.Customer)
                                   .AsQueryable();

            if (isPaid == "0")
            {
                sorgu = sorgu.Where(f => !f.IsPaid);
            }
            if (isPaid == "1")
            {
                sorgu = sorgu.Where(f => f.IsPaid);
            }

            var liste = await sorgu.OrderByDescending(f => f.IssueDate).ToListAsync();

            return Ok(liste.Select(f => new
            {
                id = f.Id, invoice_no = f.InvoiceNo,
                job_no = f.JobCard.JobNo, plate = f.JobCard.Vehicle.Plate,
                customer_name = f.JobCard.Customer.FullName,
                issue_date = f.IssueDate,
                labor_total = f.LaborTotal, parts_total = f.PartsTotal,
                tax_amount = f.TaxAmount, grand_total = f.GrandTotal,
                is_paid = f.IsPaid, paid_at = f.PaidAt
            }));
        }

        // Fatura detayı — yazdırma ekranı bunu kullanır
        [HttpGet("{id}")]
        public async Task<IActionResult> Getir(int id)
        {
            var fatura = await db.Invoices
                .Include(f => f.JobCard).ThenInclude(j => j.Vehicle)
                .Include(f => f.JobCard).ThenInclude(j => j.Customer)
                .Include(f => f.JobCard).ThenInclude(j => j.JobParts).ThenInclude(p => p.Part)
                .Include(f => f.JobCard).ThenInclude(j => j.LaborItems)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura bulunamadı." });
            }

            return Ok(new
            {
                id = fatura.Id,
                invoice_no = fatura.InvoiceNo,
                issue_date = fatura.IssueDate,
                labor_total = fatura.LaborTotal,
                parts_total = fatura.PartsTotal,
                tax_rate = fatura.TaxRate,
                tax_amount = fatura.TaxAmount,
                grand_total = fatura.GrandTotal,
                is_paid = fatura.IsPaid,
                paid_at = fatura.PaidAt,
                job_no = fatura.JobCard.JobNo,
                complaint_text = fatura.JobCard.ComplaintText,
                mileage = fatura.JobCard.Mileage,
                vehicle = new
                {
                    plate = fatura.JobCard.Vehicle.Plate,
                    brand = fatura.JobCard.Vehicle.Brand,
                    model = fatura.JobCard.Vehicle.Model,
                    year = fatura.JobCard.Vehicle.Year
                },
                customer = new
                {
                    full_name = fatura.JobCard.Customer.FullName,
                    phone = fatura.JobCard.Customer.Phone,
                    address = fatura.JobCard.Customer.Address
                },
                parts = fatura.JobCard.JobParts.Select(p => new
                {
                    code = p.Part.Code, name = p.Part.Name, quantity = p.Quantity,
                    unit_price = p.UnitPrice, line_total = p.LineTotal
                }),
                labor = fatura.JobCard.LaborItems.Select(l => new
                {
                    description = l.Description, hours = l.Hours,
                    hourly_rate = l.HourlyRate, line_total = l.LineTotal
                })
            });
        }

        // İş emrinden fatura kes
        [HttpPost]
        public async Task<IActionResult> Kes(FaturaIstegi istek)
        {
            var isEmri = await db.JobCards.FindAsync(istek.JobCardId);
            if (isEmri == null)
            {
                return NotFound(new { message = "İş emri bulunamadı." });
            }
            if (isEmri.Status != "tamamlandi" && isEmri.Status != "teslim_edildi")
            {
                return BadRequest(new { message = "Sadece tamamlanmış iş emirleri faturalandırılabilir." });
            }

            bool faturaVar = await db.Invoices.AnyAsync(f => f.JobCardId == istek.JobCardId);
            if (faturaVar)
            {
                return BadRequest(new { message = "Bu iş emri için fatura zaten kesilmiş." });
            }
            if (isEmri.GrandTotal <= 0)
            {
                return BadRequest(new { message = "Tutarı sıfır olan iş emri faturalandırılamaz." });
            }

            int yil = DateTime.Now.Year;
            int sayac = await db.Invoices.CountAsync(f => f.InvoiceNo.StartsWith("FT-" + yil)) + 1;

            decimal oran = istek.TaxRate > 0 ? istek.TaxRate : 20;
            decimal kdv = isEmri.GrandTotal * oran / 100;

            var fatura = new Invoice
            {
                InvoiceNo = "FT-" + yil + "-" + sayac.ToString("D5"),
                JobCardId = isEmri.Id,
                LaborTotal = isEmri.LaborTotal,
                PartsTotal = isEmri.PartsTotal,
                TaxRate = oran,
                TaxAmount = kdv,
                GrandTotal = isEmri.GrandTotal + kdv
            };
            db.Invoices.Add(fatura);
            await db.SaveChangesAsync();

            return Ok(new { id = fatura.Id, invoice_no = fatura.InvoiceNo, grand_total = fatura.GrandTotal });
        }

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> Odendi(int id)
        {
            var fatura = await db.Invoices.FindAsync(id);
            if (fatura == null)
            {
                return NotFound(new { message = "Fatura bulunamadı." });
            }
            if (fatura.IsPaid)
            {
                return BadRequest(new { message = "Bu fatura zaten ödenmiş." });
            }

            fatura.IsPaid = true;
            fatura.PaidAt = DateTime.Now;
            await db.SaveChangesAsync();

            return Ok(new { id = fatura.Id, is_paid = true, paid_at = fatura.PaidAt });
        }
    }
}
