using System.Drawing.Printing;
using ZXing;

namespace CamasirhaneKasa
{
    // Basılacak tek bir etiketin bilgileri
    public class Etiket
    {
        public string Barkod;
        public string Musteri;
        public string Hizmet;
        public string SiparisNo;
        public DateTime Tarih;
    }

    public class LabelPrintForm : Form
    {
        private List<Etiket> etiketler;
        private int sonrakiIndeks;

        private PrintDocument belge;
        private PrintPreviewControl onizleme;

        public LabelPrintForm(List<Etiket> liste)
        {
            etiketler = liste;

            Text = "Barkod Etiketleri — " + etiketler.Count + " adet";
            Size = new Size(700, 700);
            StartPosition = FormStartPosition.CenterParent;

            belge = new PrintDocument();
            // Etiket boyutu 60mm x 40mm (yüzde-inç biriminde)
            belge.DefaultPageSettings.PaperSize = new PaperSize("Etiket", 236, 157);
            belge.DefaultPageSettings.Margins = new Margins(10, 10, 10, 10);
            belge.PrintPage += belge_PrintPage;
            belge.BeginPrint += (s, e) => sonrakiIndeks = 0;

            onizleme = new PrintPreviewControl();
            onizleme.Document = belge;
            onizleme.Zoom = 2.0;
            onizleme.Dock = DockStyle.Fill;
            Controls.Add(onizleme);

            Panel altPanel = new Panel();
            altPanel.Height = 55;
            altPanel.Dock = DockStyle.Bottom;

            Button btnYazdir = new Button();
            btnYazdir.Text = "Yazdır";
            btnYazdir.SetBounds(15, 12, 130, 32);
            btnYazdir.BackColor = Color.FromArgb(30, 96, 145);
            btnYazdir.ForeColor = Color.White;
            btnYazdir.FlatStyle = FlatStyle.Flat;
            btnYazdir.Click += btnYazdir_Click;
            altPanel.Controls.Add(btnYazdir);

            Button btnKapat = new Button();
            btnKapat.Text = "Kapat";
            btnKapat.SetBounds(155, 12, 130, 32);
            btnKapat.Click += (s, e) => Close();
            altPanel.Controls.Add(btnKapat);

            Label bilgi = new Label();
            bilgi.Text = "Toplam " + etiketler.Count + " etiket basılacak.";
            bilgi.SetBounds(300, 20, 320, 20);
            bilgi.ForeColor = Color.Gray;
            altPanel.Controls.Add(bilgi);

            Controls.Add(altPanel);
        }

        private void btnYazdir_Click(object sender, EventArgs e)
        {
            using (PrintDialog secim = new PrintDialog())
            {
                secim.Document = belge;
                if (secim.ShowDialog() == DialogResult.OK)
                {
                    belge.Print();
                }
            }
        }

        // Code128 barkod görüntüsü üretir
        private Bitmap BarkodUret(string metin)
        {
            // Tam nitelikli yazildi: ZXing ad alaninda da benzer tipler var
            ZXing.Windows.Compatibility.BarcodeWriter yazici =
                new ZXing.Windows.Compatibility.BarcodeWriter();
            yazici.Format = BarcodeFormat.CODE_128;
            yazici.Options = new ZXing.Common.EncodingOptions
            {
                Width = 200,
                Height = 55,
                Margin = 2,
                PureBarcode = true
            };
            return yazici.Write(metin);
        }

        private void belge_PrintPage(object sender, PrintPageEventArgs e)
        {
            if (sonrakiIndeks >= etiketler.Count)
            {
                e.HasMorePages = false;
                return;
            }

            Etiket et = etiketler[sonrakiIndeks];
            Graphics g = e.Graphics;

            float x = e.MarginBounds.Left;
            float genislik = e.MarginBounds.Width;
            float y = e.MarginBounds.Top;

            StringFormat ortala = new StringFormat();
            ortala.Alignment = StringAlignment.Center;

            using (Font fUst = new Font("Segoe UI", 7))
            using (Font fMusteri = new Font("Segoe UI", 10, FontStyle.Bold))
            using (Font fHizmet = new Font("Segoe UI", 8))
            using (Font fBarkodYazi = new Font("Consolas", 8))
            using (Font fTarih = new Font("Segoe UI", 7))
            {
                g.DrawString("ÇAMAŞIRHANE", fUst, Brushes.Gray,
                    new RectangleF(x, y, genislik, 12), ortala);
                y += 13;

                g.DrawString(et.Musteri, fMusteri, Brushes.Black,
                    new RectangleF(x, y, genislik, 16), ortala);
                y += 17;

                g.DrawString(et.Hizmet, fHizmet, Brushes.Black,
                    new RectangleF(x, y, genislik, 14), ortala);
                y += 16;

                using (Bitmap barkod = BarkodUret(et.Barkod))
                {
                    float bGenislik = Math.Min(genislik, barkod.Width);
                    float bX = x + (genislik - bGenislik) / 2;
                    g.DrawImage(barkod, bX, y, bGenislik, 42);
                    y += 44;
                }

                g.DrawString(et.Barkod, fBarkodYazi, Brushes.Black,
                    new RectangleF(x, y, genislik, 14), ortala);
                y += 15;

                g.DrawString(et.Tarih.ToString("dd.MM.yyyy"), fTarih, Brushes.Gray,
                    new RectangleF(x, y, genislik, 12), ortala);
            }

            sonrakiIndeks++;
            e.HasMorePages = sonrakiIndeks < etiketler.Count;
        }
    }
}
