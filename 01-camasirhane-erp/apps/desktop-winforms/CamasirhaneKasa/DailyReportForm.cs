using System.Drawing.Printing;
using System.Text.Json;

namespace CamasirhaneKasa
{
    public partial class DailyReportForm : Form
    {
        private string raporTarihi = "";

        public DailyReportForm()
        {
            InitializeComponent();
        }

        private async void DailyReportForm_Load(object sender, EventArgs e)
        {
            dtpTarih.Value = DateTime.Now;
            await Getir();
        }

        private async void btnGetir_Click(object sender, EventArgs e)
        {
            await Getir();
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
