using System.Text.Json;

namespace DepoYonetim
{
    public partial class AraclarForm : Form
    {
        // Araclarin stok listesini her secimde tekrar indirmemek icin saklıyoruz
        private readonly Dictionary<int, JsonElement> aracStoklari = new Dictionary<int, JsonElement>();

        public AraclarForm()
        {
            InitializeComponent();
        }

        private async void AraclarForm_Load(object sender, EventArgs e)
        {
            KolonlariHazirla();
            await AraclariYukle();
        }

        private void KolonlariHazirla()
        {
            dgvAraclar.Columns.Add("id", "No");
            dgvAraclar.Columns.Add("plaka", "Plaka");
            dgvAraclar.Columns.Add("arac", "Marka / Model");
            dgvAraclar.Columns.Add("sofor", "Satış Temsilcisi");
            dgvAraclar.Columns.Add("kalem", "Stok Kalemi");
            dgvAraclar.Columns.Add("konum", "Son Konum");
            dgvAraclar.Columns[0].Visible = false;
            dgvAraclar.Columns[5].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;

            dgvStok.Columns.Add("kod", "Kod");
            dgvStok.Columns.Add("ad", "Ürün");
            dgvStok.Columns.Add("miktar", "Miktar");
            dgvStok.Columns[1].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvStok.Columns[2].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;

            dgvRota.Columns.Add("saat", "Saat");
            dgvRota.Columns.Add("fatura", "Fatura No");
            dgvRota.Columns.Add("musteri", "Müşteri");
            dgvRota.Columns.Add("tutar", "Tutar");
            dgvRota.Columns.Add("konum", "Konum");
            dgvRota.Columns[2].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvRota.Columns[3].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }

        private async Task AraclariYukle()
        {
            try
            {
                var liste = await ApiClient.GetAsync("/warehouse/vans");
                dgvAraclar.Rows.Clear();
                aracStoklari.Clear();

                foreach (JsonElement a in liste.EnumerateArray())
                {
                    int aracId = ApiClient.Tam(a, "id");
                    JsonElement stok = a.GetProperty("stock");
                    aracStoklari[aracId] = stok;

                    string konum = "Konum bilgisi yok";
                    if (a.TryGetProperty("last_location", out JsonElement k) &&
                        k.ValueKind == JsonValueKind.Object)
                    {
                        konum = ApiClient.Para(k, "latitude").ToString("0.00000", Bicim.TR) + ", " +
                                ApiClient.Para(k, "longitude").ToString("0.00000", Bicim.TR) +
                                "   (" + Bicim.TarihSaat(ApiClient.Metin(k, "recorded_at")) + ")";
                    }

                    string sofor = ApiClient.Metin(a, "driver_name");
                    if (sofor == "") sofor = "(atanmamış)";

                    dgvAraclar.Rows.Add(
                        aracId,
                        ApiClient.Metin(a, "plate"),
                        ApiClient.Metin(a, "brand") + " " + ApiClient.Metin(a, "model"),
                        sofor,
                        stok.GetArrayLength(),
                        konum);
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void dgvAraclar_SelectionChanged(object sender, EventArgs e)
        {
            dgvStok.Rows.Clear();
            if (dgvAraclar.CurrentRow == null) return;

            int aracId = Convert.ToInt32(dgvAraclar.CurrentRow.Cells[0].Value);
            if (!aracStoklari.ContainsKey(aracId)) return;

            foreach (JsonElement s in aracStoklari[aracId].EnumerateArray())
            {
                dgvStok.Rows.Add(
                    ApiClient.Metin(s, "code"),
                    ApiClient.Metin(s, "name"),
                    ApiClient.Tam(s, "quantity"));
            }

            grpStok.Text = "Araç Üstü Stok — " + dgvAraclar.CurrentRow.Cells[1].Value;
            lblKonum.Text = Convert.ToString(dgvAraclar.CurrentRow.Cells[5].Value);
        }

        private async void btnRota_Click(object sender, EventArgs e)
        {
            if (dgvAraclar.CurrentRow == null)
            {
                MessageBox.Show("Önce yukarıdan bir araç seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            int aracId = Convert.ToInt32(dgvAraclar.CurrentRow.Cells[0].Value);

            try
            {
                var rota = await ApiClient.GetAsync("/reports/van-route?vanId=" + aracId +
                    "&date=" + Bicim.ApiTarih(dtpTarih.Value));

                dgvRota.Rows.Clear();
                foreach (JsonElement d in rota.GetProperty("stops").EnumerateArray())
                {
                    string konum = "-";
                    if (d.TryGetProperty("latitude", out JsonElement en) &&
                        en.ValueKind == JsonValueKind.Number)
                    {
                        konum = ApiClient.Para(d, "latitude").ToString("0.00000", Bicim.TR) + ", " +
                                ApiClient.Para(d, "longitude").ToString("0.00000", Bicim.TR);
                    }

                    dgvRota.Rows.Add(
                        Bicim.TarihSaat(ApiClient.Metin(d, "issued_at")).Substring(11),
                        ApiClient.Metin(d, "invoice_no"),
                        ApiClient.Metin(d, "customer_name"),
                        Bicim.Para(ApiClient.Para(d, "grand_total")),
                        konum);
                }

                int noktaSayisi = rota.GetProperty("points").GetArrayLength();
                grpRota.Text = "Günün Rotası — " + dgvRota.Rows.Count + " durak, " +
                               noktaSayisi + " GPS noktası";

                if (dgvRota.Rows.Count == 0 && noktaSayisi == 0)
                {
                    MessageBox.Show("Seçilen gün için bu araca ait kayıt bulunamadı.",
                        "Bilgi", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }
    }
}
