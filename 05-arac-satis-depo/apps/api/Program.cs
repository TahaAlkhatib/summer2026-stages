using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VanSalesApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<VanSalesContext>(secenekler =>
    secenekler.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

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
builder.Services.AddCors(s => s.AddDefaultPolicy(k =>
    k.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var kapsam = app.Services.CreateScope())
{
    var db = kapsam.ServiceProvider.GetRequiredService<VanSalesContext>();
    db.Database.EnsureCreated();
    SeedData.Yukle(db);
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { durum = "calisiyor" }));

app.Run();
