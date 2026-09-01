# ============================================================================
#  Summer 2026 Stajyer Projeleri — WinForms Iskelet Olusturucu
#  ----------------------------------------------------------------------
#  Bu betik SADECE Windows makinesinde, BIR KERE calistirilir.
#  macOS'ta WinForms projesi olusturulamadigi icin 3 masaustu uygulamasinin
#  iskeleti burada uretilir, sonra depoya commit edilip Mac'e geri alinir.
#
#  Kullanim (PowerShell, depo kok klasorunde):
#      ./tools/scaffold-winforms.ps1
#
#  Gereksinim: .NET 8 SDK  ->  https://dotnet.microsoft.com/download/dotnet/8.0
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== WinForms iskeletleri olusturuluyor ===" -ForegroundColor Cyan
Write-Host ""

# --- .NET SDK kontrolu ------------------------------------------------------
try {
    $sdks = dotnet --list-sdks
} catch {
    Write-Host "HATA: 'dotnet' bulunamadi. .NET 8 SDK kurun." -ForegroundColor Red
    exit 1
}

if (-not ($sdks | Select-String -Pattern "^8\.")) {
    Write-Host "HATA: .NET 8 SDK bulunamadi. Kurulu SDK'lar:" -ForegroundColor Red
    Write-Host $sdks
    Write-Host "Indir: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] .NET 8 SDK bulundu." -ForegroundColor Green

# --- Depo kok klasoru kontrolu ---------------------------------------------
if (-not (Test-Path "plan.md")) {
    Write-Host "HATA: Bu betigi deponun KOK klasorunde calistirin." -ForegroundColor Red
    exit 1
}

# --- Olusturulacak projeler -------------------------------------------------
$projects = @(
    @{
        Path = "01-camasirhane-erp/apps/desktop-winforms"
        Name = "CamasirhaneKasa"
        Desc = "Camasirhane ERP - Kasa ve barkod etiket uygulamasi"
    },
    @{
        Path = "04-spor-salonu/apps/desktop-winforms"
        Name = "SporSalonuKasa"
        Desc = "Spor Salonu - Kasa ve turnike kontrol uygulamasi"
    },
    @{
        Path = "05-arac-satis-depo/apps/desktop-winforms"
        Name = "DepoYonetim"
        Desc = "Arac Ustu Satis - Merkez depo yonetim uygulamasi"
    }
)

foreach ($p in $projects) {
    $dir  = $p.Path
    $name = $p.Name

    Write-Host ""
    Write-Host "--- $name ($($p.Desc))" -ForegroundColor Cyan

    if (Test-Path "$dir/$name/$name.csproj") {
        Write-Host "[ATLA] Zaten mevcut: $dir/$name" -ForegroundColor Yellow
        continue
    }

    New-Item -ItemType Directory -Force -Path $dir | Out-Null

    Push-Location $dir
    try {
        dotnet new winforms -n $name -f net8.0 | Out-Null
        Write-Host "[OK] WinForms projesi olusturuldu." -ForegroundColor Green

        dotnet new sln -n $name | Out-Null
        dotnet sln "$name.sln" add "$name/$name.csproj" | Out-Null
        Write-Host "[OK] Solution olusturuldu: $name.sln" -ForegroundColor Green

        dotnet build "$name.sln" -c Debug --nologo -v quiet | Out-Null
        Write-Host "[OK] Derleme basarili." -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "=== Tamamlandi ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Simdi sunlari calistirin:" -ForegroundColor Yellow
Write-Host "    git add ."
Write-Host "    git commit -m `"WinForms iskeletleri olusturuldu (Windows)`""
Write-Host "    git push"
Write-Host ""
