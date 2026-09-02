using System.Text.Json;

namespace DepoYonetim
{
    // ComboBox icinde arac bilgisini tasimak icin kucuk bir sinif
    public class AracSecenegi
    {
        public int Id;
        public string Plaka;
        public string Sofor;

        public override string ToString()
        {
            return Plaka + (Sofor == "" ? "" : "  —  " + Sofor);
        }
    }

    public partial class YuklemeForm : Form
    {
        public YuklemeForm()
        {
            InitializeComponent();
        }

        private async void YuklemeForm_Load(object sender, EventArgs e)
        {
            KolonlariHazirla();
            await AraclariYukle();
            await DepoStogunuYukle();
        }

        private void KolonlariHazirla()
        {
            dgvDepo.Columns.Add("id", "No");
            dgvDepo.Columns.Add("kod", "Kod");
            dgvDepo.Columns.Add("ad", "Ürün");
            dgvDepo.Columns.Add("stok", "Depoda");
            dgvDepo.Columns[0].Width = 45;
            dgvDepo.Columns[1].Width = 70;
            dgvDepo.Columns[2].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvDepo.Columns[3].Width = 70;
            dgvDepo.Columns[3].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;

            dgvYukleme.Columns.Add("id", "No");
            dgvYukleme.Columns.Add("ad", "Ürün");
            dgvYukleme.Columns.Add("miktar", "Miktar");
            dgvYukleme.Columns[0].Visible = false;
            dgvYukleme.Columns[1].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvYukleme.Columns[2].Width = 70;
            dgvYukleme.Columns[2].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }

        private async Task AraclariYukle()
        {
            try
            {
                var liste = await ApiClient.GetAsync("/warehouse/vans");
                cmbArac.Items.Clear();

                foreach (JsonElement a in liste.EnumerateArray())
                {
                    AracSecenegi secenek = new AracSecenegi();
                    secenek.Id = ApiClient.Tam(a, "id");
                    secenek.Plaka = ApiClient.Metin(a, "plate");
                    secenek.Sofor = ApiClient.Metin(a, "driver_name");
                    cmbArac.Items.Add(secenek);
                }

                if (cmbArac.Items.Count > 0) cmbArac.SelectedIndex = 0;
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async Task DepoStogunuYukle()
        {
            try
            {
                var liste = await ApiClient.GetAsync("/warehouse/products");
                dgvDepo.Rows.Clear();

                foreach (JsonElement u in liste.EnumerateArray())
                {
                    int stok = ApiClient.Tam(u, "warehouse_stock");
                    // Depoda olmayan urunu yuklemeye gerek yok
                    if (stok <= 0) continue;

                    int satir = dgvDepo.Rows.Add(
                        ApiClient.Tam(u, "id"),
                        ApiClient.Metin(u, "code"),
                        ApiClient.Metin(u, "name"),
                        stok);

                    if (ApiClient.Mantik(u, "is_low"))
                    {
                        dgvDepo.Rows[satir].DefaultCellStyle.ForeColor = Bicim.Turuncu;
                    }
                }

                lblDurum.Text = dgvDepo.Rows.Count + " ürün depoda mevcut. " +
                                "Ürüne çift tıklayarak da ekleyebilirsiniz.";
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void dgvDepo_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0) return;
            SeciliUrunuEkle();
        }

        private void btnEkle_Click(object sender, EventArgs e)
        {
            SeciliUrunuEkle();
        }

        private void SeciliUrunuEkle()
        {
            if (dgvDepo.CurrentRow == null)
            {
                MessageBox.Show("Soldaki listeden bir ürün seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            int urunId = Convert.ToInt32(dgvDepo.CurrentRow.Cells[0].Value);
            string urunAdi = Convert.ToString(dgvDepo.CurrentRow.Cells[2].Value);
            int depodaki = Convert.ToInt32(dgvDepo.CurrentRow.Cells[3].Value);
            int miktar = (int)numMiktar.Value;

            // Ayni urun listede varsa miktarini artir
            foreach (DataGridViewRow satir in dgvYukleme.Rows)
            {
                if (Convert.ToInt32(satir.Cells[0].Value) == urunId)
                {
                    int yeni = Convert.ToInt32(satir.Cells[2].Value) + miktar;
                    if (yeni > depodaki)
                    {
                        MessageBox.Show(urunAdi + " için depoda sadece " + depodaki +
                            " birim var.", "Stok Yetersiz",
                            MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }
                    satir.Cells[2].Value = yeni;
                    ToplamiGuncelle();
                    return;
                }
            }

            if (miktar > depodaki)
            {
                MessageBox.Show(urunAdi + " için depoda sadece " + depodaki + " birim var.",
                    "Stok Yetersiz", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            dgvYukleme.Rows.Add(urunId, urunAdi, miktar);
            ToplamiGuncelle();
        }

        private void btnCikar_Click(object sender, EventArgs e)
        {
            if (dgvYukleme.CurrentRow == null) return;
            dgvYukleme.Rows.Remove(dgvYukleme.CurrentRow);
            ToplamiGuncelle();
        }

        private void ToplamiGuncelle()
        {
            int toplam = 0;
            foreach (DataGridViewRow satir in dgvYukleme.Rows)
            {
                toplam += Convert.ToInt32(satir.Cells[2].Value);
            }
            grpYukleme.Text = "Yüklenecekler  (" + dgvYukleme.Rows.Count +
                              " kalem / " + toplam + " birim)";
        }

        private async void btnKaydet_Click(object sender, EventArgs e)
        {
            AracSecenegi arac = cmbArac.SelectedItem as AracSecenegi;
            if (arac == null)
            {
                MessageBox.Show("Lütfen bir araç seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            if (dgvYukleme.Rows.Count == 0)
            {
                MessageBox.Show("Yükleme listesine en az bir ürün ekleyin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            var kalemler = new List<object>();
            foreach (DataGridViewRow satir in dgvYukleme.Rows)
            {
                kalemler.Add(new
                {
                    productId = Convert.ToInt32(satir.Cells[0].Value),
                    quantity = Convert.ToInt32(satir.Cells[2].Value)
                });
            }

            btnKaydet.Enabled = false;
            btnKaydet.Text = "Kaydediliyor...";

            try
            {
                var cevap = await ApiClient.PostAsync("/warehouse/load-orders", new
                {
                    vanId = arac.Id,
                    notes = txtNot.Text.Trim(),
                    items = kalemler
                });

                MessageBox.Show("Yükleme fişi oluşturuldu: " + ApiClient.Metin(cevap, "load_no") +
                    "\r\nAraç: " + ApiClient.Metin(cevap, "van_plate") +
                    "\r\n\r\nSaha temsilcisi mobil uygulamada 'Senkronize Et' dediğinde " +
                    "yeni stok cihazına inecektir.",
                    "Yükleme Tamam", MessageBoxButtons.OK, MessageBoxIcon.Information);

                dgvYukleme.Rows.Clear();
                txtNot.Clear();
                ToplamiGuncelle();
                await DepoStogunuYukle();
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            finally
            {
                btnKaydet.Enabled = true;
                btnKaydet.Text = "Yüklemeyi Kaydet";
            }
        }

        private void btnKapat_Click(object sender, EventArgs e)
        {
            Close();
        }
    }
}
