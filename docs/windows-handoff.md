# Windows Devri — WinForms İskeletleri

macOS'ta WinForms projesi **oluşturulamaz**: Windows Desktop SDK yalnızca Windows'ta
bulunur. Bu yüzden 3 masaüstü uygulamasının iskeleti bir kez Windows makinesinde
üretilir ve depoya geri gönderilir.

> **Not:** Bu devir yalnızca **WinForms** için gereklidir.
> Projelerin ASP.NET Core API'leri (Proje 2 ve 5) Mac üzerinde geliştirilip
> çalıştırılabiliyor, onlar için Windows'a gerek yok.

## Oluşturulacak uygulamalar

| Proje | Uygulama | Hedef klasör |
|-------|----------|--------------|
| 1 — Çamaşırhane ERP | `CamasirhaneKasa` — kasa + barkod etiket | `01-camasirhane-erp/apps/desktop-winforms/` |
| 4 — Spor Salonu | `SporSalonuKasa` — kasa + turnike kontrol | `04-spor-salonu/apps/desktop-winforms/` |
| 5 — Araç Satış & Depo | `DepoYonetim` — merkez depo | `05-arac-satis-depo/apps/desktop-winforms/` |

## Adımlar

### 1. Windows makinesine .NET 8 SDK kur
https://dotnet.microsoft.com/download/dotnet/8.0 — "SDK" indir, kur.
Kontrol:
```powershell
dotnet --list-sdks     # 8.x satırı görünmeli
```

### 2. Depoyu klonla
```powershell
git clone <depo-adresi> summer2026-stages
cd summer2026-stages
```

### 3. Betiği çalıştır
```powershell
./tools/scaffold-winforms.ps1
```

PowerShell betik çalıştırmayı engellerse, bu oturum için izin ver:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Betik her uygulama için: klasörü oluşturur, `dotnet new winforms` çalıştırır,
bir `.sln` üretir ve derlemenin başarılı olduğunu doğrular.

### 4. Geri gönder
```powershell
git add .
git commit -m "WinForms iskeletleri oluşturuldu (Windows)"
git push
```

### 5. Mac tarafında
```bash
git pull
```

Bundan sonra C# kodu Mac'te yazılır. Derleme ve çalıştırma Windows'ta yapılır:
```powershell
cd 01-camasirhane-erp/apps/desktop-winforms
dotnet run --project CamasirhaneKasa
```

## Sonradan NuGet paketi eklenirse

Mac'te `.csproj` dosyasına `PackageReference` eklemek sorun değildir; paketler
Windows'ta ilk `dotnet build` sırasında otomatik indirilir. Yeni bir Windows
devrine gerek yoktur.
