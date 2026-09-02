using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VanSalesApi.Data;

namespace VanSalesApi.Controllers
{
    public class GirisIstegi
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly VanSalesContext db;
        private readonly IConfiguration ayarlar;

        public AuthController(VanSalesContext veritabani, IConfiguration konfigurasyon)
        {
            db = veritabani;
            ayarlar = konfigurasyon;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(GirisIstegi istek)
        {
            if (string.IsNullOrWhiteSpace(istek.Username) || string.IsNullOrWhiteSpace(istek.Password))
            {
                return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });
            }

            var kullanici = await db.Users
                .FirstOrDefaultAsync(u => u.Username == istek.Username && u.IsActive);

            if (kullanici == null || !BCrypt.Net.BCrypt.Verify(istek.Password, kullanici.PasswordHash))
            {
                return Unauthorized(new { message = "Kullanıcı adı veya şifre hatalı." });
            }

            // Satış temsilcisiyse hangi araca bağlı olduğunu da token'a koy
            var arac = await db.Vans.FirstOrDefaultAsync(a => a.DriverId == kullanici.Id && a.IsActive);

            var haklar = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
                new Claim(ClaimTypes.Name, kullanici.Username),
                new Claim(ClaimTypes.Role, kullanici.Role),
                new Claim("full_name", kullanici.FullName),
                new Claim("van_id", arac != null ? arac.Id.ToString() : "0")
            };

            var imzaAnahtari = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ayarlar["Jwt:Key"]));
            var token = new JwtSecurityToken(
                issuer: ayarlar["Jwt:Issuer"],
                claims: haklar,
                // Saha personeli günlerce çevrimdışı kalabildiği için uzun süreli token
                expires: DateTime.Now.AddDays(30),
                signingCredentials: new SigningCredentials(imzaAnahtari, SecurityAlgorithms.HmacSha256));

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                user = new
                {
                    id = kullanici.Id,
                    full_name = kullanici.FullName,
                    username = kullanici.Username,
                    role = kullanici.Role,
                    van_id = arac != null ? arac.Id : 0,
                    van_plate = arac != null ? arac.Plate : null
                }
            });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            return Ok(new
            {
                id = User.FindFirstValue(ClaimTypes.NameIdentifier),
                username = User.FindFirstValue(ClaimTypes.Name),
                role = User.FindFirstValue(ClaimTypes.Role),
                full_name = User.FindFirstValue("full_name"),
                van_id = User.FindFirstValue("van_id")
            });
        }
    }
}
