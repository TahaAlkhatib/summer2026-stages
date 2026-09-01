using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtoServisApi.Data;
using OtoServisApi.Models;

namespace OtoServisApi.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly OtoServisContext db;

        public CustomersController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        // Müşteri listesi / arama (ad, telefon veya plaka ile)
        [HttpGet]
        public async Task<IActionResult> Listele(string q)
        {
            var sorgu = db.Customers.Include(m => m.Vehicles).AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                sorgu = sorgu.Where(m => m.FullName.Contains(q)
                                      || m.Phone.Contains(q)
                                      || m.Vehicles.Any(a => a.Plate.Contains(q)));
            }

            var liste = await sorgu.OrderBy(m => m.FullName).ToListAsync();

            return Ok(liste.Select(m => new
            {
                id = m.Id,
                full_name = m.FullName,
                phone = m.Phone,
                email = m.Email,
                address = m.Address,
                vehicle_count = m.Vehicles.Count,
                vehicles = m.Vehicles.Select(a => new
                {
                    id = a.Id, plate = a.Plate, brand = a.Brand,
                    model = a.Model, year = a.Year, mileage = a.Mileage
                })
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Getir(int id)
        {
            var musteri = await db.Customers.Include(m => m.Vehicles)
                                            .FirstOrDefaultAsync(m => m.Id == id);
            if (musteri == null)
            {
                return NotFound(new { message = "Müşteri bulunamadı." });
            }

            var isEmirleri = await db.JobCards
                .Where(j => j.CustomerId == id)
                .OrderByDescending(j => j.OpenedAt)
                .Select(j => new { id = j.Id, job_no = j.JobNo, status = j.Status,
                                   grand_total = j.GrandTotal, opened_at = j.OpenedAt })
                .ToListAsync();

            return Ok(new
            {
                id = musteri.Id,
                full_name = musteri.FullName,
                phone = musteri.Phone,
                email = musteri.Email,
                address = musteri.Address,
                vehicles = musteri.Vehicles.Select(a => new
                {
                    id = a.Id, plate = a.Plate, brand = a.Brand, model = a.Model,
                    year = a.Year, mileage = a.Mileage, color = a.Color, chassis_no = a.ChassisNo
                }),
                job_cards = isEmirleri
            });
        }

        [HttpPost]
        public async Task<IActionResult> Ekle(Customer musteri)
        {
            if (string.IsNullOrWhiteSpace(musteri.FullName) || string.IsNullOrWhiteSpace(musteri.Phone))
            {
                return BadRequest(new { message = "Ad soyad ve telefon zorunludur." });
            }

            db.Customers.Add(musteri);
            await db.SaveChangesAsync();
            return Ok(new { id = musteri.Id, full_name = musteri.FullName, phone = musteri.Phone });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Guncelle(int id, Customer gelen)
        {
            var musteri = await db.Customers.FindAsync(id);
            if (musteri == null)
            {
                return NotFound(new { message = "Müşteri bulunamadı." });
            }
            if (string.IsNullOrWhiteSpace(gelen.FullName) || string.IsNullOrWhiteSpace(gelen.Phone))
            {
                return BadRequest(new { message = "Ad soyad ve telefon zorunludur." });
            }

            musteri.FullName = gelen.FullName;
            musteri.Phone = gelen.Phone;
            musteri.Email = gelen.Email;
            musteri.Address = gelen.Address;
            await db.SaveChangesAsync();

            return Ok(new { id = musteri.Id, full_name = musteri.FullName });
        }
    }

    [ApiController]
    [Route("api/vehicles")]
    [Authorize]
    public class VehiclesController : ControllerBase
    {
        private readonly OtoServisContext db;

        public VehiclesController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        // Plaka ile araç arama — servise gelen araç plakadan bulunur
        [HttpGet]
        public async Task<IActionResult> Listele(string plaka)
        {
            var sorgu = db.Vehicles.Include(a => a.Customer).AsQueryable();

            if (!string.IsNullOrWhiteSpace(plaka))
            {
                sorgu = sorgu.Where(a => a.Plate.Contains(plaka));
            }

            var liste = await sorgu.OrderBy(a => a.Plate).ToListAsync();

            return Ok(liste.Select(a => new
            {
                id = a.Id, plate = a.Plate, brand = a.Brand, model = a.Model,
                year = a.Year, mileage = a.Mileage, color = a.Color,
                customer_id = a.CustomerId,
                customer_name = a.Customer.FullName,
                customer_phone = a.Customer.Phone
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Ekle(Vehicle arac)
        {
            if (string.IsNullOrWhiteSpace(arac.Plate))
            {
                return BadRequest(new { message = "Plaka zorunludur." });
            }
            if (arac.CustomerId == 0)
            {
                return BadRequest(new { message = "Araç bir müşteriye bağlanmalıdır." });
            }

            bool var = await db.Vehicles.AnyAsync(a => a.Plate == arac.Plate);
            if (var)
            {
                return BadRequest(new { message = "Bu plaka zaten kayıtlı." });
            }

            db.Vehicles.Add(arac);
            await db.SaveChangesAsync();
            return Ok(new { id = arac.Id, plate = arac.Plate });
        }
    }
}
