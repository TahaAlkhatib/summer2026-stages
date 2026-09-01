using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtoServisApi.Data;
using OtoServisApi.Models;

namespace OtoServisApi.Controllers
{
    public class StokIstegi
    {
        public int Quantity { get; set; }
    }

    [ApiController]
    [Route("api/parts")]
    [Authorize]
    public class PartsController : ControllerBase
    {
        private readonly OtoServisContext db;

        public PartsController(OtoServisContext veritabani)
        {
            db = veritabani;
        }

        // Parça listesi. lowStock=1 ise sadece kritik stoktakiler gelir.
        [HttpGet]
        public async Task<IActionResult> Listele(string q, string lowStock)
        {
            var sorgu = db.Parts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                sorgu = sorgu.Where(p => p.Name.Contains(q) || p.Code.Contains(q) || p.Brand.Contains(q));
            }
            if (lowStock == "1")
            {
                sorgu = sorgu.Where(p => p.StockQuantity <= p.MinStock);
            }

            var liste = await sorgu.OrderBy(p => p.Name).ToListAsync();

            return Ok(liste.Select(p => new
            {
                id = p.Id, code = p.Code, name = p.Name, brand = p.Brand,
                unit = p.Unit, price = p.Price,
                stock_quantity = p.StockQuantity, min_stock = p.MinStock,
                is_low = p.StockQuantity <= p.MinStock
            }));
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Ekle(Part parca)
        {
            if (string.IsNullOrWhiteSpace(parca.Code) || string.IsNullOrWhiteSpace(parca.Name))
            {
                return BadRequest(new { message = "Parça kodu ve adı zorunludur." });
            }
            if (parca.Price <= 0)
            {
                return BadRequest(new { message = "Fiyat sıfırdan büyük olmalıdır." });
            }
            bool var = await db.Parts.AnyAsync(p => p.Code == parca.Code);
            if (var)
            {
                return BadRequest(new { message = "Bu parça kodu zaten kayıtlı." });
            }

            db.Parts.Add(parca);
            await db.SaveChangesAsync();
            return Ok(new { id = parca.Id, code = parca.Code, name = parca.Name });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Guncelle(int id, Part gelen)
        {
            var parca = await db.Parts.FindAsync(id);
            if (parca == null)
            {
                return NotFound(new { message = "Parça bulunamadı." });
            }
            if (gelen.Price <= 0)
            {
                return BadRequest(new { message = "Fiyat sıfırdan büyük olmalıdır." });
            }

            parca.Name = gelen.Name;
            parca.Brand = gelen.Brand;
            parca.Unit = gelen.Unit;
            parca.Price = gelen.Price;
            parca.MinStock = gelen.MinStock;
            await db.SaveChangesAsync();

            return Ok(new { id = parca.Id, name = parca.Name, price = parca.Price });
        }

        // Depoya mal girişi
        [HttpPost("{id}/stock-in")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> StokGirisi(int id, StokIstegi istek)
        {
            var parca = await db.Parts.FindAsync(id);
            if (parca == null)
            {
                return NotFound(new { message = "Parça bulunamadı." });
            }
            if (istek.Quantity <= 0)
            {
                return BadRequest(new { message = "Giriş miktarı sıfırdan büyük olmalıdır." });
            }

            parca.StockQuantity += istek.Quantity;
            await db.SaveChangesAsync();

            return Ok(new { id = parca.Id, stock_quantity = parca.StockQuantity });
        }
    }
}
