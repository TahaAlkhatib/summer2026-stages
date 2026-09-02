using System.Globalization;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

namespace SporSalonuKasa
{
    // API'den donen Turkce hata mesajini tasir
    public class ApiException : Exception
    {
        public ApiException(string mesaj) : base(mesaj) { }
    }

    public static class ApiClient
    {
        // Sunucu baska bir bilgisayardaysa burayi degistirin
        public static string BaseUrl = "http://localhost:3104/api";

        public static string Token = "";
        public static int UserId;
        public static string UserName = "";
        public static string Role = "";

        private static readonly HttpClient http = new HttpClient();

        private static void TokenEkle()
        {
            http.DefaultRequestHeaders.Remove("Authorization");
            if (!string.IsNullOrEmpty(Token))
            {
                http.DefaultRequestHeaders.Add("Authorization", "Bearer " + Token);
            }
        }

        private static async Task<JsonElement> YanitiOku(HttpResponseMessage yanit)
        {
            string metin = await yanit.Content.ReadAsStringAsync();

            JsonElement govde;
            try
            {
                // Clone() sart: JsonDocument atildiktan sonra RootElement gecersiz olur
                govde = JsonDocument.Parse(metin).RootElement.Clone();
            }
            catch (JsonException)
            {
                throw new ApiException("Sunucudan beklenmeyen bir cevap geldi.");
            }

            if (!yanit.IsSuccessStatusCode)
            {
                string mesaj = "Sunucu hatasi olustu.";
                if (govde.ValueKind == JsonValueKind.Object &&
                    govde.TryGetProperty("message", out JsonElement m) &&
                    m.ValueKind == JsonValueKind.String)
                {
                    mesaj = m.GetString();
                }
                throw new ApiException(mesaj);
            }

            return govde;
        }

        public static async Task<JsonElement> GetAsync(string yol)
        {
            TokenEkle();
            try
            {
                HttpResponseMessage yanit = await http.GetAsync(BaseUrl + yol);
                return await YanitiOku(yanit);
            }
            catch (HttpRequestException)
            {
                throw new ApiException("Sunucuya baglanilamadi. API calisiyor mu?");
            }
        }

        public static async Task<JsonElement> PostAsync(string yol, object govde)
        {
            TokenEkle();
            try
            {
                HttpResponseMessage yanit = await http.PostAsJsonAsync(BaseUrl + yol, govde);
                return await YanitiOku(yanit);
            }
            catch (HttpRequestException)
            {
                throw new ApiException("Sunucuya baglanilamadi. API calisiyor mu?");
            }
        }

        public static async Task<JsonElement> PutAsync(string yol, object govde)
        {
            TokenEkle();
            try
            {
                HttpResponseMessage yanit = await http.PutAsJsonAsync(BaseUrl + yol, govde);
                return await YanitiOku(yanit);
            }
            catch (HttpRequestException)
            {
                throw new ApiException("Sunucuya baglanilamadi. API calisiyor mu?");
            }
        }

        // ---- JSON okuma yardimcilari ----
        // MySQL DECIMAL alanlari JSON'a metin olarak gelebiliyor,
        // bu yuzden hem sayi hem metin durumu ele aliniyor.

        public static string Metin(JsonElement kayit, string alan)
        {
            if (kayit.ValueKind != JsonValueKind.Object) return "";
            if (!kayit.TryGetProperty(alan, out JsonElement d)) return "";
            if (d.ValueKind == JsonValueKind.String) return d.GetString();
            if (d.ValueKind == JsonValueKind.Null || d.ValueKind == JsonValueKind.Undefined) return "";
            return d.ToString();
        }

        public static decimal Para(JsonElement kayit, string alan)
        {
            if (kayit.ValueKind != JsonValueKind.Object) return 0;
            if (!kayit.TryGetProperty(alan, out JsonElement d)) return 0;

            if (d.ValueKind == JsonValueKind.Number)
            {
                return d.GetDecimal();
            }
            if (d.ValueKind == JsonValueKind.String)
            {
                decimal sonuc;
                // InvariantCulture sart: gelen deger "1200.00" seklinde nokta iceriyor,
                // Turkce kulturde nokta binlik ayraci sayilir ve yanlis okunur.
                decimal.TryParse(d.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out sonuc);
                return sonuc;
            }
            return 0;
        }

        public static int Tam(JsonElement kayit, string alan)
        {
            if (kayit.ValueKind != JsonValueKind.Object) return 0;
            if (!kayit.TryGetProperty(alan, out JsonElement d)) return 0;
            if (d.ValueKind == JsonValueKind.Number) return d.GetInt32();
            if (d.ValueKind == JsonValueKind.String)
            {
                int sonuc;
                int.TryParse(d.GetString(), out sonuc);
                return sonuc;
            }
            return 0;
        }

        public static bool Mantik(JsonElement kayit, string alan)
        {
            if (kayit.ValueKind != JsonValueKind.Object) return false;
            if (!kayit.TryGetProperty(alan, out JsonElement d)) return false;
            return d.ValueKind == JsonValueKind.True;
        }
    }
}
