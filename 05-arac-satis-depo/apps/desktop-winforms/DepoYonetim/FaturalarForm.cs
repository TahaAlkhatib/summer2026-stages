using System.Text;
using System.Text.Json;

namespace DepoYonetim
{
    public partial class FaturalarForm : Form
    {
        public FaturalarForm()
        {
            InitializeComponent();
        }

        private async void FaturalarForm_Load(object sender, EventArgs e)
        {
            cmbOdeme.SelectedIndex = 0;
            KolonlariHazirla();
            await Listele();
        }

        private void KolonlariHazirla()
        {
            dgvFaturalar.Columns.Add("id", "No");
            dgvFaturalar.Columns.Add("fatura_no", "Fatura No");
            dgvFaturalar.Columns.Add("musteri", "Müşteri");
            dgvFaturalar.Columns.Add("arac", "Araç");
            dgvFaturalar.Columns.Add("odeme", "Ödeme");
            dgvFaturalar.Columns.Add("toplam", "Genel Toplam");
            dgvFaturalar.Columns.Add("kalan", "Kalan");
            dgvFaturalar.Columns.Add("kesim", "Kesim Zamanı");
            dgvFaturalar.Columns.Add("senkron", "Sunucuya Geliş");

            dgvFaturalar.Columns[0].Visible = false;
            dgvFaturalar.Columns[2].AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill;
            dgvFaturalar.Columns[5].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
            dgvFaturalar.Columns[6].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
        }

        private async Task Listele()
        {
            lblDurum.Text = "Yükleniyor...";
            try
            {
                string yol = "/invoices?";
                if (cmbOdeme.SelectedIndex == 1) yol += "paymentType=nakit&";
                if (cmbOdeme.SelectedIndex == 2) yol += "paymentType=vadeli&";
                if (chkTarih.Checked) yol += "date=" + Bicim.ApiTarih(dtpTarih.Value) + "&";
                if (chkAcik.Checked) yol += "unpaid=1";

                var liste = await ApiClient.GetAsync(yol);

                dgvFaturalar.Rows.Clear();
                decimal toplam = 0;
                decimal kalanToplam = 0;

                foreach (JsonElement f in liste.EnumerateArray())
                {
                    decimal kalan = ApiClient.Para(f, "remaining");
                    toplam += ApiClient.Para(f, "grand_total");
                    kalanToplam += kalan;

                    int satir = dgvFaturalar.Rows.Add(
                        ApiClient.Tam(f, "id"),
                        ApiClient.Metin(f, "invoice_no"),
                        ApiClient.Metin(f, "customer_name"),
                        ApiClient.Metin(f, "van_plate"),
                        Bicim.OdemeTipi(ApiClient.Metin(f, "payment_type")),
                        Bicim.Para(ApiClient.Para(f, "grand_total")),
                        kalan > 0 ? Bicim.Para(kalan) : "-",
                        Bicim.TarihSaat(ApiClient.Metin(f, "issued_at")),
                        Bicim.TarihSaat(ApiClient.Metin(f, "synced_at")));

                    if (kalan > 0)
                    {
                        dgvFaturalar.Rows[satir].Cells[6].Style.ForeColor = Bicim.Turuncu;
                    }
                }

                lblDurum.Text = dgvFaturalar.Rows.Count + " fatura  ·  Toplam " +
                                Bicim.Para(toplam) + "  ·  Açık bakiye " + Bicim.Para(kalanToplam);
            }
            catch (ApiException hata)
            {
                lblDurum.Text = "";
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private async void btnListele_Click(object sender, EventArgs e)
        {
            await Listele();
        }

        private void dgvFaturalar_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex < 0) return;
            DetayGoster();
        }

        private void btnDetay_Click(object sender, EventArgs e)
        {
            DetayGoster();
        }

