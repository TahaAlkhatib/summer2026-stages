using System.Globalization;

namespace CamasirhaneKasa
{
    // Ekranda gösterilen değerlerin Türkçe biçimlendirilmesi
    public static class Bicim
    {
        public static readonly CultureInfo TR = new CultureInfo("tr-TR");

        public static readonly Dictionary<string, string> DurumEtiketleri = new Dictionary<string, string>
        {
            { "alindi", "Teslim Alındı" },
            { "yikamada", "Yıkamada" },
            { "utude", "Ütüde" },
            { "hazir", "Hazır" },
            { "teslim_edildi", "Teslim Edildi" },
            { "iptal", "İptal" },
        };

        public static readonly Dictionary<string, string> RolEtiketleri = new Dictionary<string, string>
        {
            { "admin", "Yönetici" },
            { "kasiyer", "Kasiyer" },
            { "kurye", "Kurye" },
        };

        public static string Rol(string kod)
        {
            if (kod != null && RolEtiketleri.ContainsKey(kod))
            {
                return RolEtiketleri[kod];
            }
            return kod;
        }

        public static string Durum(string kod)
        {
            if (kod != null && DurumEtiketleri.ContainsKey(kod))
            {
                return DurumEtiketleri[kod];
            }
            return kod;
        }

        public static string Para(decimal tutar)
        {
            return tutar.ToString("N2", TR) + " ₺";
        }

        public static string Tarih(string isoTarih)
        {
            DateTime d;
            if (DateTime.TryParse(isoTarih, CultureInfo.InvariantCulture, DateTimeStyles.None, out d))
            {
                return d.ToString("dd.MM.yyyy");
            }
            return "-";
        }

        public static string TarihSaat(string isoTarih)
        {
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
