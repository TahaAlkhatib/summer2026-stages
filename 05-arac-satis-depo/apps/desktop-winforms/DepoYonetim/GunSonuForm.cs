using System.Text.Json;

namespace DepoYonetim
{
    public partial class GunSonuForm : Form
    {
        public GunSonuForm()
        {
            InitializeComponent();
        }

        private async void GunSonuForm_Load(object sender, EventArgs e)
        {
            KolonlariHazirla();
            await RaporuGetir();
        }

        private void KolonlariHazirla()
        {
            dgvFaturalar.Columns.Add("saat", "Saat");
            dgvFaturalar.Columns.Add("fatura_no", "Fatura No");
            dgvFaturalar.Columns.Add("musteri", "Müşteri");
            dgvFaturalar.Columns.Add("arac", "Araç");
            dgvFaturalar.Columns.Add("odeme", "Ödeme");
            dgvFaturalar.Columns.Add("toplam", "Tutar");
            dgvFaturalar.Columns.Add("odenen", "Ödenen");

            dgvFaturalar.Columns[0].Width = 70;
            dgvFaturalar.Columns[2].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvFaturalar.Columns[5].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
            dgvFaturalar.Columns[6].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }

        private async Task RaporuGetir()
        {
            try
            {
                // Tarih sunucuya yerel gun olarak gonderiliyor (UTC degil)
                var rapor = await ApiClient.GetAsync("/reports/daily?date=" +
                    Bicim.ApiTarih(dtpTarih.Value));

                lblFaturaSayisi.Text = "Fatura adedi\r\n" + ApiClient.Tam(rapor, "invoice_count");
                lblNakit.Text = "Nakit satış\r\n" + Bicim.Para(ApiClient.Para(rapor, "cash_total"));
                lblVadeli.Text = "Vadeli satış\r\n" + Bicim.Para(ApiClient.Para(rapor, "credit_total"));
                lblToplam.Text = "Günün cirosu\r\n" + Bicim.Para(ApiClient.Para(rapor, "grand_total"));
                lblTahsilat.Text = "Sahadan tahsilat\r\n" + Bicim.Para(ApiClient.Para(rapor, "collected"));

                grpOzet.Text = "Gün Sonu Özeti — " +
                    dtpTarih.Value.ToString("dd MMMM yyyy dddd", Bicim.TR);

                dgvFaturalar.Rows.Clear();
                foreach (JsonElement f in rapor.GetProperty("invoices").EnumerateArray())
                {
                    string zaman = Bicim.TarihSaat(ApiClient.Metin(f, "issued_at"));
                    dgvFaturalar.Rows.Add(
                        zaman.Length > 11 ? zaman.Substring(11) : zaman,
                        ApiClient.Metin(f, "invoice_no"),
                        ApiClient.Metin(f, "customer_name"),
                        ApiClient.Metin(f, "van_plate"),
                        Bicim.OdemeTipi(ApiClient.Metin(f, "payment_type")),
                        Bicim.Para(ApiClient.Para(f, "grand_total")),
                        Bicim.Para(ApiClient.Para(f, "paid_amount")));
                }

                if (dgvFaturalar.Rows.Count == 0)
                {
                    MessageBox.Show("Seçilen günde fatura kesilmemiş.", "Bilgi",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnGetir_Click(object sender, EventArgs e)
        {
            await RaporuGetir();
        }
    }
}
