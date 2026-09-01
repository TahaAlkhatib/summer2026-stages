using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OtoServisApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Veritabanı
builder.Services.AddDbContext<OtoServisContext>(secenekler =>
    secenekler.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// JWT ile kimlik doğrulama
string anahtar = builder.Configuration["Jwt:Key"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(secenekler =>
    {
        secenekler.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(anahtar))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Dashboard ve tablet uygulamasının erişebilmesi için
builder.Services.AddCors(secenekler =>
{
    secenekler.AddDefaultPolicy(kural =>
        kural.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Veritabanını oluştur ve demo verisini yükle
using (var kapsam = app.Services.CreateScope())
{
    var db = kapsam.ServiceProvider.GetRequiredService<OtoServisContext>();
    db.Database.EnsureCreated();
    SeedData.Yukle(db);
}

app.UseCors();
// Yüklenen arıza fotoğraflarına erişim için
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { durum = "calisiyor" }));

app.Run();