        private async void DetayGoster()
        {
            if (dgvFaturalar.CurrentRow == null)
            {
                MessageBox.Show("Listeden bir fatura seçin.", "Uyarı",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            int id = Convert.ToInt32(dgvFaturalar.CurrentRow.Cells[0].Value);

            try
            {
                var f = await ApiClient.GetAsync("/invoices/" + id);
                var musteri = f.GetProperty("customer");

                StringBuilder metin = new StringBuilder();
                metin.AppendLine("FATURA  " + ApiClient.Metin(f, "invoice_no"));
                metin.AppendLine("Cihaz kimliği: " + ApiClient.Metin(f, "offline_id"));
                metin.AppendLine();
                metin.AppendLine("Müşteri : " + ApiClient.Metin(musteri, "name"));
                metin.AppendLine("Yetkili : " + ApiClient.Metin(musteri, "contact_name") +
                                 "   " + ApiClient.Metin(musteri, "phone"));
                metin.AppendLine("Adres   : " + ApiClient.Metin(musteri, "address") +
                                 " / " + ApiClient.Metin(musteri, "district"));
                metin.AppendLine("Vergi No: " + ApiClient.Metin(musteri, "tax_number"));
                metin.AppendLine();
                metin.AppendLine("Araç    : " + ApiClient.Metin(f.GetProperty("van"), "plate"));
                metin.AppendLine("Temsilci: " + ApiClient.Metin(f, "sales_rep_name"));
                metin.AppendLine("Kesim   : " + Bicim.TarihSaat(ApiClient.Metin(f, "issued_at")));
                metin.AppendLine("Sunucu  : " + Bicim.TarihSaat(ApiClient.Metin(f, "synced_at")));
                metin.AppendLine();
                metin.AppendLine("--- KALEMLER ---");

                foreach (JsonElement k in f.GetProperty("items").EnumerateArray())
                {
                    metin.AppendLine(ApiClient.Metin(k, "name").PadRight(28).Substring(0, 28) +
                        ApiClient.Tam(k, "quantity").ToString().PadLeft(5) + " x " +
                        Bicim.Para(ApiClient.Para(k, "unit_price")).PadLeft(14) + "  = " +
                        Bicim.Para(ApiClient.Para(k, "line_total")).PadLeft(14));
                }

                metin.AppendLine();
                metin.AppendLine("Ara Toplam  : " + Bicim.Para(ApiClient.Para(f, "sub_total")));
                metin.AppendLine("KDV         : " + Bicim.Para(ApiClient.Para(f, "vat_total")));
                metin.AppendLine("Genel Toplam: " + Bicim.Para(ApiClient.Para(f, "grand_total")));
                metin.AppendLine("Ödenen      : " + Bicim.Para(ApiClient.Para(f, "paid_amount")));
                metin.AppendLine("Kalan       : " + Bicim.Para(ApiClient.Para(f, "remaining")));

                JsonElement tahsilatlar = f.GetProperty("collections");
                if (tahsilatlar.GetArrayLength() > 0)
                {
                    metin.AppendLine();
                    metin.AppendLine("--- TAHSİLATLAR ---");
                    foreach (JsonElement t in tahsilatlar.EnumerateArray())
                    {
                        metin.AppendLine(Bicim.TarihSaat(ApiClient.Metin(t, "collected_at")) + "   " +
                            Bicim.Para(ApiClient.Para(t, "amount")) + "   " +
                            Bicim.TahsilatYontemi(ApiClient.Metin(t, "method")));
                    }
                }

                if (f.TryGetProperty("latitude", out JsonElement en) &&
                    en.ValueKind == JsonValueKind.Number)
                {
                    metin.AppendLine();
                    metin.AppendLine("Kesim konumu: " +
                        ApiClient.Para(f, "latitude").ToString("0.00000", Bicim.TR) + ", " +
                        ApiClient.Para(f, "longitude").ToString("0.00000", Bicim.TR));
                }

                MetinPenceresi("Fatura Detayı — " + ApiClient.Metin(f, "invoice_no"), metin.ToString());
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        // Detayi sabit genislikli yazi tipiyle gosteren basit bir pencere
        private void MetinPenceresi(string baslik, string icerik)
        {
            using (Form pencere = new Form())
            {
                pencere.Text = baslik;
                pencere.StartPosition = FormStartPosition.CenterParent;
                pencere.ClientSize = new Size(660, 540);
                pencere.MinimizeBox = false;

                TextBox kutu = new TextBox();
                kutu.Multiline = true;
                kutu.ReadOnly = true;
                kutu.ScrollBars = ScrollBars.Vertical;
                kutu.Dock = DockStyle.Fill;
                kutu.Font = new Font("Consolas", 9.75F);
                kutu.BackColor = Color.White;
                kutu.BorderStyle = BorderStyle.None;
                kutu.Text = icerik.Replace("\n", "\r\n").Replace("\r\r\n", "\r\n");

                pencere.Controls.Add(kutu);
                pencere.Padding = new Padding(14);
                pencere.ShowDialog(this);
            }
        }
    }
}
