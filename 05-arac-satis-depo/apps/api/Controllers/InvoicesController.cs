using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanSalesApi.Data;

namespace VanSalesApi.Controllers
{
    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly VanSalesContext db;

        public InvoicesController(VanSalesContext veritabani)
        {
            db = veritabani;
        }

        [HttpGet]
        public async Task<IActionResult> Listele(string paymentType, int? vanId, DateTime? date, string unpaid)
        {
            var sorgu = db.Invoices.Include(f => f.Customer).Include(f => f.Van).AsQueryable();

            if (!string.IsNullOrWhiteSpace(paymentType))
            {
                sorgu = sorgu.Where(f => f.PaymentType == paymentType);
            }
            if (vanId.HasValue && vanId.Value > 0)
            {
                sorgu = sorgu.Where(f => f.VanId == vanId.Value);
            }
            if (date.HasValue)
            {
                var gun = date.Value.Date;
                sorgu = sorgu.Where(f => f.IssuedAt >= gun && f.IssuedAt < gun.AddDays(1));
            }
            if (unpaid == "1")
            {
                sorgu = sorgu.Where(f => f.PaidAmount < f.GrandTotal);
            }

            var liste = await sorgu.OrderByDescending(f => f.IssuedAt).Take(200).ToListAsync();

            return Ok(liste.Select(f => new
            {
                id = f.Id, invoice_no = f.InvoiceNo, offline_id = f.OfflineId,
                customer_name = f.Customer.Name, van_plate = f.Van.Plate,
                payment_type = f.PaymentType,
                sub_total = f.SubTotal, vat_total = f.VatTotal, grand_total = f.GrandTotal,
                paid_amount = f.PaidAmount, remaining = f.GrandTotal - f.PaidAmount,
                issued_at = f.IssuedAt, synced_at = f.SyncedAt,
                latitude = f.Latitude, longitude = f.Longitude
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Getir(int id)
        {
            var fatura = await db.Invoices
                .Include(f => f.Customer)
                .Include(f => f.Van)
                .Include(f => f.Items).ThenInclude(k => k.Product)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (fatura == null)
            {
                return NotFound(new { message = "Fatura bulunamadı." });
            }

            var tahsilatlar = await db.Collections
                .Where(t => t.InvoiceId == id)
                .OrderBy(t => t.CollectedAt)
                .Select(t => new
                {
                    id = t.Id, amount = t.Amount, method = t.Method,
                    collected_at = t.CollectedAt, synced_at = t.SyncedAt
                }).ToListAsync();

            var temsilci = await db.Users.FindAsync(fatura.SalesRepId);

            return Ok(new
            {
                id = fatura.Id,
                invoice_no = fatura.InvoiceNo,
                offline_id = fatura.OfflineId,
                payment_type = fatura.PaymentType,
                sub_total = fatura.SubTotal,
                vat_total = fatura.VatTotal,
                grand_total = fatura.GrandTotal,
                paid_amount = fatura.PaidAmount,
                remaining = fatura.GrandTotal - fatura.PaidAmount,
                issued_at = fatura.IssuedAt,
                synced_at = fatura.SyncedAt,
                latitude = fatura.Latitude,
                longitude = fatura.Longitude,
                notes = fatura.Notes,
                sales_rep_name = temsilci != null ? temsilci.FullName : null,
                van = new { plate = fatura.Van.Plate },
                customer = new
                {
                    id = fatura.Customer.Id, name = fatura.Customer.Name,
                    contact_name = fatura.Customer.ContactName, phone = fatura.Customer.Phone,
                    address = fatura.Customer.Address, district = fatura.Customer.District,
                    tax_number = fatura.Customer.TaxNumber
                },
                items = fatura.Items.Select(k => new
                {
                    code = k.Product.Code, name = k.ProductName,
                    quantity = k.Quantity, unit_price = k.UnitPrice,
                    vat_rate = k.VatRate, line_total = k.LineTotal
                }),
                collections = tahsilatlar
            });
        }
    }

    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly VanSalesContext db;

        public CustomersController(VanSalesContext veritabani)
        {
            db = veritabani;
        }

        [HttpGet]
        public async Task<IActionResult> Listele(string q)
        {
            var sorgu = db.Customers.Where(m => m.IsActive);

            if (!string.IsNullOrWhiteSpace(q))
            {
                sorgu = sorgu.Where(m => m.Name.Contains(q) || m.Phone.Contains(q)
                                      || m.District.Contains(q));
            }

            var liste = await sorgu.OrderBy(m => m.Name).ToListAsync();
            var sonuc = new List<object>();

            foreach (var m in liste)
            {
                decimal borc = await db.Invoices
                    .Where(f => f.CustomerId == m.Id && f.PaidAmount < f.GrandTotal)
                    .SumAsync(f => (decimal?)(f.GrandTotal - f.PaidAmount)) ?? 0;

                sonuc.Add(new
                {
                    id = m.Id, name = m.Name, contact_name = m.ContactName,
                    phone = m.Phone, address = m.Address, district = m.District,
                    tax_number = m.TaxNumber, credit_limit = m.CreditLimit,
                    current_debt = borc,
                    over_limit = m.CreditLimit > 0 && borc > m.CreditLimit
                });
            }

            return Ok(sonuc);
        }
    }
}
