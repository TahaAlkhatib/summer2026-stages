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

    public partial class LabelPrintForm : Form
    {
        private List<Etiket> etiketler = new List<Etiket>();
        private int sonrakiIndeks;

        // Tasarımcının formu açabilmesi için parametresiz kurucu gerekli
        public LabelPrintForm()
        {
            InitializeComponent();

            // Etiket boyutu 60mm x 40mm (yüzde-inç biriminde)
            belge.DefaultPageSettings.PaperSize = new PaperSize("Etiket", 236, 157);
            belge.DefaultPageSettings.Margins = new Margins(10, 10, 10, 10);
            onizleme.Document = belge;
        }

        public LabelPrintForm(List<Etiket> liste) : this()
        {
            etiketler = liste;
            Text = "Barkod Etiketleri — " + etiketler.Count + " adet";
            lblBilgi.Text = "Toplam " + etiketler.Count + " etiket basılacak.";
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

        private void btnKapat_Click(object sender, EventArgs e)
        {
            Close();
        }

        private void belge_BeginPrint(object sender, PrintEventArgs e)
        {
            sonrakiIndeks = 0;
        }

        // Code128 barkod görüntüsü üretir
        private Bitmap BarkodUret(string metin)
        {
            // Tam nitelikli yazıldı: ZXing ad alanında da benzer tipler var
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
