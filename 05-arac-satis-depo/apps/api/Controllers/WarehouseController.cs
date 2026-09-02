using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VanSalesApi.Data;
using VanSalesApi.Models;

namespace VanSalesApi.Controllers
{
    public class YuklemeKalemi
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class YuklemeIstegi
    {
        public int VanId { get; set; }
        public string Notes { get; set; }
        public List<YuklemeKalemi> Items { get; set; }
    }

    public class StokGirisi
    {
        public int Quantity { get; set; }
    }

    [ApiController]
    [Route("api/warehouse")]
    [Authorize]
    public class WarehouseController : ControllerBase
    {
        private readonly VanSalesContext db;

        public WarehouseController(VanSalesContext veritabani)
        {
            db = veritabani;
        }

        // Merkez depo stoğu
        [HttpGet("products")]
        public async Task<IActionResult> Urunler(string q, string lowStock)
        {
            var sorgu = db.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                sorgu = sorgu.Where(u => u.Name.Contains(q) || u.Code.Contains(q));
            }
            if (lowStock == "1")
            {
                sorgu = sorgu.Where(u => u.WarehouseStock <= u.MinStock);
            }

            var liste = await sorgu.OrderBy(u => u.Name).ToListAsync();

            return Ok(liste.Select(u => new
            {
                id = u.Id, code = u.Code, name = u.Name, unit = u.Unit,
                price = u.Price, vat_rate = u.VatRate,
                warehouse_stock = u.WarehouseStock, min_stock = u.MinStock,
                is_low = u.WarehouseStock <= u.MinStock,
                is_active = u.IsActive
            }));
        }

        [HttpPost("products")]
        public async Task<IActionResult> UrunEkle(Product urun)
        {
            if (User.FindFirstValue(ClaimTypes.Role) != "admin")
            {
                return BadRequest(new { message = "Bu işlem için yetkiniz yok." });
            }
            if (string.IsNullOrWhiteSpace(urun.Code) || string.IsNullOrWhiteSpace(urun.Name))
            {
                return BadRequest(new { message = "Ürün kodu ve adı zorunludur." });
            }
            if (urun.Price <= 0)
            {
                return BadRequest(new { message = "Fiyat sıfırdan büyük olmalıdır." });
            }
            if (await db.Products.AnyAsync(u => u.Code == urun.Code))
            {
                return BadRequest(new { message = "Bu ürün kodu zaten kayıtlı." });
            }

            db.Products.Add(urun);
            await db.SaveChangesAsync();
            return Ok(new { id = urun.Id, code = urun.Code, name = urun.Name });
        }

        // Depoya mal girişi
        [HttpPost("products/{id}/stock-in")]
        public async Task<IActionResult> StokGirisi(int id, StokGirisi istek)
        {
            var urun = await db.Products.FindAsync(id);
            if (urun == null)
            {
                return NotFound(new { message = "Ürün bulunamadı." });
            }
            if (istek.Quantity <= 0)
            {
                return BadRequest(new { message = "Giriş miktarı sıfırdan büyük olmalıdır." });
            }

            urun.WarehouseStock += istek.Quantity;
            await db.SaveChangesAsync();
            return Ok(new { id = urun.Id, warehouse_stock = urun.WarehouseStock });
        }

        // Araç listesi ve araç üstü stok
        [HttpGet("vans")]
        public async Task<IActionResult> Araclar()
        {
            var araclar = await db.Vans.Include(a => a.Driver).Where(a => a.IsActive).ToListAsync();
            var sonuc = new List<object>();

            foreach (var a in araclar)
            {
                var stok = await db.VanStocks.Include(s => s.Product)
                    .Where(s => s.VanId == a.Id && s.Quantity > 0)
                    .Select(s => new
                    {
                        product_id = s.ProductId, code = s.Product.Code,
                        name = s.Product.Name, quantity = s.Quantity
                    }).ToListAsync();

                var sonKonum = await db.VanLocations
                    .Where(k => k.VanId == a.Id)
                    .OrderByDescending(k => k.RecordedAt)
                    .FirstOrDefaultAsync();

                sonuc.Add(new
                {
                    id = a.Id, plate = a.Plate, brand = a.Brand, model = a.Model,
                    driver_name = a.Driver != null ? a.Driver.FullName : null,
                    stock = stok,
                    last_location = sonKonum == null ? null : new
                    {
                        latitude = sonKonum.Latitude,
                        longitude = sonKonum.Longitude,
                        recorded_at = sonKonum.RecordedAt
                    }
                });
            }

            return Ok(sonuc);
        }

