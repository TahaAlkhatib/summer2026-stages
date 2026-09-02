using System.Drawing.Printing;
using System.Text.Json;

namespace SporSalonuKasa
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

                JsonElement uyelik = rapor.GetProperty("membership_collected");
                lblUyelikNakit.Text = "Nakit: " + Bicim.Para(ApiClient.Para(uyelik, "nakit"));
                lblUyelikKart.Text = "Kart: " + Bicim.Para(ApiClient.Para(uyelik, "kart"));
                lblUyelikHavale.Text = "Havale: " + Bicim.Para(ApiClient.Para(uyelik, "havale"));
                lblUyelikToplam.Text = "Toplam: " + Bicim.Para(ApiClient.Para(uyelik, "toplam"));

                JsonElement bufe = rapor.GetProperty("shop_collected");
                lblBufeNakit.Text = "Nakit: " + Bicim.Para(ApiClient.Para(bufe, "nakit"));
                lblBufeKart.Text = "Kart: " + Bicim.Para(ApiClient.Para(bufe, "kart"));
                lblBufeToplam.Text = "Toplam: " + Bicim.Para(ApiClient.Para(bufe, "toplam"));

                lblGenelToplam.Text = Bicim.Para(ApiClient.Para(rapor, "grand_total"));

                JsonElement girisler = rapor.GetProperty("entries");
                lblGirisler.Text = "Giriş: " + ApiClient.Tam(girisler, "izin") +
                                   "     Ret: " + ApiClient.Tam(girisler, "red");

                dgvUyelikler.Rows.Clear();
                foreach (JsonElement m in rapor.GetProperty("new_memberships").EnumerateArray())
                {
                    dgvUyelikler.Rows.Add(
                        ApiClient.Metin(m, "full_name"),
                        ApiClient.Metin(m, "package_name"),
                        Bicim.Tarih(ApiClient.Metin(m, "start_date")),
                        Bicim.Tarih(ApiClient.Metin(m, "end_date")),
                        Bicim.Para(ApiClient.Para(m, "total_price")),
                        Bicim.Para(ApiClient.Para(m, "paid_amount"))
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
                g.DrawString("SPOR SALONU — GÜN SONU RAPORU", fBaslik, Brushes.Black, x, y);
                y += 34;

                g.DrawString("Tarih: " + Bicim.Tarih(raporTarihi), fAlt, Brushes.Black, x, y);
                y += 20;
                g.DrawString("Kasiyer: " + ApiClient.UserName, fAlt, Brushes.Black, x, y);
                y += 30;

                g.DrawLine(Pens.Gray, x, y, x + genislik, y);
                y += 14;

                g.DrawString("ÜYELİK TAHSİLATI", fKalin, Brushes.Black, x, y);
                y += 22;
                g.DrawString(lblUyelikNakit.Text, fAlt, Brushes.Black, x, y); y += 18;
                g.DrawString(lblUyelikKart.Text, fAlt, Brushes.Black, x, y); y += 18;
                g.DrawString(lblUyelikHavale.Text, fAlt, Brushes.Black, x, y); y += 18;
                g.DrawString(lblUyelikToplam.Text, fKalin, Brushes.Black, x, y); y += 28;

                g.DrawString("BÜFE SATIŞI", fKalin, Brushes.Black, x, y);
                y += 22;
                g.DrawString(lblBufeNakit.Text, fAlt, Brushes.Black, x, y); y += 18;
                g.DrawString(lblBufeKart.Text, fAlt, Brushes.Black, x, y); y += 18;
                g.DrawString(lblBufeToplam.Text, fKalin, Brushes.Black, x, y); y += 28;

                g.DrawLine(Pens.Gray, x, y, x + genislik, y);
                y += 14;
                g.DrawString("GENEL TOPLAM: " + lblGenelToplam.Text, fKalin, Brushes.Black, x, y);
                y += 22;
                g.DrawString(lblGirisler.Text, fAlt, Brushes.Black, x, y);
                y += 30;

                g.DrawString("Bugün Satılan Üyelikler", fKalin, Brushes.Black, x, y);
                y += 24;

                foreach (DataGridViewRow satir in dgvUyelikler.Rows)
                {
                    string metin = satir.Cells[0].Value + "   " + satir.Cells[1].Value + "   " +
                                   satir.Cells[4].Value + "   (ödenen " + satir.Cells[5].Value + ")";
                    g.DrawString(metin, fAlt, Brushes.Black, x, y);
                    y += 18;

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
