using System.Drawing.Printing;
using System.Text.Json;

namespace CamasirhaneKasa
{
    public class DailyReportForm : Form
    {
        private DateTimePicker dtpTarih;
        private Label lblSiparisAdedi;
        private Label lblCiro;
        private Label lblTeslim;
        private Label lblKasa;
        private Label lblNakit;
        private Label lblKart;
        private Label lblHavale;
        private DataGridView dgvSiparisler;

        private string raporTarihi = "";

        public DailyReportForm()
        {
            Text = "Gün Sonu Kasa Raporu";
            Size = new Size(900, 720);
            StartPosition = FormStartPosition.CenterParent;
            BackColor = Color.FromArgb(244, 246, 248);

            Label etTarih = new Label();
            etTarih.Text = "Tarih";
            etTarih.SetBounds(20, 15, 60, 20);
            Controls.Add(etTarih);

            dtpTarih = new DateTimePicker();
            dtpTarih.Format = DateTimePickerFormat.Short;
            dtpTarih.Value = DateTime.Now;
            dtpTarih.SetBounds(20, 37, 180, 26);
            Controls.Add(dtpTarih);

            Button btnGetir = new Button();
            btnGetir.Text = "Getir";
            btnGetir.SetBounds(210, 36, 100, 28);
            btnGetir.Click += async (s, e) => await Getir();
            Controls.Add(btnGetir);

            Button btnYazdir = new Button();
            btnYazdir.Text = "Yazdır";
            btnYazdir.SetBounds(320, 36, 100, 28);
            btnYazdir.Click += btnYazdir_Click;
            Controls.Add(btnYazdir);

            // ---- Özet kutuları ----
            lblSiparisAdedi = OzetKutusu("Sipariş Adedi", 20, 85);
            lblCiro = OzetKutusu("Toplam Ciro", 230, 85);
            lblTeslim = OzetKutusu("Teslim Edilen", 440, 85);
            lblKasa = OzetKutusu("Kasa Toplamı", 650, 85);

            // ---- Tahsilat dağılımı ----
            GroupBox kutu = new GroupBox();
            kutu.Text = "Tahsilat Dağılımı";
            kutu.SetBounds(20, 185, 840, 90);
            kutu.BackColor = Color.White;

            lblNakit = TahsilatSatiri(kutu, "Nakit", 0);
            lblKart = TahsilatSatiri(kutu, "Kart", 1);
            lblHavale = TahsilatSatiri(kutu, "Havale", 2);
            Controls.Add(kutu);

            // ---- Siparişler ----
            Label etListe = new Label();
            etListe.Text = "Günün Siparişleri";
            etListe.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            etListe.ForeColor = Color.FromArgb(30, 96, 145);
            etListe.SetBounds(20, 290, 300, 24);
            Controls.Add(etListe);

            dgvSiparisler = new DataGridView();
            dgvSiparisler.SetBounds(20, 318, 840, 330);
            dgvSiparisler.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom;
            dgvSiparisler.ReadOnly = true;
            dgvSiparisler.AllowUserToAddRows = false;
            dgvSiparisler.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dgvSiparisler.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dgvSiparisler.BackgroundColor = Color.White;
            dgvSiparisler.Columns.Add("order_no", "Sipariş No");
            dgvSiparisler.Columns.Add("musteri", "Müşteri");
            dgvSiparisler.Columns.Add("tutar", "Tutar");
            dgvSiparisler.Columns.Add("odenen", "Ödenen");
            dgvSiparisler.Columns.Add("durum", "Durum");
            Controls.Add(dgvSiparisler);

            Load += async (s, e) => await Getir();
        }

        private Label OzetKutusu(string baslik, int x, int y)
        {
            Panel p = new Panel();
            p.SetBounds(x, y, 200, 80);
            p.BackColor = Color.White;
            p.BorderStyle = BorderStyle.FixedSingle;

            Label et = new Label();
            et.Text = baslik;
            et.ForeColor = Color.Gray;
            et.SetBounds(12, 10, 180, 20);
            p.Controls.Add(et);

            Label deger = new Label();
            deger.Text = "-";
            deger.Font = new Font("Segoe UI", 14, FontStyle.Bold);
            deger.ForeColor = Color.FromArgb(30, 96, 145);
            deger.SetBounds(12, 35, 180, 32);
            p.Controls.Add(deger);

            Controls.Add(p);
            return deger;
        }

