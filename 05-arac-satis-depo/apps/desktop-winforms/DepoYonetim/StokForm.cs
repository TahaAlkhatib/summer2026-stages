using System.Globalization;
using System.Text.Json;

namespace DepoYonetim
{
    public partial class StokForm : Form
    {
        public StokForm()
        {
            InitializeComponent();
        }

        private async void StokForm_Load(object sender, EventArgs e)
        {
            KolonlariHazirla();
            await Listele();
        }

        private void KolonlariHazirla()
        {
            dgvStok.Columns.Add("id", "No");
            dgvStok.Columns.Add("kod", "Kod");
            dgvStok.Columns.Add("ad", "Ürün Adı");
            dgvStok.Columns.Add("birim", "Birim");
            dgvStok.Columns.Add("fiyat", "Fiyat");
            dgvStok.Columns.Add("kdv", "KDV");
            dgvStok.Columns.Add("stok", "Depo Stoğu");
            dgvStok.Columns.Add("min", "Min. Stok");

            dgvStok.Columns[0].Width = 50;
            dgvStok.Columns[2].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            for (int i = 4; i < 8; i++)
            {
                dgvStok.Columns[i].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
            }
        }

        private async Task Listele()
        {
            lblDurum.Text = "Yükleniyor...";
            try
            {
                string yol = "/warehouse/products?q=" + Uri.EscapeDataString(txtAra.Text.Trim());
                if (chkKritik.Checked) yol += "&lowStock=1";

                var liste = await ApiClient.GetAsync(yol);

                dgvStok.Rows.Clear();
                int kritik = 0;
                decimal toplamDeger = 0;

                foreach (JsonElement u in liste.EnumerateArray())
                {
                    int satir = dgvStok.Rows.Add(
                        ApiClient.Tam(u, "id"),
                        ApiClient.Metin(u, "code"),
                        ApiClient.Metin(u, "name"),
                        ApiClient.Metin(u, "unit"),
                        Bicim.Para(ApiClient.Para(u, "price")),
                        "%" + ApiClient.Para(u, "vat_rate").ToString("0", Bicim.TR),
                        ApiClient.Tam(u, "warehouse_stock"),
                        ApiClient.Tam(u, "min_stock"));

                    toplamDeger += ApiClient.Para(u, "price") * ApiClient.Tam(u, "warehouse_stock");

                    // Kritik seviyedeki urunleri kirmizi gosteriyoruz
                    if (ApiClient.Mantik(u, "is_low"))
                    {
                        kritik++;
                        dgvStok.Rows[satir].DefaultCellStyle.ForeColor = Bicim.Kirmizi;
                    }
                }

                lblDurum.Text = dgvStok.Rows.Count + " ürün  ·  " + kritik +
                                " tanesi kritik seviyede  ·  Stok değeri: " + Bicim.Para(toplamDeger);
            }
            catch (ApiException hata)
            {
                lblDurum.Text = "";
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnAra_Click(object sender, EventArgs e)
        {
            await Listele();
        }

        private async void btnStokGiris_Click(object sender, EventArgs e)
        {
            if (dgvStok.CurrentRow == null)
            {
                MessageBox.Show("Lütfen listeden bir ürün seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            int urunId = Convert.ToInt32(dgvStok.CurrentRow.Cells[0].Value);
            string urunAdi = Convert.ToString(dgvStok.CurrentRow.Cells[2].Value);

            string girilen = Soru("Depoya Mal Girişi",
                urunAdi + "\r\nKaç birim giriş yapılacak?", "0");
            if (girilen == null) return;

            int miktar;
            if (!int.TryParse(girilen, out miktar) || miktar <= 0)
            {
                MessageBox.Show("Geçerli bir miktar girin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                await ApiClient.PostAsync("/warehouse/products/" + urunId + "/stock-in",
                    new { quantity = miktar });
                MessageBox.Show(urunAdi + " için " + miktar + " birim giriş yapıldı.",
                    "Tamam", MessageBoxButtons.OK, MessageBoxIcon.Information);
                await Listele();
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnYeniUrun_Click(object sender, EventArgs e)
        {
            if (ApiClient.Role != "admin")
            {
                MessageBox.Show("Yeni ürün eklemek için yönetici yetkisi gerekir.",
                    "Yetki", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            string kod = Soru("Yeni Ürün", "Ürün kodu:", "");
            if (kod == null) return;
            string ad = Soru("Yeni Ürün", "Ürün adı:", "");
            if (ad == null) return;
            string birim = Soru("Yeni Ürün", "Birim (adet, kg, koli...):", "adet");
            if (birim == null) return;
            string fiyatMetni = Soru("Yeni Ürün", "Satış fiyatı (₺):", "0");
            if (fiyatMetni == null) return;
            string kdvMetni = Soru("Yeni Ürün", "KDV oranı (%):", "20");
            if (kdvMetni == null) return;
            string minMetni = Soru("Yeni Ürün", "Kritik (minimum) stok:", "10");
            if (minMetni == null) return;

            decimal fiyat;
            decimal kdv;
            int minStok;
            // Kullanici "12,50" yazabilir; Turkce kulturle okuyoruz
            if (!decimal.TryParse(fiyatMetni, NumberStyles.Any, Bicim.TR, out fiyat) || fiyat <= 0)
            {
                MessageBox.Show("Geçerli bir fiyat girin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            decimal.TryParse(kdvMetni, NumberStyles.Any, Bicim.TR, out kdv);
            int.TryParse(minMetni, out minStok);

            try
            {
                await ApiClient.PostAsync("/warehouse/products", new
                {
                    code = kod.Trim(),
                    name = ad.Trim(),
                    unit = birim.Trim(),
                    price = fiyat,
                    vatRate = kdv,
                    warehouseStock = 0,
                    minStock = minStok,
                    isActive = true
                });

                MessageBox.Show("Ürün eklendi. Şimdi mal girişi yapabilirsiniz.",
                    "Tamam", MessageBoxButtons.OK, MessageBoxIcon.Information);
                txtAra.Text = kod.Trim();
                await Listele();
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        // Kucuk bir giris penceresi — WinForms'ta hazir bir InputBox olmadigi icin
        private string Soru(string baslik, string mesaj, string baslangic)
        {
            using (Form pencere = new Form())
            {
                pencere.Text = baslik;
                pencere.FormBorderStyle = FormBorderStyle.FixedDialog;
                pencere.StartPosition = FormStartPosition.CenterParent;
                pencere.ClientSize = new Size(360, 150);
                pencere.MaximizeBox = false;
                pencere.MinimizeBox = false;

                Label etiket = new Label();
                etiket.Text = mesaj;
                etiket.Location = new Point(16, 14);
                etiket.Size = new Size(330, 44);

                TextBox alan = new TextBox();
                alan.Text = baslangic;
                alan.Location = new Point(16, 62);
                alan.Size = new Size(330, 23);
                alan.BorderStyle = BorderStyle.FixedSingle;

                Button tamam = new Button();
                tamam.Text = "Tamam";
                tamam.DialogResult = DialogResult.OK;
                tamam.Location = new Point(176, 100);
                tamam.Size = new Size(80, 30);

                Button vazgec = new Button();
                vazgec.Text = "Vazgeç";
                vazgec.DialogResult = DialogResult.Cancel;
                vazgec.Location = new Point(266, 100);
                vazgec.Size = new Size(80, 30);

                pencere.Controls.Add(etiket);
                pencere.Controls.Add(alan);
                pencere.Controls.Add(tamam);
                pencere.Controls.Add(vazgec);
                pencere.AcceptButton = tamam;
                pencere.CancelButton = vazgec;

                if (pencere.ShowDialog(this) != DialogResult.OK) return null;
                if (alan.Text.Trim() == "") return null;
                return alan.Text;
            }
        }
    }
}
