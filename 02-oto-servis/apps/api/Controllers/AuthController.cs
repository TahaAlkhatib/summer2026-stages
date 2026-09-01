using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OtoServisApi.Data;

namespace OtoServisApi.Controllers
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
        private readonly OtoServisContext db;
        private readonly IConfiguration ayarlar;

        public AuthController(OtoServisContext veritabani, IConfiguration konfigurasyon)
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

            var haklar = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
                new Claim(ClaimTypes.Name, kullanici.Username),
                new Claim(ClaimTypes.Role, kullanici.Role),
                new Claim("full_name", kullanici.FullName)
            };

            var anahtar = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ayarlar["Jwt:Key"]));
            var token = new JwtSecurityToken(
                issuer: ayarlar["Jwt:Issuer"],
                claims: haklar,
                expires: DateTime.Now.AddHours(12),
                signingCredentials: new SigningCredentials(anahtar, SecurityAlgorithms.HmacSha256));

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                user = new
                {
                    id = kullanici.Id,
                    full_name = kullanici.FullName,
                    username = kullanici.Username,
                    role = kullanici.Role
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
                full_name = User.FindFirstValue("full_name")
            });
        }
    }
}