        private Label TahsilatSatiri(GroupBox kutu, string etiket, int sira)
        {
            Label et = new Label();
            et.Text = etiket;
            et.ForeColor = Color.Gray;
            et.SetBounds(20 + sira * 270, 30, 100, 20);
            kutu.Controls.Add(et);

            Label deger = new Label();
            deger.Text = "-";
            deger.Font = new Font("Segoe UI", 11, FontStyle.Bold);
            deger.SetBounds(20 + sira * 270, 52, 200, 24);
            kutu.Controls.Add(deger);

            return deger;
        }

        private async Task Getir()
        {
            try
            {
                string tarih = Bicim.ApiTarih(dtpTarih.Value);
                JsonElement rapor = await ApiClient.GetAsync("/reports/daily?date=" + tarih);

                raporTarihi = ApiClient.Metin(rapor, "date");

                lblSiparisAdedi.Text = ApiClient.Tam(rapor, "order_count").ToString();
                lblCiro.Text = Bicim.Para(ApiClient.Para(rapor, "total_amount"));
                lblTeslim.Text = ApiClient.Tam(rapor, "delivered_count").ToString();

                JsonElement kasa = rapor.GetProperty("collected");
                lblKasa.Text = Bicim.Para(ApiClient.Para(kasa, "toplam"));
                lblNakit.Text = Bicim.Para(ApiClient.Para(kasa, "nakit"));
                lblKart.Text = Bicim.Para(ApiClient.Para(kasa, "kart"));
                lblHavale.Text = Bicim.Para(ApiClient.Para(kasa, "havale"));

                dgvSiparisler.Rows.Clear();
                foreach (JsonElement s in rapor.GetProperty("orders").EnumerateArray())
                {
                    dgvSiparisler.Rows.Add(
                        ApiClient.Metin(s, "order_no"),
                        ApiClient.Metin(s, "customer_name"),
                        Bicim.Para(ApiClient.Para(s, "total_amount")),
                        Bicim.Para(ApiClient.Para(s, "paid_amount")),
                        Bicim.Durum(ApiClient.Metin(s, "status"))
                    );
                }
            }
            catch (ApiException hata)
            {
                MessageBox.Show(hata.Message, "Hata", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private void btnYazdir_Click(object sender, EventArgs e)
        {
            PrintDocument belge = new PrintDocument();
            belge.PrintPage += belge_PrintPage;

            using (PrintPreviewDialog onizleme = new PrintPreviewDialog())
            {
                onizleme.Document = belge;
                onizleme.Width = 900;
                onizleme.Height = 700;
                onizleme.ShowDialog();
            }
        }

        private void belge_PrintPage(object sender, PrintPageEventArgs e)
        {
            Graphics g = e.Graphics;
            float x = e.MarginBounds.Left;
            float y = e.MarginBounds.Top;
            float genislik = e.MarginBounds.Width;

            using (Font fBaslik = new Font("Segoe UI", 16, FontStyle.Bold))
            using (Font fAlt = new Font("Segoe UI", 10))
            using (Font fKalin = new Font("Segoe UI", 10, FontStyle.Bold))
            {
                g.DrawString("GÜN SONU KASA RAPORU", fBaslik, Brushes.Black, x, y);
                y += 34;

                g.DrawString("Tarih: " + Bicim.Tarih(raporTarihi), fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Kasiyer: " + ApiClient.UserName, fAlt, Brushes.Black, x, y);
                y += 30;

                g.DrawLine(Pens.Gray, x, y, x + genislik, y);
                y += 14;

                g.DrawString("Sipariş Adedi: " + lblSiparisAdedi.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Toplam Ciro: " + lblCiro.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Teslim Edilen: " + lblTeslim.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Nakit: " + lblNakit.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Kart: " + lblKart.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Havale: " + lblHavale.Text, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("KASA TOPLAMI: " + lblKasa.Text, fKalin, Brushes.Black, x, y);
                y += 32;

                g.DrawLine(Pens.Gray, x, y, x + genislik, y);
                y += 14;

                g.DrawString("Günün Siparişleri", fKalin, Brushes.Black, x, y);
                y += 24;

                foreach (DataGridViewRow satir in dgvSiparisler.Rows)
                {
                    string metin = satir.Cells[0].Value + "   " +
                                   satir.Cells[1].Value + "   " +
                                   satir.Cells[2].Value + "   " +
                                   satir.Cells[4].Value;
                    g.DrawString(metin, fAlt, Brushes.Black, x, y);
                    y += 18;

                    // Sayfa taşarsa geri kalanı basmıyoruz (basit rapor)
                    if (y > e.MarginBounds.Bottom - 60)
                    {
                        break;
                    }
                }

                y += 40;
                g.DrawString("Kasiyer: " + ApiClient.UserName, fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("İmza: ............................", fAlt, Brushes.Black, x, y);
            }

            e.HasMorePages = false;
        }
    }
}
