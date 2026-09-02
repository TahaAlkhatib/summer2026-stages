using System.Globalization;

namespace SporSalonuKasa
{
    // Ekranda gösterilen değerlerin Türkçe biçimlendirilmesi
    public static class Bicim
    {
        public static readonly CultureInfo TR = new CultureInfo("tr-TR");

        public static readonly Dictionary<string, string> RolEtiketleri = new Dictionary<string, string>
        {
            { "admin", "Yönetici" },
            { "kasiyer", "Kasiyer" },
            { "antrenor", "Antrenör" },
        };

        public static string Rol(string kod)
        {
            if (kod != null && RolEtiketleri.ContainsKey(kod))
            {
                return RolEtiketleri[kod];
            }
            return kod;
        }

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

        // Sunucuya gönderilecek tarih (yerel gün, UTC değil)
        public static string ApiTarih(DateTime d)
        {
            return d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
    }
}