        // Depodan araca yükleme
        [HttpPost("load-orders")]
        public async Task<IActionResult> AracaYukle(YuklemeIstegi istek)
        {
            var arac = await db.Vans.FindAsync(istek.VanId);
            if (arac == null)
            {
                return BadRequest(new { message = "Araç bulunamadı." });
            }
            if (istek.Items == null || istek.Items.Count == 0)
            {
                return BadRequest(new { message = "Yüklemeye en az bir ürün eklenmelidir." });
            }

            // Önce tüm kalemler için depo stoğu yeterli mi kontrol et
            foreach (var k in istek.Items)
            {
                var urun = await db.Products.FindAsync(k.ProductId);
                if (urun == null)
                {
                    return BadRequest(new { message = "Seçilen ürün bulunamadı." });
                }
                if (k.Quantity <= 0)
                {
                    return BadRequest(new { message = "Miktar sıfırdan büyük olmalıdır." });
                }
                if (urun.WarehouseStock < k.Quantity)
                {
                    return BadRequest(new
                    {
                        message = urun.Name + " için depo stoğu yetersiz. Depoda " +
                                  urun.WarehouseStock + " " + urun.Unit + " var."
                    });
                }
            }

            int yil = DateTime.Now.Year;
            int sayac = await db.LoadOrders.CountAsync(y => y.LoadNo.StartsWith("YK-" + yil)) + 1;

            var yukleme = new LoadOrder
            {
                LoadNo = "YK-" + yil + "-" + sayac.ToString("D5"),
                VanId = arac.Id,
                CreatedById = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)),
                Notes = istek.Notes,
                Items = new List<LoadOrderItem>()
            };

            foreach (var k in istek.Items)
            {
                var urun = await db.Products.FindAsync(k.ProductId);

                yukleme.Items.Add(new LoadOrderItem
                {
                    ProductId = urun.Id,
                    Quantity = k.Quantity
                });

                // Depodan düş
                urun.WarehouseStock -= k.Quantity;

                // Araç stoğuna ekle
                var aracStok = await db.VanStocks
                    .FirstOrDefaultAsync(s => s.VanId == arac.Id && s.ProductId == urun.Id);
                if (aracStok == null)
                {
                    db.VanStocks.Add(new VanStock
                    {
                        VanId = arac.Id, ProductId = urun.Id, Quantity = k.Quantity
                    });
                }
                else
                {
                    aracStok.Quantity += k.Quantity;
                    aracStok.UpdatedAt = DateTime.Now;
                }
            }

            db.LoadOrders.Add(yukleme);
            await db.SaveChangesAsync();

            return Ok(new { id = yukleme.Id, load_no = yukleme.LoadNo, van_plate = arac.Plate });
        }

        [HttpGet("load-orders")]
        public async Task<IActionResult> Yuklemeler()
        {
            var liste = await db.LoadOrders
                .Include(y => y.Van)
                .Include(y => y.Items).ThenInclude(k => k.Product)
                .OrderByDescending(y => y.LoadDate)
                .Take(50)
                .ToListAsync();

            return Ok(liste.Select(y => new
            {
                id = y.Id, load_no = y.LoadNo, van_plate = y.Van.Plate,
                load_date = y.LoadDate, notes = y.Notes,
                item_count = y.Items.Count,
                items = y.Items.Select(k => new
                {
                    name = k.Product.Name, code = k.Product.Code, quantity = k.Quantity
                })
            }));
        }
    }
}
