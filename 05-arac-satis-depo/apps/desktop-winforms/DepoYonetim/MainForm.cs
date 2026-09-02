using System.Text.Json;

namespace DepoYonetim
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            lblKullanici.Text = ApiClient.UserName + "  (" +
                (ApiClient.Role == "admin" ? "Yönetici" : "Depo Sorumlusu") + ")";
            await OzetiYukle();
        }

        private async void btnYenile_Click(object sender, EventArgs e)
        {
            await OzetiYukle();
        }

        private async Task OzetiYukle()
        {
            lblDurum.Text = "Yükleniyor...";
            try
            {
                var ozet = await ApiClient.GetAsync("/reports/summary");

                lblBugunFatura.Text = "Bugün kesilen fatura\r\n" + ApiClient.Tam(ozet, "today_invoice_count");
                lblBugunCiro.Text = "Bugünkü ciro\r\n" + Bicim.Para(ApiClient.Para(ozet, "today_revenue"));
                lblAyCiro.Text = "Bu ayın cirosu\r\n" + Bicim.Para(ApiClient.Para(ozet, "month_revenue"));
                lblAcikBakiye.Text = "Açık bakiye (alacak)\r\n" + Bicim.Para(ApiClient.Para(ozet, "open_balance"));
                lblKritikStok.Text = "Kritik stok ürünü\r\n" + ApiClient.Tam(ozet, "low_stock_count") + " ürün";

                AraclariDoldur(ozet.GetProperty("van_performance"));
                UrunleriDoldur(ozet.GetProperty("top_products"));

                lblDurum.Text = "Son güncelleme: " + DateTime.Now.ToString("HH:mm:ss") +
                                "   ·   Aktif araç: " + ApiClient.Tam(ozet, "van_count");
            }
            catch (ApiException hata)
            {
                lblDurum.Text = "";
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void AraclariDoldur(JsonElement liste)
        {
            dgvAraclar.Rows.Clear();
            if (dgvAraclar.Columns.Count == 0)
            {
                dgvAraclar.Columns.Add("plaka", "Plaka");
                dgvAraclar.Columns.Add("sofor", "Satış Temsilcisi");
                dgvAraclar.Columns.Add("adet", "Fatura");
                dgvAraclar.Columns.Add("ciro", "Ciro");
                dgvAraclar.Columns[2].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
                dgvAraclar.Columns[3].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
                dgvAraclar.Columns[1].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            }

            foreach (JsonElement a in liste.EnumerateArray())
            {
                string sofor = ApiClient.Metin(a, "driver_name");
                if (sofor == "") sofor = "(atanmamış)";

                dgvAraclar.Rows.Add(
                    ApiClient.Metin(a, "plate"),
                    sofor,
                    ApiClient.Tam(a, "today_invoices"),
                    Bicim.Para(ApiClient.Para(a, "today_revenue")));
            }
        }

        private void UrunleriDoldur(JsonElement liste)
        {
            dgvUrunler.Rows.Clear();
            if (dgvUrunler.Columns.Count == 0)
            {
                dgvUrunler.Columns.Add("ad", "Ürün");
                dgvUrunler.Columns.Add("adet", "Satılan");
                dgvUrunler.Columns.Add("ciro", "Ciro");
                dgvUrunler.Columns[1].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
                dgvUrunler.Columns[2].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
                dgvUrunler.Columns[0].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            }

            foreach (JsonElement u in liste.EnumerateArray())
            {
                dgvUrunler.Rows.Add(
                    ApiClient.Metin(u, "name"),
                    ApiClient.Tam(u, "total_quantity"),
                    Bicim.Para(ApiClient.Para(u, "revenue")));
            }
        }

        // ---- Menu ----

        private void btnStok_Click(object sender, EventArgs e)
        {
            using (StokForm f = new StokForm()) { f.ShowDialog(); }
        }

        private async void btnYukleme_Click(object sender, EventArgs e)
        {
            using (YuklemeForm f = new YuklemeForm()) { f.ShowDialog(); }
            // Yukleme yapildiysa ozet degismis olabilir
            await OzetiYukle();
        }

        private void btnAraclar_Click(object sender, EventArgs e)
        {
            using (AraclarForm f = new AraclarForm()) { f.ShowDialog(); }
        }

        private void btnFaturalar_Click(object sender, EventArgs e)
        {
            using (FaturalarForm f = new FaturalarForm()) { f.ShowDialog(); }
        }

        private void btnGunSonu_Click(object sender, EventArgs e)
        {
            using (GunSonuForm f = new GunSonuForm()) { f.ShowDialog(); }
        }
    }
}
