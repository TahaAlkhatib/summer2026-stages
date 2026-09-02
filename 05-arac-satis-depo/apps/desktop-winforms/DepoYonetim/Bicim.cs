using System.Globalization;

namespace DepoYonetim
{
    // Ekranda gösterilen değerlerin Türkçe biçimlendirilmesi
    public static class Bicim
    {
        public static readonly CultureInfo TR = new CultureInfo("tr-TR");

        // Uygulama renkleri — mobil uygulama ile aynı olsun diye seçildi
        public static readonly Color Ana = Color.FromArgb(29, 78, 137);
        public static readonly Color Vurgu = Color.FromArgb(247, 127, 0);
        public static readonly Color Zemin = Color.FromArgb(242, 245, 248);
        public static readonly Color Yesil = Color.FromArgb(21, 128, 61);
        public static readonly Color Kirmizi = Color.FromArgb(185, 28, 28);
        public static readonly Color Turuncu = Color.FromArgb(180, 83, 9);
        public static readonly Color Soluk = Color.FromArgb(107, 122, 140);

        public static string Para(decimal tutar)
        {
            return tutar.ToString("N2", TR) + " ₺";
        }

        public static string Tarih(string isoTarih)
        {
            if (string.IsNullOrEmpty(isoTarih)) return "-";
            DateTime d;
            if (DateTime.TryParse(isoTarih, CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
            {
                return d.ToString("dd.MM.yyyy");
            }
            return "-";
        }

        public static string TarihSaat(string isoTarih)
        {
            if (string.IsNullOrEmpty(isoTarih)) return "-";
            DateTime d;
            if (DateTime.TryParse(isoTarih, CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
            {
                return d.ToString("dd.MM.yyyy HH:mm");
            }
            return "-";
        }

        public static string OdemeTipi(string kod)
        {
            if (kod == "nakit") return "Nakit";
            if (kod == "vadeli") return "Vadeli";
            return kod;
        }

        public static string TahsilatYontemi(string kod)
        {
            if (kod == "nakit") return "Nakit";
            if (kod == "kredi_karti") return "Kredi Kartı";
            if (kod == "havale") return "Havale / EFT";
            return kod;
        }

        // Sunucuya gönderilecek tarih (yerel gün, UTC değil)
        public static string ApiTarih(DateTime d)
        {
            return d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
    }
}
